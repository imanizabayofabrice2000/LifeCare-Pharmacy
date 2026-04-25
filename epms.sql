-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 21, 2026 at 01:21 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `epms`
--

-- --------------------------------------------------------

--
-- Table structure for table `medicine`
--

CREATE TABLE `medicine` (
  `MedicineID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Category` varchar(50) DEFAULT 'General',
  `ExpiryDate` date NOT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `medicine`
--

INSERT INTO `medicine` (`MedicineID`, `Name`, `Category`, `ExpiryDate`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Paracetamol 500mg', 'Pain Relief', '2026-12-31', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(2, 'placetamor 250mg', 'Antibiotic', '2024-02-23', '2026-04-18 16:23:55', '2026-04-18 16:26:23'),
(3, 'Ibuprofen 400mg', 'Anti-inflammatory', '2012-06-05', '2026-04-18 16:23:55', '2026-04-19 08:17:17'),
(4, 'Vitamin C 1000mg', 'Supplement', '2027-01-20', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(5, 'Omeprazole 20mg', 'Gastric', '2029-05-31', '2026-04-18 16:23:55', '2026-04-18 18:45:07'),
(6, 'Fabrice', 'headche', '2030-02-08', '2026-04-18 16:50:41', '2026-04-21 08:38:43'),
(7, 'kevin', 'name', '2026-04-07', '2026-04-19 08:21:57', '2026-04-19 08:21:57'),
(8, 'Gahanga I', 'vitamin c', '2028-06-07', '2026-04-21 08:38:06', '2026-04-21 08:38:06');

-- --------------------------------------------------------

--
-- Table structure for table `salerecord`
--

CREATE TABLE `salerecord` (
  `SaleID` int(11) NOT NULL,
  `MedicineID` int(11) DEFAULT NULL,
  `CustomerName` varchar(100) DEFAULT NULL,
  `QuantitySold` int(11) NOT NULL,
  `TotalAmount` decimal(10,2) NOT NULL,
  `SaleDate` datetime DEFAULT current_timestamp(),
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `salerecord`
--

INSERT INTO `salerecord` (`SaleID`, `MedicineID`, `CustomerName`, `QuantitySold`, `TotalAmount`, `SaleDate`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 'Patient A', 2, 5.00, '2024-01-15 10:30:00', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(2, 3, 'Patient B', 1, 3.25, '2024-01-15 11:45:00', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(3, 2, 'Patient C', 3, 26.25, '2024-01-16 09:15:00', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(4, 4, 'Patient D', 1, 5.00, '2024-01-16 14:20:00', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(5, 5, 'Patient E', 2, 25.98, '2024-01-17 16:00:00', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(6, 3, 'F', 3, 5000.00, '2026-04-18 18:52:36', '2026-04-18 18:52:36', '2026-04-18 18:52:36'),
(7, 1, 'G', 5, 8000.00, '2026-04-18 18:53:14', '2026-04-18 18:53:14', '2026-04-18 18:53:14');

--
-- Triggers `salerecord`
--
DELIMITER $$
CREATE TRIGGER `trg_prevent_negative_stock` BEFORE INSERT ON `salerecord` FOR EACH ROW BEGIN
  DECLARE current_stock INT;
  SELECT QuantityAvailable INTO current_stock 
  FROM Stock WHERE MedicineID = NEW.MedicineID;
  
  IF current_stock < NEW.QuantitySold THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Insufficient stock for this sale';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_update_stock_on_sale` AFTER INSERT ON `salerecord` FOR EACH ROW BEGIN
  -- Decrease stock quantity when a sale is recorded
  UPDATE Stock 
  SET QuantityAvailable = QuantityAvailable - NEW.QuantitySold,
      UpdatedAt = CURRENT_TIMESTAMP
  WHERE MedicineID = NEW.MedicineID 
    AND QuantityAvailable >= NEW.QuantitySold;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `StockID` int(11) NOT NULL,
  `MedicineID` int(11) NOT NULL,
  `QuantityAvailable` int(11) NOT NULL DEFAULT 0,
  `UnitPrice` decimal(10,2) NOT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`StockID`, `MedicineID`, `QuantityAvailable`, `UnitPrice`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 143, 2.50, '2026-04-18 16:23:55', '2026-04-18 18:53:14'),
(2, 2, 12, 8.75, '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(3, 3, 196, 3.25, '2026-04-18 16:23:55', '2026-04-18 18:52:36'),
(4, 4, 7, 5.00, '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(5, 5, 73, 12.99, '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(6, 4, 500, 500.00, '2026-04-18 16:49:51', '2026-04-18 16:49:51'),
(7, 6, 70, 1000.00, '2026-04-18 16:51:11', '2026-04-20 17:56:17'),
(8, 7, 5, 600.00, '2026-04-19 08:23:06', '2026-04-19 08:23:06'),
(9, 3, 3, 400.00, '2026-04-20 17:58:41', '2026-04-20 17:58:41');

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `SupplierID` int(11) NOT NULL,
  `SupplierName` varchar(100) NOT NULL,
  `Contact` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` text DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `Contact`, `Email`, `Phone`, `Address`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'MediSupply Co.', 'John Doe', 'john@medisupply.com', '+250788123456', 'KG 12 Ave, Kigali', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(2, 'PharmaGlobal Ltd', 'Jane Smith', 'jane@pharmaglobal.com', '+250788654321', 'KN 3 Ave, Kigali', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(3, 'HealthPlus Distributors', 'Mike Brown', 'mike@healthplus.rw', '+250788987654', 'KG 7 Ave, Kigali', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(4, 'tuyishimire emanuel', 'emanuel', NULL, NULL, NULL, '2026-04-18 16:28:27', '2026-04-18 16:28:27'),
(5, 'mwizerwa fabrice', '0784766540', NULL, NULL, NULL, '2026-04-18 16:28:40', '2026-04-18 16:28:40'),
(6, 'dsdwdwdsds', 'juss983ye78218', NULL, NULL, NULL, '2026-04-18 16:32:38', '2026-04-18 16:32:38'),
(7, 'mama fab', '0784766504', NULL, NULL, NULL, '2026-04-18 18:51:45', '2026-04-18 18:51:45'),
(8, 'tumukunde fabiola health co.', '987643453437', NULL, NULL, NULL, '2026-04-18 18:54:53', '2026-04-18 18:54:53'),
(9, 'ntwali kevin ', '079876543', NULL, NULL, NULL, '2026-04-19 16:54:53', '2026-04-19 16:55:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` enum('admin','pharmacist','staff') DEFAULT 'staff',
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `FirstName`, `LastName`, `Email`, `PasswordHash`, `Role`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Admin', 'User', 'admin@lifecare.rw', '$2a$10$XvZK8J9YqZ7X8Y9Z0X1Y2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8', 'admin', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(2, 'Pharmacist', 'One', 'pharmacist@lifecare.rw', '$2a$10$XvZK8J9YqZ7X8Y9Z0X1Y2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8', 'pharmacist', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(3, 'Staff', 'Member', 'staff@lifecare.rw', '$2a$10$XvZK8J9YqZ7X8Y9Z0X1Y2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8', 'staff', '2026-04-18 16:23:55', '2026-04-18 16:23:55'),
(4, 'imanizabayo', 'fabrice', 'imanizabayofabrice2004@gmail.co', '$2b$10$xsEce0KId9c.EQeV.n3R2ubLCIHh3zjtAE5zRVkOjlxGzHkAai.2i', 'staff', '2026-04-18 16:48:56', '2026-04-18 16:48:56'),
(5, 'eliab', 'mugabo', 'eliabmugabo@gmail.com', '$2b$10$UaPpcExihS92sPUo9k05q.Yb4A/xPWV1YiYU3nE0kxWagrnXhInFK', 'staff', '2026-04-18 16:57:53', '2026-04-18 16:57:53'),
(6, 'jeanmbatiste', 'nsengimana', 'jeanmbatistensengimana@gmail.com', '$2b$10$PGaWu1thhpeXzTPiaHd7N.g9NEjKuxwzpgz0R2eQgCtvsF8vUuSnq', 'staff', '2026-04-18 19:00:22', '2026-04-18 19:00:22'),
(7, 'imanizabayo', 'fabrice', 'mwizerwafabrice2@gmail.com', '$2b$10$ce32PYylf4gYN5sRNs5LQu8Q3kiB2MgsLX3hO6dYgmJPcm8uKMB2e', 'staff', '2026-04-19 16:57:50', '2026-04-19 16:57:50'),
(8, 'fab', 'mwi', 'mwifab@gmail.com', '$2b$10$iav9oeiw/H9sBPPFO6hjRu0KD9eLJLHbLxL2cs5jw09iqBXkW.8oK', 'staff', '2026-04-20 17:52:39', '2026-04-20 17:52:39'),
(9, 'fabrice', 'mwizerwa', 'mwizerwafabrice2000@gmail.com', '$2b$10$bipigNguDuTZRykpNtNJ2O1u/IYVZzWXPFjxMuNWlj8vUQO2B2kHW', 'staff', '2026-04-21 08:14:21', '2026-04-21 08:14:21'),
(10, 'imanizabayo', 'fabrice', 'imanizabayo@gmil.com', '$2b$10$ujCpPgGuUuyrHGCXKTk4eO42zbz3vsavVwiY43Q2j2Sexfvk7LyCK', 'staff', '2026-04-21 10:34:48', '2026-04-21 10:34:48');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_dashboard_stats`
-- (See below for the actual view)
--
CREATE TABLE `vw_dashboard_stats` (
`total_medicines` bigint(21)
,`total_stock_items` bigint(21)
,`total_sales` bigint(21)
,`total_suppliers` bigint(21)
,`total_revenue` decimal(32,2)
,`low_stock_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_low_stock_alerts`
-- (See below for the actual view)
--
CREATE TABLE `vw_low_stock_alerts` (
`StockID` int(11)
,`MedicineID` int(11)
,`MedicineName` varchar(100)
,`QuantityAvailable` int(11)
,`UnitPrice` decimal(10,2)
,`StockStatus` varchar(8)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_recent_sales`
-- (See below for the actual view)
--
CREATE TABLE `vw_recent_sales` (
`SaleID` int(11)
,`MedicineName` varchar(100)
,`CustomerName` varchar(100)
,`QuantitySold` int(11)
,`TotalAmount` decimal(10,2)
,`SaleDate` datetime
);

-- --------------------------------------------------------

--
-- Structure for view `vw_dashboard_stats`
--
DROP TABLE IF EXISTS `vw_dashboard_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_dashboard_stats`  AS SELECT (select count(0) from `medicine`) AS `total_medicines`, (select count(0) from `stock`) AS `total_stock_items`, (select count(0) from `salerecord`) AS `total_sales`, (select count(0) from `supplier`) AS `total_suppliers`, (select coalesce(sum(`salerecord`.`TotalAmount`),0) from `salerecord`) AS `total_revenue`, (select count(0) from `stock` where `stock`.`QuantityAvailable` < 20) AS `low_stock_count` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_low_stock_alerts`
--
DROP TABLE IF EXISTS `vw_low_stock_alerts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_low_stock_alerts`  AS SELECT `s`.`StockID` AS `StockID`, `s`.`MedicineID` AS `MedicineID`, `m`.`Name` AS `MedicineName`, `s`.`QuantityAvailable` AS `QuantityAvailable`, `s`.`UnitPrice` AS `UnitPrice`, CASE WHEN `s`.`QuantityAvailable` < 10 THEN 'CRITICAL' WHEN `s`.`QuantityAvailable` < 20 THEN 'LOW' ELSE 'OK' END AS `StockStatus` FROM (`stock` `s` left join `medicine` `m` on(`s`.`MedicineID` = `m`.`MedicineID`)) WHERE `s`.`QuantityAvailable` < 20 ORDER BY `s`.`QuantityAvailable` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `vw_recent_sales`
--
DROP TABLE IF EXISTS `vw_recent_sales`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_recent_sales`  AS SELECT `sr`.`SaleID` AS `SaleID`, `m`.`Name` AS `MedicineName`, `sr`.`CustomerName` AS `CustomerName`, `sr`.`QuantitySold` AS `QuantitySold`, `sr`.`TotalAmount` AS `TotalAmount`, `sr`.`SaleDate` AS `SaleDate` FROM (`salerecord` `sr` left join `medicine` `m` on(`sr`.`MedicineID` = `m`.`MedicineID`)) ORDER BY `sr`.`SaleDate` DESC LIMIT 0, 100 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `medicine`
--
ALTER TABLE `medicine`
  ADD PRIMARY KEY (`MedicineID`),
  ADD KEY `idx_name` (`Name`),
  ADD KEY `idx_category` (`Category`),
  ADD KEY `idx_expiry` (`ExpiryDate`);

--
-- Indexes for table `salerecord`
--
ALTER TABLE `salerecord`
  ADD PRIMARY KEY (`SaleID`),
  ADD KEY `idx_medicine` (`MedicineID`),
  ADD KEY `idx_date` (`SaleDate`),
  ADD KEY `idx_customer` (`CustomerName`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`StockID`),
  ADD KEY `idx_medicine` (`MedicineID`),
  ADD KEY `idx_quantity` (`QuantityAvailable`),
  ADD KEY `idx_price` (`UnitPrice`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`SupplierID`),
  ADD KEY `idx_name` (`SupplierName`),
  ADD KEY `idx_contact` (`Contact`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `idx_email` (`Email`),
  ADD KEY `idx_role` (`Role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `medicine`
--
ALTER TABLE `medicine`
  MODIFY `MedicineID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `salerecord`
--
ALTER TABLE `salerecord`
  MODIFY `SaleID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `StockID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `SupplierID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `salerecord`
--
ALTER TABLE `salerecord`
  ADD CONSTRAINT `salerecord_ibfk_1` FOREIGN KEY (`MedicineID`) REFERENCES `medicine` (`MedicineID`) ON DELETE SET NULL;

--
-- Constraints for table `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`MedicineID`) REFERENCES `medicine` (`MedicineID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
