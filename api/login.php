<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['email']) || !isset($input['password'])) {
    echo json_encode(["status" => "error", "message" => "Please enter both username/email and password."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `email` = ? OR `username` = ? LIMIT 1");
    $stmt->execute([$input['email'], $input['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($input['password'], $user['password'])) {
        echo json_encode([
            "status" => "success",
            "message" => "Login successful!",
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "email" => $user['email'],
                "name" => $user['full_name'],
                "role" => $user['role']
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid credentials. Please try again."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Login failed: " . $e->getMessage()]);
}
?>
