<?php
error_reporting(0);
$host = "localhost";
$username = "root";
$password = "";
$dbname = "kiel_biel_inventory";

try {
    // 1. Connect to MySQL server without database selected
    $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Create database if it does not exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci");
    $pdo->exec("USE `$dbname`");

    // 3. Create tables if they do not exist
    // Users table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(50) NOT NULL UNIQUE,
        `email` VARCHAR(100) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `full_name` VARCHAR(100) NOT NULL,
        `role` VARCHAR(50) DEFAULT 'Cashier',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

    // Products table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `products` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `sku` VARCHAR(50) NOT NULL UNIQUE,
        `name` VARCHAR(150) NOT NULL,
        `category` VARCHAR(50) DEFAULT 'General',
        `quantity` INT DEFAULT 0,
        `cost_price` DECIMAL(10,2) DEFAULT 0.00,
        `selling_price` DECIMAL(10,2) DEFAULT 0.00,
        `status` VARCHAR(50) DEFAULT 'In Stock'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

    // Receipts table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `receipts` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `receipt_no` VARCHAR(50) NOT NULL UNIQUE,
        `invoice_no` VARCHAR(50) NOT NULL,
        `customer_name` VARCHAR(100) NOT NULL,
        `cashier_name` VARCHAR(100) NOT NULL,
        `payment_method` VARCHAR(50) NOT NULL,
        `subtotal` DECIMAL(10,2) NOT NULL,
        `discount` DECIMAL(10,2) DEFAULT 0.00,
        `tax` DECIMAL(10,2) DEFAULT 0.00,
        `grand_total` DECIMAL(10,2) NOT NULL,
        `created_at` DATETIME NOT NULL,
        `status` VARCHAR(50) DEFAULT 'Completed'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

    // Receipt items table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `receipt_items` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `receipt_no` VARCHAR(50) NOT NULL,
        `item_desc` VARCHAR(150) NOT NULL,
        `quantity` INT DEFAULT 1,
        `unit_price` DECIMAL(10,2) NOT NULL,
        `line_total` DECIMAL(10,2) NOT NULL,
        INDEX (`receipt_no`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

    // 4. Seed initial users if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM `users`");
    if ($stmt->fetchColumn() == 0) {
        $passAdmin = password_hash("admin123", PASSWORD_DEFAULT);
        $passCashier = password_hash("cashier123", PASSWORD_DEFAULT);
        $pdo->exec("INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role`) VALUES
            ('admin', 'admin@kielbiel.com', '$passAdmin', 'Kiel Hedrix', 'Admin User'),
            ('cashier', 'cashier@kielbiel.com', '$passCashier', 'Store Cashier 1', 'Cashier');");
    }

    // 5. Seed initial products if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM `products`");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO `products` (`sku`, `name`, `category`, `quantity`, `cost_price`, `selling_price`, `status`) VALUES
            ('SKU-1001', 'Logitech MX Master 3', 'Electronics', 45, 75.00, 99.99, 'In Stock'),
            ('SKU-1002', 'USB-C High-Speed Cable', 'Accessories', 120, 10.00, 25.00, 'In Stock'),
            ('SKU-1003', 'HP LaserJet Pro Printer', 'Hardware', 12, 450.00, 600.00, 'In Stock'),
            ('SKU-1004', 'HP Original Toner Cartridge', 'Consumables', 30, 35.00, 50.00, 'In Stock'),
            ('SKU-1005', 'Wireless Keyboard K380', 'Accessories', 65, 18.00, 28.50, 'In Stock'),
            ('SKU-1006', '24\" LED IPS Monitor 144Hz', 'Monitors', 18, 220.00, 320.00, 'In Stock');");
    }

    // 6. Seed initial receipts if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM `receipts`");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO `receipts` (`receipt_no`, `invoice_no`, `customer_name`, `cashier_name`, `payment_method`, `subtotal`, `discount`, `tax`, `grand_total`, `created_at`, `status`) VALUES
            ('REC-2026-001', 'INV-1024', 'Juan Dela Cruz', 'Admin User', 'Cash', 249.98, 12.50, 28.50, 265.98, '2026-10-26 14:30:00', 'Completed'),
            ('REC-2026-002', 'INV-1025', 'Maria Santos', 'Store Manager', 'GCash', 1450.00, 0.00, 174.00, 1450.00, '2026-10-26 12:15:00', 'Completed'),
            ('REC-2026-003', 'INV-1026', 'ABC Enterprises', 'Admin User', 'Credit Card', 85.50, 0.00, 10.26, 85.50, '2026-10-25 16:45:00', 'Refunded'),
            ('REC-2026-004', 'INV-1027', 'Robert Gomez', 'Store Manager', 'Cash', 320.00, 16.00, 36.48, 320.00, '2026-10-25 09:20:00', 'Completed');");

        $pdo->exec("INSERT INTO `receipt_items` (`receipt_no`, `item_desc`, `quantity`, `unit_price`, `line_total`) VALUES
            ('REC-2026-001', 'Logitech MX Master 3', 2, 99.99, 199.98),
            ('REC-2026-001', 'USB-C High-Speed Cable', 2, 25.00, 50.00),
            ('REC-2026-002', 'HP LaserJet Pro Printer', 2, 600.00, 1200.00),
            ('REC-2026-002', 'HP Original Toner Cartridge', 5, 50.00, 250.00),
            ('REC-2026-003', 'Wireless Keyboard K380', 3, 28.50, 85.50),
            ('REC-2026-004', '24\" LED IPS Monitor 144Hz', 1, 320.00, 320.00);");
    }

} catch(PDOException $e) {
    header('Content-Type: application/json');
    die(json_encode(["status" => "error", "message" => "Database Connection/Setup Failed: " . $e->getMessage()]));
}
?>
