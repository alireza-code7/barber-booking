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

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? 0;

if (empty($user_id)) {
    echo json_encode(["success" => false, "message" => "شناسه کاربر ارسال نشده"]);
    exit;
}

try {
    // فقط پیام‌هایی که کاربر فرستاده (is_admin = 0) رو خونده شده کن
    $stmt = $pdo->prepare("
        UPDATE messages 
        SET is_read = 1 
        WHERE user_id = ? AND is_admin = 0 AND is_read = 0
    ");
    $stmt->execute([$user_id]);

    echo json_encode([
        "success" => true,
        "message" => "پیام‌ها به عنوان خوانده شده علامت‌گذاری شدند"
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>