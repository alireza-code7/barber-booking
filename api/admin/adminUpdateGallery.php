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

$id = $_POST["id"] ?? 0;
$title = $_POST["title"] ?? "";
$is_active = $_POST["is_active"] ?? 1;
$image = $_FILES["image"] ?? null;

if (empty($id) || empty($title)) {
    echo json_encode(["success" => false, "message" => "شناسه و عنوان الزامی هستند"]);
    exit;
}

try {
    // اگر عکس جدید اومده، آپلود کن
    if ($image && $image["error"] === 0) {
        $uploadDir = "../images/";
        $imageName = time() . "_" . basename($image["name"]);
        $uploadPath = $uploadDir . $imageName;

        if (!move_uploaded_file($image["tmp_name"], $uploadPath)) {
            echo json_encode(["success" => false, "message" => "خطا در آپلود عکس"]);
            exit;
        }

        // عکس قدیمی رو پاک کن (اختیاری)
        $stmt = $pdo->prepare("SELECT url FROM gallery WHERE id = ?");
        $stmt->execute([$id]);
        $old = $stmt->fetch();
        if ($old && file_exists($uploadDir . $old['url'])) {
            unlink($uploadDir . $old['url']);
        }

        $stmt = $pdo->prepare("UPDATE gallery SET title = ?, url = ?, is_active = ? WHERE id = ?");
        $stmt->execute([$title, $imageName, $is_active, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE gallery SET title = ?, is_active = ? WHERE id = ?");
        $stmt->execute([$title, $is_active, $id]);
    }

    echo json_encode(["success" => true, "message" => "گالری با موفقیت ویرایش شد"]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "خطا: " . $e->getMessage()
    ]);
}
?>