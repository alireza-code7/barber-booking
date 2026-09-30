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

$user_id = $_GET['user_id'] ?? 0;

if (empty($user_id)) {
    echo json_encode(["success" => false, "message" => "شناسه کاربر ارسال نشده"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT id, message, is_admin, created_at 
        FROM messages 
        WHERE user_id = ? 
        ORDER BY created_at ASC
    ");
    $stmt->execute([$user_id]);
    $messages = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "messages" => $messages
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>