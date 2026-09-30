<?php
require_once "./header.php";
session_start();

require_once "./db.php";

$data = json_decode(file_get_contents("php://input"), true);

$phone = $data["phone"];
$password = $data["password"];

if(empty( $phone )||empty( $password )){
    echo json_encode(["status"=> false,"message"=> "همه فیلد ها الزامی هستند"]);
    exit;
}

if(strlen($password) < 8){
    echo json_encode(["status"=> false,"message"=> "رمز عبور حداقل 8 کاراکتر باشد"]);
    exit;
}


try{

    $check = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
    $check->execute([$phone]);
    $user = $check->fetch();

    if(!$user){
        echo json_encode(["status"=> false,"message"=>"کاربر پیدا نشد"]);
        exit;
    }

    if(!password_verify($password, $user["password"])){
        echo json_encode(["status"=> false,"message"=>"رمز عبور اشتباه است"]);
        exit;
    }
    session_regenerate_id(true);

    $_SESSION['user_id']= $user['id'];
    
    echo json_encode(["status"=>true,"message"=> "با موفقیت وارد شد","user"=>['id'=>$user['id'],'name'=>$user['name'],'phone'=>$user['phone'] ,'is_admin'=>$user['is_admin']]]);

   

}catch(PDOException $e){
    echo json_encode(["status"=> false,"message"=> "خطا در ثبت نام :".$e->getMessage()]);
}