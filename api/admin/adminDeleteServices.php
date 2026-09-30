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
$id = $data["id"] ?? 0;

if (empty($id)) {
    echo json_encode(["success" => false, "message" => "شناسه سرویس ارسال نشده"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true, "message" => "سرویس با موفقیت حذف شد"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "خطا: " . $e->getMessage()]);
}
?>