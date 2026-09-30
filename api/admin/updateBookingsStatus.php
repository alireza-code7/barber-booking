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

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = $data["booking_id"] ?? 0;
$status = $data["status"] ?? "";

if (empty($booking_id) || empty($status)) {
    echo json_encode(["success" => false, "message" => "اطلاعات ناقص"]);
    exit;
}

if (!in_array($status, ["approved", "rejected"])) {
    echo json_encode(["success" => false, "message" => "وضعیت نامعتبر"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // ۱. به‌روزرسانی وضعیت رزرو
    $stmt = $pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $stmt->execute([$status, $booking_id]);

    // ۲. اگه رد شد، تایم رو آزاد کن
    if ($status === "rejected") {
        $stmt = $pdo->prepare("
            UPDATE working_times 
            SET is_booked = FALSE, booking_id = NULL 
            WHERE booking_id = ?
        ");
        $stmt->execute([$booking_id]);
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "وضعیت رزرو به‌روز شد"
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>