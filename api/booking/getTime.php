<?php
require_once "../header.php";
require_once "../db.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "لطفاً وارد شوید"]);
    exit;
}

$date = $_GET['date'] ?? '';

if (empty($date)) {
    echo json_encode(["success" => false, "message" => "تاریخ را انتخاب کنید"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT id, time_start, time_end 
        FROM working_times 
        WHERE date = ? AND is_booked = FALSE
        ORDER BY time_start ASC
    ");
    $stmt->execute([$date]);
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