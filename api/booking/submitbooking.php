<?php
require_once "../header.php";
require_once "../db.php";

session_start();


if (!isset($_SESSION["user_id"])) {
    echo json_encode(["status" => false, "message" => "لطفاً وارد شوید"]);
    exit;
}

$user_id = $_SESSION["user_id"];

// ============================
// ۲. دریافت داده‌ها از درخواست
// ============================
$date = $_POST["date"] ?? "";
$time_id = filter_var($_POST["time_id"] ?? null, FILTER_VALIDATE_INT);

if ($time_id === false || $time_id <= 0) {
    echo json_encode([
        "status" => false,
        "message" => "زمان انتخاب‌شده معتبر نیست"
    ]);
    exit;
}
$services = json_decode($_POST["services"] ?? "[]", true);

if (!is_array($services) || empty($services)) {
    echo json_encode([
        "status" => false,
        "message" => "سرویس‌های انتخاب‌شده معتبر نیستند"
    ]);
    exit;
}
$services = array_unique($services);

foreach ($services as $service_id) {

    if (!filter_var($service_id, FILTER_VALIDATE_INT) || $service_id <= 0) {
        echo json_encode([
            "status" => false,
            "message" => "یکی از سرویس‌های انتخاب‌شده معتبر نیست"
        ]);
        exit;
    }
}
foreach ($services as $service_id) {

    $stmt = $pdo->prepare("
        SELECT id
        FROM services
        WHERE id = ? AND is_active = 1
    ");

    $stmt->execute([$service_id]);

    if (!$stmt->fetch()) {
        echo json_encode([
            "status" => false,
            "message" => "یکی از سرویس‌های انتخاب‌شده معتبر نیست"
        ]);
        exit;
    }
}
$receipt = $_FILES["receipt"] ?? null;

// ============================
// ۳. اعتبارسنجی
// ============================
if (empty($date) || empty($time_id) || empty($services) || !$receipt) {
    echo json_encode(["status" => false, "message" => "همه فیلدها الزامی هستند"]);
    exit;
}

// ============================
// ۴. آپلود عکس
// ============================
$uploadDir = "../images/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// بررسی خطای آپلود
if ($receipt["error"] !== UPLOAD_ERR_OK) {
    echo json_encode([
        "status" => false,
        "message" => "خطا در آپلود عکس"
    ]);
    exit;
}

// محدودیت حجم: 5 مگابایت
if ($receipt["size"] > 5 * 1024 * 1024) {
    echo json_encode([
        "status" => false,
        "message" => "حجم عکس نباید بیشتر از 5 مگابایت باشد"
    ]);
    exit;
}

// تشخیص نوع واقعی فایل
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($receipt["tmp_name"]);

$allowedTypes = [
    "image/jpeg" => "jpg",
    "image/png"  => "png",
    "image/webp" => "webp"
];

if (!isset($allowedTypes[$mime])) {
    echo json_encode([
        "status" => false,
        "message" => "فرمت عکس مجاز نیست"
    ]);
    exit;
}

// مطمئن شو واقعاً تصویر است
if (@getimagesize($receipt["tmp_name"]) === false) {
    echo json_encode([
        "status" => false,
        "message" => "فایل انتخاب‌شده تصویر معتبر نیست"
    ]);
    exit;
}

// ساخت اسم کاملاً تصادفی
$imageName = bin2hex(random_bytes(16)) . "." . $allowedTypes[$mime];

$uploadPath = $uploadDir . $imageName;

if (!move_uploaded_file($receipt["tmp_name"], $uploadPath)) {
    echo json_encode([
        "status" => false,
        "message" => "خطا در ذخیره عکس"
    ]);
    exit;
}

// ============================
// ۵. ذخیره در دیتابیس (با تراکنش)
// ============================
try {
    $pdo->beginTransaction();

   $stmt = $pdo->prepare("
    SELECT date, time_start, time_end, is_booked
    FROM working_times
    WHERE id = ?
");

$stmt->execute([$time_id]);

$time = $stmt->fetch();

if (!$time) {
    echo json_encode([
        "status" => false,
        "message" => "زمان انتخاب‌شده وجود ندارد"
    ]);
    exit;
}

if ($time["is_booked"]) {
    echo json_encode([
        "status" => false,
        "message" => "این زمان قبلاً رزرو شده است"
    ]);
    exit;
}
    

    // ۵-۱. ثبت در جدول bookings
    $stmt = $pdo->prepare("INSERT INTO bookings (user_id, receipt_image, status,booking_date,booking_time_start,booking_time_end) VALUES (?, ?, 'pending',?,?,?)");
    $stmt->execute([$user_id, $imageName,$time['date'],$time['time_start'],$time['time_end']]);
    $booking_id = $pdo->lastInsertId();

    // ۵-۲. ثبت سرویس‌ها در booking_services
    $stmt = $pdo->prepare("INSERT INTO booking_services (booking_id, service_id) VALUES (?, ?)");
    foreach ($services as $service_id) {
        $stmt->execute([$booking_id, $service_id]);
    }

    // ۵-۳. رزرو کردن تایم (غیرفعال کردنش)
    $stmt = $pdo->prepare("
    UPDATE working_times
    SET is_booked = TRUE, booking_id = ?
    WHERE id = ? AND is_booked = FALSE
");

$stmt->execute([$booking_id, $time_id]);

if ($stmt->rowCount() === 0) {
    throw new Exception("این زمان قبلاً رزرو شده است");
}

    $pdo->commit();

    echo json_encode([
        "status" => true,
        "message" => "رزرو با موفقیت ثبت شد",
        "booking_id" => $booking_id
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        "status" => false,
        "message" => "خطا در ثبت رزرو: "
    ]);
}
?>