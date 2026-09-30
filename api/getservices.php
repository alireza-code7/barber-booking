<?php

require_once "./header.php"; 

require_once "./db.php";

try{
    $stmt = $pdo->query("SELECT * FROM services WHERE is_active = 1 ");
    $services = $stmt->fetchAll();

    echo json_encode(['status'=> true, 'services'=> $services]);

}
catch(PDOException $e){
    echo json_encode(['status'=> false,'message'=> 'خطا در دریافت خدمات'. $e->getMessage()]);
}