<?php

require_once "../header.php";

session_start();
require_once '../db.php';


if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => false, 'message' => 'لطفاً وارد شوید']);
    exit;
}

$user_id = $_SESSION['user_id'];


try {
    $stmt = $pdo->prepare("
        SELECT id, message, is_admin, is_read, created_at 
        FROM messages 
        WHERE user_id = ? 
        ORDER BY created_at ASC
    ");
    $stmt->execute([$user_id]);
    $messages = $stmt->fetchAll();

   
    $updateStmt = $pdo->prepare("
        UPDATE messages 
        SET is_read = 1 
        WHERE user_id = ? AND is_admin = 1 AND is_read = 0
    ");
    $updateStmt->execute([$user_id]);

    echo json_encode([
        'status' => true,
        'messages' => $messages
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => false,
        'message' => 'خطا در دریافت پیام‌ها: ' . $e->getMessage()
    ]);
}
?>