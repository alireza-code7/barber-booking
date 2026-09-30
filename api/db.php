<?php
$env = parse_ini_file(__DIR__ . '/.env');
$host = $env['DB_HOST'];
$dbname = $env['DB_NAME'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];


try {

$pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4",$user,$password);

$pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("خطا در اتصال به دیتابیس". $e->getMessage());
}