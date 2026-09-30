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

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? 0;
$is_active = $data["is_active"] ?? 0;

if (empty($id)) {
    echo json_encode(["success" => false, "message" => "شناسه ارسال نشده"]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE gallery SET is_active = ? WHERE id = ?");
    $stmt->execute([$is_active, $id]);

    echo json_encode(["success" => true, "message" => "وضعیت با موفقیت تغییر کرد"]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>