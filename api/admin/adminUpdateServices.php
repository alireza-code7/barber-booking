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
$title = $data["title"] ?? "";
$description = $data["description"] ?? "";
$price = $data["price"] ?? 0;
$icon_class = $data["icon_class"] ?? "fas fa-cut";
$is_active = $data["is_active"] ?? 1;

if (empty($id) || empty($title) || empty($price)) {
    echo json_encode(["success" => false, "message" => "اطلاعات ناقص"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE services 
        SET title = ?, description = ?, price = ?, icon = ?, is_active = ? 
        WHERE id = ?
    ");
    $stmt->execute([$title, $description, $price, $icon_class, $is_active, $id]);

    echo json_encode(["success" => true, "message" => "سرویس با موفقیت ویرایش شد"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "خطا: " . $e->getMessage()]);
}
?>