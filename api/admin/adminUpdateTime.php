<?php
require_once "../header.php";
require_once "../db.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "لطفاً وارد شوید"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? 0;
$date = $data["date"] ?? "";
$time_start = $data["time_start"] ?? "";
$time_end = $data["time_end"] ?? "";

if (empty($id) || empty($date) || empty($time_start) || empty($time_end)) {
    echo json_encode(["success" => false, "message" => "همه فیلدها الزامی هستند"]);
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
    // چک کن که تایم رزرو نشده باشه
    $checkStmt = $pdo->prepare("SELECT is_booked FROM working_times WHERE id = ?");
    $checkStmt->execute([$id]);
    $time = $checkStmt->fetch();

    if ($time && $time['is_booked']) {
        echo json_encode(["success" => false, "message" => "این تایم رزرو شده و قابل ویرایش نیست"]);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE working_times 
        SET date = ?, time_start = ?, time_end = ? 
        WHERE id = ?
    ");
    $stmt->execute([$date, $time_start, $time_end, $id]);

    echo json_encode(["success" => true, "message" => "تایم با موفقیت ویرایش شد"]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>