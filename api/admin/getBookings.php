<?php
require_once "../header.php";
require_once "../db.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "لطفاً وارد شوید"]);
    exit;
}

$check = $pdo->prepare("SELECT is_admin FROM users WHERE id = ?");
$check->execute([$_SESSION["user_id"]]);
$user = $check->fetch();

if (!$user || !$user['is_admin']) {
    echo json_encode(["success" => false, "message" => "دسترسی غیرمجاز"]);
    exit;
}

try {
    $stmt = $pdo->query("
        SELECT 
            b.id,
            b.user_id,
            b.receipt_image,
            b.booking_date,
            b.booking_time_start,
            b.booking_time_end,
            b.status,
            u.name AS user_name,
            u.phone,
            
            GROUP_CONCAT(s.title SEPARATOR ' - ') AS services,
            COALESCE(SUM(s.price), 0) AS total_price
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        
        LEFT JOIN booking_services bs ON b.id = bs.booking_id
        LEFT JOIN services s ON bs.service_id = s.id
        GROUP BY b.id
        ORDER BY b.id DESC
    ");
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