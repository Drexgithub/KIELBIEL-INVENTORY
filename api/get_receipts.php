<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    $stmt = $pdo->query("SELECT * FROM `receipts` ORDER BY `created_at` DESC");
    $receipts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch items for each receipt
    $result = [];
    foreach ($receipts as $rec) {
        $stmtItems = $pdo->prepare("SELECT * FROM `receipt_items` WHERE `receipt_no` = ?");
        $stmtItems->execute([$rec['receipt_no']]);
        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        $formattedItems = [];
        foreach ($items as $item) {
            $formattedItems[] = [
                'desc' => $item['item_desc'],
                'qty' => (int)$item['quantity'],
                'price' => '₱' . number_format($item['unit_price'], 2),
                'total' => '₱' . number_format($item['line_total'], 2)
            ];
        }

        $result[$rec['receipt_no']] = [
            'recNo' => $rec['receipt_no'],
            'invNo' => $rec['invoice_no'],
            'date' => $rec['created_at'],
            'cashier' => $rec['cashier_name'],
            'customer' => $rec['customer_name'],
            'subtotal' => '₱' . number_format($rec['subtotal'], 2),
            'discount' => '-₱' . number_format($rec['discount'], 2),
            'tax' => '₱' . number_format($rec['tax'], 2),
            'grand' => '₱' . number_format($rec['grand_total'], 2),
            'payMethod' => $rec['payment_method'],
            'paid' => '₱' . number_format($rec['grand_total'], 2),
            'change' => '₱0.00',
            'barcode' => $rec['receipt_no'] . '00' . rand(1000, 9999),
            'items' => $formattedItems,
            'status' => $rec['status']
        ];
    }

    echo json_encode(["status" => "success", "data" => $result]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
