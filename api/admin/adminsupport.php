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

try {
    // دریافت لیست کاربرانی که حداقل یک پیام ارسال کرده‌اند
    $stmt = $pdo->prepare("
        SELECT 
            u.id AS user_id,
            u.name AS user_name,
            (SELECT message FROM messages WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) AS last_message,
            (SELECT created_at FROM messages WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) AS last_time,
            (SELECT COUNT(*) FROM messages WHERE user_id = u.id AND is_admin = 0 AND is_read = 0) AS unread_count
        FROM users u
        WHERE EXISTS (SELECT 1 FROM messages WHERE user_id = u.id)
        ORDER BY last_time DESC
    ");
    $stmt->execute();
    $chats = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "chats" => $chats
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>