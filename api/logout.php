<?php 

require_once "./header.php";
session_start();
session_destroy();

echo json_encode(['status'=> true,'message'=>"خروج موفق"]);