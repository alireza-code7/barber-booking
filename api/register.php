<?php
require_once "./header.php";
session_start();

require_once "./db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"];
$phone = $data["phone"];
$password = $data["password"];

if(empty( $name )||empty( $phone )||empty( $password )){
    echo json_encode(["status"=> false,"message"=> "همه فیلد ها الزامی هستند"], JSON_UNESCAPED_UNICODE);
    exit;
}
if(strlen($password) < 8){
    echo json_encode(["status"=> false,"message"=> "رمز عبور حداقل 8 کاراکتر باشد"], JSON_UNESCAPED_UNICODE);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try{

    $check = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
    $check->execute([$phone]);

    if($check->rowCount() > 0){
        echo json_encode(["status"=> false,"message"=> "کاربر از قبل وجود دارد"], JSON_UNESCAPED_UNICODE);
        
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO users (name,phone,password) VALUES (?,?,?)");
    $stmt->execute([$name,$phone,$hashedPassword]);

    $_SESSION['user_id'] = $pdo->lastInsertId();
    $userId = $pdo->lastInsertId();

    echo json_encode(["status"=> true,"message"=> "با موفقیت ثبت شد","user"=>['id'=>$userId,'name'=>$name,'phone'=>$phone]] , JSON_UNESCAPED_UNICODE);

}catch(PDOException $e){
    echo json_encode(["status"=> false,"message"=> "خطا در ثبت نام :".$e->getMessage()], JSON_UNESCAPED_UNICODE);
}