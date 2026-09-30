<?php

require_once "./header.php";
require_once "./db.php";

try {
    $number = $pdo->prepare("SELECT name,number FROM card WHERE id=1");
    $number->execute();

    $res = $number->fetch();

    if ($res) {
        echo json_encode(["status" => true, "name" => $res['name'], "number" => $res["number"]]);
    } else {
        echo json_encode(["status"=> false,"message"=> "شماره کارت دریافت نشد"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status"=> false,"message"=> $e->getMessage()]);
}