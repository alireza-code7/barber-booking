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
    $stmt = $pdo->query("
        SELECT id, date, time_start, time_end, is_booked 
        FROM working_times 
        ORDER BY date DESC, time_start DESC
    ");
    $times = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "times" => $times
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا در دریافت تایم‌ها: " . $e->getMessage()
    ]);
}
?>