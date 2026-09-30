<?php
require_once "../header.php";
require_once "../db.php";

session_start();

$check = $pdo->prepare("SELECT is_admin FROM users WHERE id = ?");
$check->execute([$_SESSION["user_id"]]);
$user = $check->fetch();

if (!$user || !$user['is_admin']) {
    echo json_encode(["success" => false, "message" => "دسترسی غیرمجاز"]);
    exit;
}

try {
    $stmt = $pdo->query("
        SELECT id, title, description, price, icon, is_active 
        FROM services 
        ORDER BY id ASC
    ");
    $services = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "services" => $services
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا در دریافت سرویس‌ها: " . $e->getMessage()
    ]);
}
?>