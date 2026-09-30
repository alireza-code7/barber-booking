<?php
require_once "../header.php";
require_once "../db.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "لطفاً وارد شوید"]);
    exit;
}

// چک کردن ادمین
$check = $pdo->prepare("SELECT is_admin FROM users WHERE id = ?");
$check->execute([$_SESSION["user_id"]]);
$user = $check->fetch();

if (!$user || !$user['is_admin']) {
    echo json_encode(["success" => false, "message" => "دسترسی غیرمجاز"]);
    exit;
}

$title = $_POST["title"] ?? "";
$is_active = $_POST["is_active"] ?? 1;
$image = $_FILES["image"] ?? null;

if (empty($title) || !$image) {
    echo json_encode(["success" => false, "message" => "عنوان و عکس الزامی هستند"]);
    exit;
}

$uploadDir = "../images/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// بررسی خطای آپلود
if ($image["error"] !== UPLOAD_ERR_OK) {
    echo json_encode([
        "success" => false,
        "message" => "خطا در آپلود عکس"
    ]);
    exit;
}

// حداکثر حجم: 5 مگابایت
if ($image["size"] > 5 * 1024 * 1024) {
    echo json_encode([
        "success" => false,
        "message" => "حجم عکس نباید بیشتر از 5 مگابایت باشد"
    ]);
    exit;
}

// تشخیص نوع واقعی فایل
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($image["tmp_name"]);

$allowedTypes = [
    "image/jpeg" => "jpg",
    "image/png"  => "png",
    "image/webp" => "webp"
];

if (!isset($allowedTypes[$mime])) {
    echo json_encode([
        "success" => false,
        "message" => "فرمت عکس مجاز نیست"
    ]);
    exit;
}

// بررسی اینکه فایل واقعاً تصویر باشد
if (@getimagesize($image["tmp_name"]) === false) {
    echo json_encode([
        "success" => false,
        "message" => "فایل انتخاب‌شده تصویر معتبر نیست"
    ]);
    exit;
}

// ساخت اسم تصادفی برای فایل
$imageName = bin2hex(random_bytes(16)) . "." . $allowedTypes[$mime];

$uploadPath = $uploadDir . $imageName;

// ذخیره فایل
if (!move_uploaded_file($image["tmp_name"], $uploadPath)) {
    echo json_encode([
        "success" => false,
        "message" => "خطا در ذخیره عکس"
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO gallery (title, url, is_active) VALUES (?, ?, ?)");
    $stmt->execute([$title, $imageName, $is_active]);

    echo json_encode(["success" => true, "message" => "عکس با موفقیت اضافه شد"]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>