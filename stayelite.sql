-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: stayelite
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `status` enum('Present','Absent','Leave') NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,1,'Present','2025-08-19'),(2,3,'Absent','2025-08-19');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkin_rooms`
--

DROP TABLE IF EXISTS `checkin_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkin_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `checkin_id` int NOT NULL,
  `room_id` int NOT NULL,
  `price_per_night` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `checkin_id` (`checkin_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `checkin_rooms_ibfk_1` FOREIGN KEY (`checkin_id`) REFERENCES `checkins` (`checkin_id`) ON DELETE CASCADE,
  CONSTRAINT `checkin_rooms_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkin_rooms`
--

LOCK TABLES `checkin_rooms` WRITE;
/*!40000 ALTER TABLE `checkin_rooms` DISABLE KEYS */;
INSERT INTO `checkin_rooms` VALUES (1,1,2,0.00),(2,1,3,0.00),(3,2,1,0.00),(4,3,1,0.00),(5,4,1,0.00),(6,5,1,0.00),(7,5,2,0.00),(8,5,3,0.00);
/*!40000 ALTER TABLE `checkin_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkins`
--

DROP TABLE IF EXISTS `checkins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkins` (
  `checkin_id` int NOT NULL AUTO_INCREMENT,
  `client_name` varchar(100) NOT NULL,
  `rooms_allotted` int NOT NULL,
  `paxes` int NOT NULL,
  `meal_plan` varchar(50) DEFAULT NULL,
  `checkin_date` date NOT NULL,
  `checkout_date` date NOT NULL,
  `client_address` text,
  `id_proof_type` varchar(50) NOT NULL,
  `id_proof_no` varchar(50) NOT NULL,
  `other_id_text` varchar(50) DEFAULT NULL,
  `beds` int DEFAULT NULL,
  `booking_from` varchar(50) DEFAULT NULL,
  `booked_by` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','checked_out') DEFAULT 'active',
  PRIMARY KEY (`checkin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkins`
--

LOCK TABLES `checkins` WRITE;
/*!40000 ALTER TABLE `checkins` DISABLE KEYS */;
INSERT INTO `checkins` VALUES (1,'wasi',2,6,'map','2025-08-12','2025-08-13','malaika road near ','aadhaar','813305267388','',4,'agent','iqra kashmir','none\nCheckout notes: Extra: none; Pending: 0; Payment: Cash; Remarks: good','2025-08-12 10:38:38','checked_out'),(2,'jibran',1,1,'breakfast','2025-08-12','2025-08-12','mehboob colony sec a','aadhaar','8541254855','',0,'direct','jibran','none\nCheckout notes: Extra: none; Pending: 0; Payment: Cash; Remarks: good','2025-08-12 11:36:11','checked_out'),(3,'jibran',1,1,'afasfafa','2025-08-13','2025-08-13','dfjsahwjgwepkfjew;l','passport','jcpzxfj;asdjfpdsfjsado','',0,'direct','jsfahflkaj;aks','none\nCheckout notes: Extra: none; Pending: 0; Payment: Cash; Remarks: none','2025-08-13 15:28:21','checked_out'),(4,'jibrandar',1,1,'breakfast','2025-08-13','2025-08-13','mehboob colony sec a','pan','789979554888','',0,'direct','Jibran','none\nCheckout notes: Extra: none; Pending: 0; Payment: Cash; Remarks: none','2025-08-13 15:43:05','checked_out'),(5,'musaib',1,1,'breakfast','2025-08-13','2025-08-13','mehboob colony sec a','driving','874654654689','',0,'agent','jibran','none\nCheckout notes: Extra: none; Pending: 0; Payment: Cash; Remarks: none','2025-08-13 16:46:46','checked_out');
/*!40000 ALTER TABLE `checkins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'jibran','9797212618','Mehboob colony Sec A, Naik bagh,Srinagar\r\nGogo,humhama,srinagar\r\nHumhama chowk','Manager'),(3,'khawar','8082465771','Mehboob colony Sec A, Naik bagh,Srinagar\r\nGogo,humhama,srinagar\r\nHumhama chowk','cleaner');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `checkin_id` int NOT NULL,
  `invoice_number` varchar(80) NOT NULL,
  `client_name` varchar(100) NOT NULL,
  `rooms_allotted` int NOT NULL,
  `paxes` int NOT NULL,
  `meal_plan` varchar(50) DEFAULT NULL,
  `checkin_date` date NOT NULL,
  `checkout_date` date NOT NULL,
  `room_charges` decimal(10,2) DEFAULT '0.00',
  `meal_charges` decimal(10,2) DEFAULT '0.00',
  `other_charges` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT '0.00',
  `payment_method` varchar(50) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `checkin_id` (`checkin_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`checkin_id`) REFERENCES `checkins` (`checkin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,3,'INV-20250813-3','jibran',1,1,'afasfafa','2025-08-13','2025-08-13',6000.00,250.00,0.00,6250.00,6250.00,'Cash','none','2025-08-13 15:30:33'),(2,4,'INV-20250813-4','jibrandar',1,1,'breakfast','2025-08-13','2025-08-13',1000.00,850.00,0.00,1850.00,0.00,'Cash','hiii','2025-08-13 15:43:57'),(3,5,'INV-20250813-5','musaib',1,1,'breakfast','2025-08-13','2025-08-13',2000.00,450.00,0.00,2450.00,2450.00,'UPI','none','2025-08-13 16:49:59');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(10) NOT NULL,
  `is_available` varchar(20) NOT NULL DEFAULT 'available',
  `room_type` varchar(20) NOT NULL,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `room_number` (`room_number`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'1','available','Double'),(2,'2','available','Double'),(3,'3','available','Double'),(5,'4','occupied','Single');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `password` (`password`),
  UNIQUE KEY `role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('jibran','123456','Manager'),('tawseef','123','Receptionist'),('wasi','12345','Admin');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wifi`
--

DROP TABLE IF EXISTS `wifi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wifi` (
  `wifi_name` varchar(100) DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `location` varchar(60) DEFAULT NULL,
  UNIQUE KEY `wifi_name` (`wifi_name`),
  UNIQUE KEY `location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wifi`
--

LOCK TABLES `wifi` WRITE;
/*!40000 ALTER TABLE `wifi` DISABLE KEYS */;
INSERT INTO `wifi` VALUES ('wasi chatul','wasi lakhnaav','wasi ass'),('jibrandar','12345678','location');
/*!40000 ALTER TABLE `wifi` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-21 17:31:56
