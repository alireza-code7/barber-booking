<?php
require_once "../header.php";
require_once "../db.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "لطفاً وارد شوید"]);
    exit;
}

$user_id = $_SESSION["user_id"];

$check = $pdo->prepare("SELECT is_admin FROM users WHERE id = ?");
$check->execute([$user_id]);
$user = $check->fetch();

if (!$user || !$user['is_admin']) {
    echo json_encode(["success" => false, "message" => "دسترسی غیرمجاز"]);
    exit;
}

try {
    
    $total = $pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
    $pending = $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")->fetchColumn();
    $approved = $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'approved'")->fetchColumn();
    $rejected = $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'rejected'")->fetchColumn();
    $users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();

    
    $stmt = $pdo->query("
        SELECT 
            b.id,
            b.status,
            b.booking_date,
            b.booking_time_start,
            b.booking_time_end,
            u.name AS user_name,
            GROUP_CONCAT(s.title SEPARATOR ' - ') AS services
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN booking_services bs ON b.id = bs.booking_id
        LEFT JOIN services s ON bs.service_id = s.id
        GROUP BY b.id
        ORDER BY b.id DESC
        LIMIT 5
    ");
    $recent = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "stats" => [
            "totalBookings" => (int) $total,
            "pendingBookings" => (int) $pending,
            "approvedBookings" => (int) $approved,
            "rejectedBookings" => (int) $rejected,
            "totalUsers" => (int) $users,
        ],
        "recentBookings" => $recent,
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>