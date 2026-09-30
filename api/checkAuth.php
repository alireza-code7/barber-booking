<?php

require_once "./header.php";
session_start();

require_once "./db.php";

if(!isset($_SESSION["user_id"])){
    echo json_encode(['loggedIn'=>false]);
    exit;
}

try{
    $stmt = $pdo->prepare('SELECT id,name,phone,is_admin FROM users WHERE id=?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC); 
    if($user){
        echo json_encode(['loggedIn'=>true,"user"=>['id'=>$user['id'],'name'=>$user['name'],'phone'=>$user['phone'],'is_admin'=>$user['is_admin']]]);
    }else{
        echo json_encode(['loggedIn'=>false]);
    }
}catch(PDOException $e){
    echo json_encode(['loggedIn'=>false]);
}