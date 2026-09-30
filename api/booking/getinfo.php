<?php

session_start();


require_once "../header.php";

require_once "../db.php";

if(!isset($_SESSION["user_id"])){
    echo json_encode(["status"=>false, "message"=>"لطفا وارد شوید"]);
    exit;
}

try{

    $info = $pdo->prepare("SELECT name,phone FROM users WHERE id=?");
    $info->execute([$_SESSION["user_id"]]);
    $user = $info->fetch();

    if(!$user){
        echo json_encode(["status"=>false,"message"=> "کاربر پیدا نشد"]);
        exit;
    }

    echo json_encode(["status"=>true,"user"=>$user]);

} catch(PDOException $e){

    echo json_encode(["status"=>false,"message"=>$e->getMessage()]);    

}