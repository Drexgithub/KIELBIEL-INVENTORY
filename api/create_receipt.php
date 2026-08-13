<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['recNo'])) {
    echo json_encode(["status" => "error", "message" => "Invalid transaction payload"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insert receipt
    $stmt = $pdo->prepare("INSERT INTO `receipts` (`receipt_no`, `invoice_no`, `customer_name`, `cashier_name`, `payment_method`, `subtotal`, `discount`, `tax`, `grand_total`, `created_at`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Completed')");
    $stmt->execute([
        $input['recNo'],
        $input['invNo'],
        $input['customer'],
        $input['cashier'],
        $input['payMethod'],
        $input['subtotal'],
        $input['discount'],
        $input['tax'],
        $input['grand']
    ]);

    // 2. Insert items and update stock
    foreach ($input['items'] as $item) {
        $stmtItem = $pdo->prepare("INSERT INTO `receipt_items` (`receipt_no`, `item_desc`, `quantity`, `unit_price`, `line_total`) VALUES (?, ?, ?, ?, ?)");
        $stmtItem->execute([
            $input['recNo'],
            $item['desc'],
            $item['qty'],
            $item['price'],
            $item['total']
        ]);

        // Automatically deduct quantity from inventory if product exists
        $stmtStock = $pdo->prepare("UPDATE `products` SET `quantity` = GREATEST(0, `quantity` - ?) WHERE `name` = ? OR `name` LIKE ?");
        $stmtStock->execute([$item['qty'], $item['desc'], '%' . $item['desc'] . '%']);
    }

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Receipt generated and saved to MySQL!"]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
