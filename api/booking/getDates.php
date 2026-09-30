<?php
require_once "../header.php";
require_once "../db.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "لطفاً وارد شوید"]);
    exit;
}

try {
    $stmt = $pdo->query("
        SELECT DISTINCT date 
        FROM working_times 
        WHERE is_booked = FALSE 
        ORDER BY date ASC
    ");
    $dates = $stmt->fetchAll();
    $dateList = array_column($dates, 'date');

    echo json_encode([
        "success" => true,
        "dates" => $dateList
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا در دریافت تاریخ‌ها: " . $e->getMessage()
    ]);
}
?>