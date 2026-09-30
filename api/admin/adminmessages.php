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
$admin = $check->fetch();

if (!$admin || !$admin['is_admin']) {
    echo json_encode(["success" => false, "message" => "دسترسی غیرمجاز"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? 0;
$message = trim($data['message'] ?? '');

if (empty($user_id) || empty($message)) {
    echo json_encode(["success" => false, "message" => "همه فیلدها الزامی هستند"]);
    exit;
}

// چک کردن وجود کاربر
$checkUser = $pdo->prepare("SELECT id FROM users WHERE id = ?");
$checkUser->execute([$user_id]);
if (!$checkUser->fetch()) {
    echo json_encode(["success" => false, "message" => "کاربر پیدا نشد"]);
    exit;
}

function gregorianToJalali($g_y, $g_m, $g_d) {
    $g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    $j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    $gy = $g_y - 1600;
    $gm = $g_m - 1;
    $gd = $g_d - 1;

    $g_day_no = 365 * $gy + (int)(($gy + 3) / 4) - (int)(($gy + 99) / 100) + (int)(($gy + 399) / 400);

    for ($i = 0; $i < $gm; ++$i) {
        $g_day_no += $g_days_in_month[$i];
    }

    if ($gm > 1 && (($g_y % 4 == 0 && $g_y % 100 != 0) || ($g_y % 400 == 0))) {
        $g_day_no++;
    }

    $g_day_no += $gd;

    $j_day_no = $g_day_no - 79;
    $j_np = (int)($j_day_no / 12053);
    $j_day_no %= 12053;

    $jy = 979 + 33 * $j_np + 4 * (int)($j_day_no / 1461);
    $j_day_no %= 1461;

    if ($j_day_no >= 366) {
        $jy += (int)(($j_day_no - 1) / 365);
        $j_day_no = ($j_day_no - 1) % 365;
    }

    for ($i = 0; $i < 11 && $j_day_no >= $j_days_in_month[$i]; ++$i) {
        $j_day_no -= $j_days_in_month[$i];
    }

    return [$jy, $i + 1, $j_day_no + 1];
}


$timezone = new DateTimeZone('Asia/Tehran');
$now = new DateTime('now', $timezone);

$g_y = (int)$now->format('Y');
$g_m = (int)$now->format('m');
$g_d = (int)$now->format('d');

$jalali = gregorianToJalali($g_y, $g_m, $g_d);
$jalali_date = $jalali[0] . '/' . str_pad($jalali[1], 2, '0', STR_PAD_LEFT) . '/' . str_pad($jalali[2], 2, '0', STR_PAD_LEFT);
$jalali_time = $now->format('H:i:s');
$created_at = $jalali_date . ' ' . $jalali_time;

try {
    // تولید زمان شمسی

    $stmt = $pdo->prepare("
        INSERT INTO messages (user_id, message, is_admin, created_at) 
        VALUES (?, ?, 1, ?)
    ");
    $stmt->execute([$user_id, $message, $created_at]);

    echo json_encode([
        "success" => true,
        "message" => "پیام با موفقیت ارسال شد",
        "message_id" => $pdo->lastInsertId()
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>