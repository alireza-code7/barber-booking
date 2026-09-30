<?php

require_once "./header.php";

require_once "./db.php";

try{
    $stmt = $pdo->query("SELECT * FROM gallery WHERE is_active = 1 ");
    $gallery = $stmt->fetchAll();

    echo json_encode(['status'=> true, 'gallery'=> $gallery]);

}
catch(PDOException $e){
    echo json_encode(['status'=> false,'message'=> 'خطا در دریافت خدمات'. $e->getMessage()]);
}