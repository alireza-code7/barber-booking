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
    $stmt = $pdo->query("SELECT id, title, url, is_active FROM gallery ORDER BY id DESC");
    $gallery = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "gallery" => $gallery
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا در دریافت گالری: " . $e->getMessage()
    ]);
}
?>