<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['recNo'])) {
    echo json_encode(["status" => "error", "message" => "Missing Receipt Number"]);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt1 = $pdo->prepare("DELETE FROM `receipt_items` WHERE `receipt_no` = ?");
    $stmt1->execute([$input['recNo']]);

    $stmt2 = $pdo->prepare("DELETE FROM `receipts` WHERE `receipt_no` = ?");
    $stmt2->execute([$input['recNo']]);

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Receipt deleted from MySQL!"]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
