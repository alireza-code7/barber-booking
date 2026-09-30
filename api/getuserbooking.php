<?php
require_once "./header.php";
require_once "./db.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "لطفاً وارد شوید"]);
    exit;
}

$user_id = $_SESSION["user_id"];

try {
    $stmt = $pdo->prepare("
        SELECT 
            b.id,
            b.status,
            b.receipt_image,
            b.booking_date,
            b.booking_time_start,
            b.booking_time_end,
            GROUP_CONCAT(s.title SEPARATOR ' - ') AS services,
            SUM(s.price) AS total_price
        FROM bookings b
        JOIN booking_services bs ON b.id = bs.booking_id
        JOIN services s ON bs.service_id = s.id
        WHERE b.user_id = ?
        GROUP BY b.id
        ORDER BY b.booking_date DESC
    ");
    $stmt->execute([$user_id]);
    $bookings = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "bookings" => $bookings
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>