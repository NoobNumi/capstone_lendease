-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 21, 2025 at 05:14 PM
-- Server version: 8.0.30
-- PHP Version: 8.4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lendease`
--

-- --------------------------------------------------------

--
-- Table structure for table `address`
--

CREATE TABLE `address` (
  `address_id` int NOT NULL PRIMARY KEY, 
  `borrower_id` int DEFAULT NULL,
  `street` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `zip_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `address`
--

INSERT INTO `address` (`address_id`, `borrower_id`, `street`, `city`, `state`, `zip_code`) VALUES
(1, 1, '123 Main St', 'Metro City', 'Metro State', '12345');

-- --------------------------------------------------------

--
-- Table structure for table `admin_account`
--

CREATE TABLE `admin_account` (
  `admin_id` int NOT NULL PRIMARY KEY,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_account`
--

INSERT INTO `admin_account` (`admin_id`, `name`, `department`, `contact_number`, `email`, `username`, `password`) VALUES
(1, 'admin', 'lendease', '1234567890', 'admin@gmail.com', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `borrower_account`
--

CREATE TABLE `borrower_account` (
  `borrower_id` int NOT NULL PRIMARY KEY,
  `user_id` int NOT NULL,
  `first_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `middle_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `contact_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `birth_place` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `civil_status` enum('single','married','widowed','separated') COLLATE utf8mb4_general_ci NOT NULL,
  `residence_type` enum('own','rent') COLLATE utf8mb4_general_ci NOT NULL,
  `valid_id` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL,
  `gender` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nationality` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `religion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_region` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_province` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_barangay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `zip_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employment_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employment_years` decimal(10,2) DEFAULT NULL,
  `monthly_income` decimal(10,2) DEFAULT NULL,
  `credit_score` int DEFAULT NULL,
  `registration_date` datetime DEFAULT NULL,
  `profile_pic` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `work_type` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `position` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrower_account`
--

INSERT INTO `borrower_account` (`borrower_id`, `user_id`, `first_name`, `middle_name`, `last_name`, `age`, `contact_number`, `email`, `date_of_birth`, `birth_place`, `civil_status`, `residence_type`, `valid_id`, `gender`, `nationality`, `religion`, `address_region`, `address_province`, `address_city`, `address_barangay`, `zip_code`, `employment_type`, `employment_years`, `monthly_income`, `credit_score`, `registration_date`, `profile_pic`, `work_type`, `position`, `status`) VALUES
(58, 13, 'Nina', 'Guiriba', 'Villamin', NULL, '09123355384', 'ninagillianvillamin1128@gmail.com', '2001-11-28', 'Dimasalang, Masbate', 'single', 'own', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/valid_id%2F1747067698122-Campground%20Owner%20Dashboard.pdf?alt=media&token=72405845-7a53-4b75-bb6c-638d4e9d4c40', 'Female', 'Filipino', NULL, '05', '0541', '054108', '054108012', '04161', 'Nonemployed', 2.00, 20000.00, NULL, '2025-05-01 23:46:00', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Fuser%2F13%2Fprofile_pic%2Fhitori-gotou-happy.webp?alt=media&token=c5813815-7a0b-4fad-879f-e986b445c011', NULL, NULL, NULL),
(59, 14, 'Gisselle', 'Williamson', 'Veum-Olson', NULL, '22', 'numinum1128@gmail.com', '2024-08-18', '53409 Dibbert Cliff', 'single', 'own', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/valid_id%2F1747492579794-receipt_LOAN-mar242dc2lr_June%202025.pdf?alt=media&token=36ab091e-d684-40cd-b2a4-4d2f4d2ec7f7', 'Female', 'West Jordan', NULL, '14', '1411', '141111', '141111011', '53424-5808', 'Employed', NULL, NULL, NULL, '2024-05-07 23:46:03', NULL, NULL, NULL, NULL),
(60, 15, 'Terry', 'Crews', 'Stracke', NULL, '141', 'ninagv090522@gmail.com', '2024-12-23', '970 Shanon Shoals', 'single', 'own', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/valid_id%2F1747782475426-receipt_LOAN-maqwqjbqf26_May%202025.pdf?alt=media&token=80861270-c4e8-435a-88ca-43bdd1bf9911', 'Female', 'Sterling Heights', NULL, '03', '0314', '031417', '031417019', '49112', 'Employed', NULL, NULL, NULL, '2023-07-02 23:46:19', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `collateral`
--

CREATE TABLE `collateral` (
  `collateral_id` int NOT NULL PRIMARY KEY,
  `loan_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `value` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `collector_account`
--

CREATE TABLE `collector_account` (
  `collector_id` int NOT NULl PRIMARY KEY,
  `first_name` int NOT NULL,
  `middle_name` int NOT NULL,
  `last_name` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `collector_account`
--

INSERT INTO `collector_account` (`collector_id`, `first_name`, `middle_name`, `last_name`, `name`, `department`, `contact_number`, `email`, `username`, `password`) VALUES
(1, 0, 0, 0, 'Bob Johnson', 'Collections', '09123456789', 'bob.johnson@example.com', 'bobjohnson', 'securepassword');

-- --------------------------------------------------------

--
-- Table structure for table `disbursement_details`
--

CREATE TABLE `disbursement_details` (
  `id` int NOT NULL PRIMARY KEY,
  `loan_id` int NOT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `recipient_account_number` varchar(250) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `disbursement_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_channel` varchar(250) NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `proof_of_disbursement` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `disbursement_details`
--

INSERT INTO `disbursement_details` (`id`, `loan_id`, `recipient_name`, `recipient_account_number`, `amount`, `disbursement_date`, `payment_method`, `payment_channel`, `notes`, `created_at`, `updated_at`, `proof_of_disbursement`) VALUES
(6, 36, 'Jham Banaria', '434324324554', 30000.00, '2025-05-04 08:17:10', 'E-WALLET/BANK TRANSFER', 'GCash', '', '2025-05-04 08:17:10', '2025-05-04 08:42:43', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F34%2Fproof_of_disbursement%2F49.jpeg?alt=media&token=c7cfeb6a-50a6-4418-9722-ee163fb0e051'),
(7, 34, 'null', 'null', 20000.00, '2025-05-04 08:42:31', 'E-WALLET/BANK TRANSFER', 'GCash', '', '2025-05-04 08:42:31', '2025-05-04 08:50:07', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F34%2Fproof_of_disbursement%2F49.jpeg?alt=media&token=c7cfeb6a-50a6-4418-9722-ee163fb0e051'),
(8, 35, 'null', 'null', 15000.00, '2025-05-04 08:45:09', 'CASH', 'GCash', '', '2025-05-04 08:45:09', '2025-05-04 08:50:11', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F35%2Fproof_of_disbursement%2F11.jpeg?alt=media&token=a4d932e7-60e4-433f-b9ea-9da4f5dcadf3'),
(11, 40, 'Nina Villamin', '09123355384', 20000.00, '2025-05-04 09:39:11', 'E-WALLET/BANK TRANSFER', 'GCash', '', '2025-05-04 09:39:11', '2025-05-04 09:39:55', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F40%2Fproof_of_disbursement%2F42.jpeg?alt=media&token=7a6d6bff-c3bf-4373-b97e-5c6e7e5d6a2f'),
(12, 39, 'Zoren Madridano', '09275478620', 20000.00, '2025-05-04 09:40:12', 'E-WALLET/BANK TRANSFER', 'Gcash', '', '2025-05-04 09:40:12', '2025-05-04 09:40:12', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F39%2Fproof_of_disbursement%2F42.jpeg?alt=media&token=6739da31-15d0-4617-8ac1-91a71f7aab16'),
(13, 41, 'Nina Villamin', '09123355384', 20000.00, '2025-05-21 14:46:18', 'CASH', '', '', '2025-05-21 14:46:18', '2025-05-21 14:46:18', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F41%2Fproof_of_disbursement%2Fimage%20(7).png?alt=media&token=63e46061-5242-4660-81a1-b73d150aa84b');

-- --------------------------------------------------------

--
-- Table structure for table `employed_details`
--

CREATE TABLE `employed_details` (
  `employed_id` int NOT NULL PRIMARY KEY,
  `borrower_id` int NOT NULL,
  `work_type` enum('government','private') NOT NULL,
  `position` text NOT NULL,
  `job_status` enum('Permanent','Contractual','Job Order','Casual','Probationary','Part-Time','Project-Based','Consultant') NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `monthly_income` decimal(10,0) NOT NULL,
  `employment_year` decimal(10,0) NOT NULL,
  `school_address` longtext NOT NULL,
  `atm_card_number` varchar(30) NOT NULL,
  `account_number` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `employed_details`
--

INSERT INTO `employed_details` (`employed_id`, `borrower_id`, `work_type`, `position`, `job_status`, `company_name`, `monthly_income`, `employment_year`, `school_address`, `atm_card_number`, `account_number`) VALUES
(1, 17, 'private', 'Web Designer', 'Part-Time', 'PourPal', 323232333, 2, '3213213', '3232 3232 2321 3321', '3232'),
(18, 23, 'private', 'Web Designer', 'Contractual', 'PourPal', 54895489, 2, 'BU', '5940 5849 0859 4859', '573457489578497'),
(19, 24, 'government', 'Quidem distinctio sed cupiditate cumque.', 'Project-Based', 'Nader - Rice', 275, 168, '7061 Fadel Port', '53', '260'),
(20, 25, 'private', 'Est nam illo voluptas.', 'Part-Time', 'Davis, Pouros and O\'Keefe', 90, 470, '4439 Pansy Hills', '552', '182'),
(21, 26, 'government', 'Minima sapiente temporibus minima expedita nobis amet labore molestiae amet.', 'Contractual', 'Fay - Pacocha', 493, 33, '6072 Effertz Route', '60', '344'),
(22, 28, 'government', 'Recusandae fuga necessitatibus earum hic.', 'Contractual', 'Pfannerstill - Gerhold', 404, 26, '549 Layne Junctions', '454', '471'),
(23, 33, 'private', 'Developer', 'Project-Based', 'West and Sons', 276, 12, 'Bicol University', '391', '7'),
(24, 34, 'private', 'Quos harum et nihil possimus earum assumenda numquam.', 'Project-Based', 'Langworth Inc', 183, 168, '2007 Zelda Junctions', '333', '639'),
(25, 35, 'private', 'Hic et provident laboriosam voluptatem nostrum eum id hic esse.', 'Contractual', 'Fisher - Davis', 373, 406, '78000 Lehner Camp', '367', '591'),
(26, 36, 'government', 'Modi adipisci similique in unde assumenda nobis qui praesentium.', 'Consultant', 'Reichel, Rosenbaum and Luettgen', 65, 443, '4453 Maverick Corners', '440', '237'),
(27, 37, 'private', 'Magnam nostrum dicta.', 'Project-Based', 'Schamberger - Lockman', 221, 23, '57986 Enid Isle', '368', '46'),
(28, 38, 'government', 'Voluptate inventore sed culpa alias ducimus expedita quibusdam delectus corporis.', 'Contractual', 'Strosin, Kozey and Hickle', 396, 500, '6729 Lavern Keys', '149', '322'),
(29, 39, 'government', 'Doloribus qui voluptates doloribus dolore fugiat rerum.', 'Casual', 'Cormier - Senger', 38, 87, '20332 Lesch Lakes', '485', '600'),
(30, 41, 'government', 'Accusantium ex tempore corporis odio.', 'Contractual', 'Wehner Inc', 368, 156, '6954 Tanner Walk', '222', '229'),
(31, 42, 'government', 'Web Designer', 'Contractual', 'PourPal', 2000, 3, 'Test', '4166 6766 6766 674', '4166676667666746'),
(32, 44, 'private', 'Human Branding Facilitator', 'Contractual', 'Tremblay, Torp and Strosin', 20000, 2, 'Bicol University', '4314 3243 2554 5435', '32432432424'),
(33, 46, 'private', 'Web Designer', 'Casual', 'Rhapsody Music Academy', 20000, 2, '243432', '5840 9754 8975 8934', '34343243243'),
(34, 47, 'private', 'Esse at voluptates corrupti magnam.', 'Casual', 'PourPal', 4324234, 432432, '432423423423432', '4324 3243 2432 4324', '432432432432'),
(35, 48, 'private', 'Web Designer', 'Casual', 'PourPal', 44343432, 43432, '432432', '4343 2424 2343 2432', '432432432423'),
(36, 49, 'government', 'Web Designer', 'Contractual', 'PourPal', 30000, 3, '9859048590', '4832 9048 3849 0328', '5943058490859'),
(37, 53, 'government', 'Bandit', 'Casual', 'New Bandit', 300000, 2, 'Test', '3894 9038 0989 3848', '43890482'),
(38, 54, 'government', 'Front End Developer', 'Contractual', 'AMAFA', 40002, 2, 'Bicol University', '4392 0948 3904 8439', '43094930940'),
(39, 55, 'government', 'Web Designer', 'Contractual', 'PourPal', 40000, 2, 'Bicol University', '4384 3843 8483 9483', '43940309'),
(40, 56, 'government', 'Web Designer', 'Contractual', 'PourPal', 40000, 2, 'Bicol University', '4384 3843 8483 9483', '43940309'),
(41, 57, 'government', 'Front End Developer', 'Contractual', 'PourPal', 40000, 3, 'Bicol University', '4384 9384 3904 8904', '3899043483984'),
(42, 59, 'government', 'Web Designer', 'Contractual', 'PourPal', 30000, 2, 'Bicol University', '4384 3843 8483 9483', '3424343'),
(43, 60, 'government', 'Web Designer', 'Contractual', 'PourPal', 30000, 3, 'Bicol University', '4805 8490 5493 0589', '849058439584958');

-- --------------------------------------------------------

--
-- Table structure for table `guarantor`
--

CREATE TABLE `guarantor` (
  `guarantor_id` int NOT NULL PRIMARY KEY,
  `borrower_id` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `relationship_to_borrower` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guarantor`
--

INSERT INTO `guarantor` (`guarantor_id`, `borrower_id`, `name`, `contact_number`, `email`, `relationship_to_borrower`) VALUES
(1, 1, 'Mary Smith', '09123456780', 'mary.smith@example.com', 'Sister');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `item_id` int NOT NULL PRIMARY KEY,
  `item_name` varchar(100) NOT NULL,
  `description` text,
  `quantity` int NOT NULL,
  `minimum_stock_level` int DEFAULT '10',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan`
--

CREATE TABLE `loan` (
  `loan_id` int NOT NULL PRIMARY KEY,
  `loan_application_id` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `borrower_id` int DEFAULT NULL,
  `loan_type_id` int DEFAULT NULL,
  `loan_type_value` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `loan_amount` decimal(10,2) DEFAULT NULL,
  `interest_rate` decimal(5,2) DEFAULT NULL,
  `loan_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `application_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `approval_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `repayment_schedule_id` int DEFAULT NULL,
  `purpose` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `borrowers_valid_id` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `bank_statement` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `co_makers_valid_id` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `loan_officer_id` int DEFAULT NULL,
  `disbursement_id` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_work_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_has_business` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_type_of_business` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_business_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_income_flow` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_income_amount` decimal(10,2) DEFAULT NULL,
  `non_employee_numberField` decimal(10,2) DEFAULT NULL,
  `non_employee_loan_security` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_relationship_to_loan_guarantor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_loan_guarantor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `disbursement_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `disbursement_bank_or_wallet_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `disbursement_account_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `disbursement_account_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employee_monthly_income_amount` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan`
--

INSERT INTO `loan` (`loan_id`, `loan_application_id`, `borrower_id`, `loan_type_id`, `loan_type_value`, `loan_amount`, `interest_rate`, `loan_status`, `application_date`, `approval_date`, `repayment_schedule_id`, `purpose`, `remarks`, `borrowers_valid_id`, `bank_statement`, `co_makers_valid_id`, `loan_officer_id`, `disbursement_id`, `non_employee_work_name`, `non_employee_has_business`, `non_employee_type_of_business`, `non_employee_business_address`, `non_employee_income_flow`, `non_employee_income_amount`, `non_employee_numberField`, `non_employee_loan_security`, `non_employee_relationship_to_loan_guarantor`, `non_employee_loan_guarantor`, `disbursement_type`, `disbursement_bank_or_wallet_name`, `disbursement_account_name`, `disbursement_account_number`, `employee_monthly_income_amount`) VALUES
(34, 'e700d005-55d6-4953-8591-18301120b93d', 1, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 36.00, 'Approved', '2024-12-25 03:35:25', '2025-05-04 08:16:02', 6, 'HOUSING LOAN', 'Test1', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe700d005-55d6-4953-8591-18301120b93d%2Ffossil.jpg?alt=media&token=a3f9b91a-5ea8-4c79-b769-ad09b7180005', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe700d005-55d6-4953-8591-18301120b93d%2Fgalaxy.jpg?alt=media&token=94c38f49-2b6e-484c-adfb-4b20ca55c87f', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe700d005-55d6-4953-8591-18301120b93d%2Fgalaxy2.jpg?alt=media&token=2d9c660c-e3dd-403e-97a0-d11c791fdbf0', 6, '', '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL, 0),
(35, '9df84a54-2832-41f2-8fa5-8dc565060293', 11, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 15000.00, 36.00, 'Approved', '2024-12-28 06:15:02', '2025-05-04 08:14:35', 6, 'HOUSING LOAN', 'Test', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F9df84a54-2832-41f2-8fa5-8dc565060293%2Ffossil.jpg?alt=media&token=79a5f99c-adbd-4689-82eb-51cf0f702ab3', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F9df84a54-2832-41f2-8fa5-8dc565060293%2Fgalaxy.jpg?alt=media&token=931f9daa-2c8f-413c-b3e4-0e1366b958c3', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F9df84a54-2832-41f2-8fa5-8dc565060293%2Fiii.jfif?alt=media&token=9c22e21d-4952-4e9a-be74-e960d92ee362', 6, '', '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL, 0),
(36, 'ce6b072c-7bb9-4653-ba22-3e14ddcbbf5a', 11, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 30000.00, 36.00, 'Approved', '2024-12-28 06:28:07', '2024-12-28 06:28:07', 12, 'HOUSING LOAN', 'approved', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fce6b072c-7bb9-4653-ba22-3e14ddcbbf5a%2Fb2f54200-f606-4828-b929-6d5a54886309%20(1).jfif?alt=media&token=62c655cb-5dad-486f-9a20-cb420c3f4f10', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fce6b072c-7bb9-4653-ba22-3e14ddcbbf5a%2Fdc9540bb-7b1f-4610-a839-5389429f68b9.jfif?alt=media&token=9523c205-aa67-4c45-b791-0ea9098ea836', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fce6b072c-7bb9-4653-ba22-3e14ddcbbf5a%2Feb435d2b-a1a2-4aa9-a215-6225fdd7bad7%20(1).jfif?alt=media&token=f498e25b-b0de-4602-b966-4545881f2d20', 2, '', '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL, 0),
(37, 'c56de879-f3b5-41b3-a3b0-c55f8b9e39c1', 1, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 7.00, 'Rejected', '2024-12-29 14:02:04', '2024-12-29 14:02:04', 12, 'OTHERS', 'rejected', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fc56de879-f3b5-41b3-a3b0-c55f8b9e39c1%2F2022-02-21.png?alt=media&token=11dd4cf1-a852-4898-9a43-cbd921430c2a', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fc56de879-f3b5-41b3-a3b0-c55f8b9e39c1%2F2022-02-21.png?alt=media&token=7a695832-6fb7-4736-a1c0-506e1c1373e1', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fc56de879-f3b5-41b3-a3b0-c55f8b9e39c1%2F2022-02-21.png?alt=media&token=90399346-8249-47af-b213-82386f7fa51d', 1, '', '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL, 0),
(38, 'cae3d163-154b-4a4a-b489-28e1620ff5d7', 1, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 26000.00, 7.00, 'Rejected', '2025-01-16 09:18:18', '2025-01-16 09:18:18', 6, 'HOUSING LOAN', 'rejected no id', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fcae3d163-154b-4a4a-b489-28e1620ff5d7%2F49e7128e-0aca-4e94-b3cc-9726d3edd51b.jpg?alt=media&token=14090b52-1e43-423a-bb60-bb2ee9c9fec0', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fcae3d163-154b-4a4a-b489-28e1620ff5d7%2F49e7128e-0aca-4e94-b3cc-9726d3edd51b.jpg?alt=media&token=fa466e6b-9a03-4a60-9a6f-288492e60e75', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fcae3d163-154b-4a4a-b489-28e1620ff5d7%2Fcool_16876150.png?alt=media&token=d5e5e1eb-ccf5-4d18-8b81-4d38e518fc65', 1, NULL, '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL, 0),
(39, '7731a096-cdb6-443c-8ed1-baa3765d624a', 1, NULL, 'NON-EMPLOYEE LOAN', 20000.00, 3.00, 'Approved', '2025-01-23 11:57:31', '2025-01-23 11:57:31', 6, '', 'approved', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F7731a096-cdb6-443c-8ed1-baa3765d624a%2FWedding%20Invitation.png?alt=media&token=ddc6f20f-17c9-490e-850f-b2e289065d49', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F7731a096-cdb6-443c-8ed1-baa3765d624a%2FWedding%20Invitation.png?alt=media&token=0a638dde-9f89-4f98-9da8-88a8da4f6419', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F7731a096-cdb6-443c-8ed1-baa3765d624a%2FBlue%20White%20Aesthetic%20Wedding%20Invitation.png?alt=media&token=fc39a3bf-be1a-44cf-8b00-ceaafd8c4128', 1, NULL, 'tindera', 'YES', 'Corporation', 'pawa legazpi city', 'MONTHLY', 19999.00, 123.00, '123', 'SPOUSE', 'jam', 'E-WALLET/BANK TRANSFER', 'Gcash', 'Dexter Miranda', '09275478620', 0),
(40, 'e890c2b8-4656-4200-b263-f894a50ed06e', 14, NULL, 'NON-EMPLOYEE LOAN', 20000.00, 3.00, 'Approved', '2025-01-24 01:43:37', '2025-05-04 09:38:56', 6, '', 'Test1', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe890c2b8-4656-4200-b263-f894a50ed06e%2FBlue%20White%20Aesthetic%20Wedding%20Invitation.png?alt=media&token=a03d546c-ce58-4123-879c-a753c0cc562f', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe890c2b8-4656-4200-b263-f894a50ed06e%2FWedding%20Invitation.png?alt=media&token=86cdbf3d-8fa2-4a05-a432-8a84e5e7d4e6', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe890c2b8-4656-4200-b263-f894a50ed06e%2FWedding%20Invitation.png?alt=media&token=03e51082-dd8f-4b16-a2c9-96769421aa34', 6, NULL, 'tindera', 'YES', 'Corporation', '5th wave', 'MONTHLY', 150000.00, 1.00, '1', 'SPOUSE', 'jam', 'CASH', '', '', '', 0),
(41, 'ac7c41bb-1028-4f6d-9432-b907d74972e3', 58, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 3.00, 'Approved', '2025-05-14 00:13:29', '2025-05-13 17:03:58', 6, 'HOUSING LOAN', 'This is now approved', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fac7c41bb-1028-4f6d-9432-b907d74972e3%2FSample_image.png?alt=media&token=265c268c-8e71-4b73-9649-3156fa69a716', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fac7c41bb-1028-4f6d-9432-b907d74972e3%2FSample_image.png?alt=media&token=7fef06d8-3264-4767-b86b-1bbe13c9cc4b', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fac7c41bb-1028-4f6d-9432-b907d74972e3%2FSample_image.png?alt=media&token=8212bde7-ba2d-4eb1-a896-8672beee59bc', 2, NULL, NULL, NULL, '', NULL, NULL, NULL, 12000.00, '323323', NULL, NULL, 'CASH', '', '', '', 40000),
(42, '5da9532e-e460-4b32-86ca-4ec1508f273a', NULL, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 3.00, 'Pending', '2025-05-21 20:57:06', '2025-05-21 12:57:06', 6, 'OTHERS', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 40000),
(43, 'a1b6de74-1159-4ac7-8bae-036fc4f788f6', NULL, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 3.00, 'Pending', '2025-05-21 20:57:14', '2025-05-21 12:57:14', 6, 'OTHERS', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 40000),
(44, '25a691e0-62b5-47cf-8ccc-efc8919ccbfd', NULL, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 3.00, 'Pending', '2025-05-21 21:16:29', '2025-05-21 13:16:29', 6, 'OTHERS', '', '', '', '', NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, 12000.00, '55454354546546', NULL, NULL, 'E-WALLET/BANK TRANSFER', 'Gcash', 'Nina Villamin', '09123355384', 40000),
(45, '94db8588-8f11-4ba8-afce-e396f35c1ec2', NULL, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 3.00, 'Pending', '2025-05-21 21:32:20', '2025-05-21 13:32:20', 6, 'HOUSING LOAN', '', '', '', '', NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, 123.00, '323323', NULL, NULL, 'CASH', '', '', '', 40000),
(46, '4a428414-8f77-4676-a275-c896d880e30d', NULL, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 3.00, 'Pending', '2025-05-21 21:43:41', '2025-05-21 13:43:41', 6, 'HOUSING LOAN', '', '', '', '', NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, 123.00, '323323', NULL, NULL, 'CASH', '', '', '', 40000),
(47, '3d83757e-e7c0-48c5-a48f-e8f7a771593d', 58, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 3.00, 'Approved', '2025-05-21 22:29:44', '2025-05-21 17:01:41', 6, 'HOUSING LOAN', 'This is to confirm', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F3d83757e-e7c0-48c5-a48f-e8f7a771593d%2Freceipt_LOAN-maqwqjbqf26_May%202025.pdf?alt=media&token=f43e4eef-977f-4884-94fd-33414aea0410', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F3d83757e-e7c0-48c5-a48f-e8f7a771593d%2Freceipt_LOAN-maqwqjbqf26_May%202025.pdf?alt=media&token=7c532c15-9d68-4320-ae54-ab9138a72c42', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F3d83757e-e7c0-48c5-a48f-e8f7a771593d%2Freceipt_LOAN-maqwqjbqf26_May%202025.pdf?alt=media&token=cb0e0524-4296-4d71-bd33-d0b5ccdfce65', 6, NULL, NULL, NULL, '', NULL, NULL, NULL, 123.00, '323323', NULL, NULL, 'CASH', '', '', '', 40000),
(48, '52685d93-ed6c-4ce2-9369-4a7a0cda5af4', 58, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 3.00, 'Approved', '2025-05-21 22:58:10', '2025-05-21 17:07:04', 6, 'HOUSING LOAN', 'Test', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F52685d93-ed6c-4ce2-9369-4a7a0cda5af4%2Floan_details%20(1).pdf?alt=media&token=04fdfe92-039c-4fe5-8321-7dbe2d9f6af5', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F52685d93-ed6c-4ce2-9369-4a7a0cda5af4%2Floan_details%20(1).pdf?alt=media&token=1d775f8c-0873-435b-b936-61e03fb7c026', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F52685d93-ed6c-4ce2-9369-4a7a0cda5af4%2Floan_details%20(1).pdf?alt=media&token=3553f89c-2cb4-48b2-9b4c-695b2e902438', 6, NULL, NULL, NULL, '', NULL, NULL, NULL, 123.00, '324324324324', NULL, NULL, 'CASH', '', '', '', 400000),
(49, 'f962bd7b-cfce-4572-8c01-8469c2b92f39', 58, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 3.00, 'Approved', '2025-05-21 23:00:05', '2025-05-21 17:02:44', 6, 'HOUSING LOAN', 'Test', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Ff962bd7b-cfce-4572-8c01-8469c2b92f39%2Floan_details-1.pdf?alt=media&token=ac574039-1e8d-4cec-af7b-a26298b9f6a3', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Ff962bd7b-cfce-4572-8c01-8469c2b92f39%2Floan_details-1.pdf?alt=media&token=83d13e3d-45ed-497b-b5fd-f07e4127f473', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Ff962bd7b-cfce-4572-8c01-8469c2b92f39%2Floan_details-1.pdf?alt=media&token=17850c0e-c86e-4d8d-984c-208ff5d31082', 6, NULL, NULL, NULL, '', NULL, NULL, NULL, 123.00, '1234324324325', NULL, NULL, 'CASH', '', '', '', 20000);

-- --------------------------------------------------------

--
-- Table structure for table `loan_application`
--

CREATE TABLE `loan_application` (
  `application_id` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `borrower_id` int DEFAULT NULL,
  `loan_amount` decimal(10,2) DEFAULT NULL,
  `application_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qr_code_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_application`
--

INSERT INTO `loan_application` (`application_id`, `borrower_id`, `loan_amount`, `application_date`, `status`, `qr_code_id`) VALUES
('162161c5-6812-46c2-86f5-9bf306f6c979', 1, 26000.00, '2025-01-16 09:17:43', 'Pending', 1),
('16238677-8933-4874-8971-2cece0622da4', 1, 20000.00, '2025-01-23 11:55:53', 'Pending', 1),
('16ad1e21-914d-47d3-a77f-8e993e8eee29', 58, 20000.00, '2025-05-14 00:01:18', 'Pending', 1),
('18b7fc42-b6c5-47b8-869b-ae26aeb8bfe0', 1, 20000.00, '2024-12-25 03:31:08', 'Pending', 1),
('20a1d791-aa7e-4ae4-a221-a9594caa338b', 58, 20000.00, '2025-05-13 00:48:27', 'Pending', 1),
('25a691e0-62b5-47cf-8ccc-efc8919ccbfd', NULL, 20000.00, '2025-05-21 21:16:29', 'Pending', 1),
('29b22ec7-fe7a-409a-920f-355316e85e24', NULL, 20000.00, '2025-05-10 00:34:52', 'Pending', 1),
('2b805a17-a00a-4dd2-bc01-bc26884b56e2', 1, 20000.00, '2024-12-25 03:34:00', 'Pending', 1),
('307ea93b-fe98-46b8-99f5-a50af5ac6d3b', NULL, 20000.00, '2025-05-11 15:51:51', 'Pending', 1),
('319a5019-33c9-40ee-a9ce-57d859c997cd', 1, 20000.00, '2024-12-25 03:35:03', 'Pending', 1),
('35cf1603-b12d-42ee-8b37-c96fabe9a45b', 1, 20000.00, '2024-12-25 03:30:41', 'Pending', 1),
('3d83757e-e7c0-48c5-a48f-e8f7a771593d', 58, 20000.00, '2025-05-21 22:29:44', 'Approved', 1),
('4a428414-8f77-4676-a275-c896d880e30d', NULL, 20000.00, '2025-05-21 21:43:41', 'Pending', 1),
('52685d93-ed6c-4ce2-9369-4a7a0cda5af4', 58, 20000.00, '2025-05-21 22:58:10', 'Approved', 1),
('58b8f105-81f1-4132-ba60-7218d2e00e99', NULL, 20000.00, '2025-05-11 15:51:30', 'Pending', 1),
('5da9532e-e460-4b32-86ca-4ec1508f273a', NULL, 20000.00, '2025-05-21 20:57:06', 'Pending', 1),
('7731a096-cdb6-443c-8ed1-baa3765d624a', 1, 20000.00, '2025-01-23 11:57:31', 'Approved', 1),
('77cb7ef5-6db3-43fa-a011-923ffc188413', 58, 20000.00, '2025-05-13 00:47:12', 'Pending', 1),
('7a0a06db-640c-4900-b8b6-bbd5548b67e7', NULL, 20000.00, '2025-05-09 06:15:18', 'Pending', 1),
('7c5c0bd2-da00-464a-89d5-feb412b2d76a', 58, 20000.00, '2025-05-13 23:44:42', 'Pending', 1),
('895448c8-0f1e-4392-a322-64a6d5324002', 58, 20000.00, '2025-05-13 00:48:03', 'Pending', 1),
('94db8588-8f11-4ba8-afce-e396f35c1ec2', NULL, 20000.00, '2025-05-21 21:32:20', 'Pending', 1),
('98f18e78-22dd-411f-9da1-4d367c3c4387', 1, 20000.00, '2024-12-25 03:33:00', 'Pending', 1),
('9df84a54-2832-41f2-8fa5-8dc565060293', 4, 15000.00, '2024-12-28 06:15:02', 'Approved', 1),
('a1b6de74-1159-4ac7-8bae-036fc4f788f6', NULL, 20000.00, '2025-05-21 20:57:14', 'Pending', 1),
('ac7c41bb-1028-4f6d-9432-b907d74972e3', 58, 20000.00, '2025-05-14 00:13:29', 'Approved', 1),
('c04c5b1f-bec7-42eb-8ea9-57d891096faa', NULL, 20000.00, '2025-05-11 16:35:09', 'Pending', 1),
('c56de879-f3b5-41b3-a3b0-c55f8b9e39c1', 1, 20000.00, '2024-12-29 14:02:04', 'Rejected', 1),
('cae3d163-154b-4a4a-b489-28e1620ff5d7', 1, 26000.00, '2025-01-16 09:18:18', 'Rejected', 1),
('cd63c3c0-c2f2-4f2c-a7ee-33a4368a0b67', 58, 20000.00, '2025-05-13 00:47:28', 'Pending', 1),
('ce6b072c-7bb9-4653-ba22-3e14ddcbbf5a', 11, 30000.00, '2024-12-28 06:28:06', 'Approved', 1),
('d4e4e8f6-febd-4fbb-94fc-250807c985df', NULL, 20000.00, '2025-05-10 00:35:06', 'Pending', 1),
('d655ab91-98ec-421d-a39a-7a37ec2e332f', 58, 20000.00, '2025-05-13 23:50:11', 'Pending', 1),
('da8731b5-3c2d-4361-acc2-75f841b48bce', NULL, 20000.00, '2025-05-09 06:15:08', 'Pending', 1),
('db7b6325-d1bc-4472-a9d7-b261f319dc10', 1, 26000.00, '2025-01-16 09:17:49', 'Pending', 1),
('e700d005-55d6-4953-8591-18301120b93d', 1, 20000.00, '2024-12-25 03:35:25', 'Approved', 1),
('e890c2b8-4656-4200-b263-f894a50ed06e', 1, 20000.00, '2025-01-24 01:43:36', 'Approved', 1),
('eea79389-6ea9-4a58-a59d-7562b20f2aa3', 58, 20000.00, '2025-05-13 22:23:28', 'Pending', 1),
('f962bd7b-cfce-4572-8c01-8469c2b92f39', 58, 20000.00, '2025-05-21 23:00:05', 'Approved', 1);

-- --------------------------------------------------------

--
-- Table structure for table `loan_officer`
--

CREATE TABLE `loan_officer` (
  `officer_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_officer`
--

INSERT INTO `loan_officer` (`officer_id`, `name`, `contact_number`, `email`, `username`, `password`) VALUES
(1, 'Loan Officer 1', '123-456-7890', 'loan_officer@gmail.com', 'load_officer', 'password');

-- --------------------------------------------------------

--
-- Table structure for table `loan_setting_parameters`
--

CREATE TABLE `loan_setting_parameters` (
  `id` int NOT NULL,
  `loan_type` varchar(50) NOT NULL,
  `interest_rate` decimal(10,2) NOT NULL,
  `min_credit_score` int NOT NULL,
  `min_monthly_income` decimal(10,2) NOT NULL,
  `loan_to_income_ratio` decimal(10,2) NOT NULL,
  `employment_years` decimal(4,1) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `loan_setting_parameters`
--

INSERT INTO `loan_setting_parameters` (`id`, `loan_type`, `interest_rate`, `min_credit_score`, `min_monthly_income`, `loan_to_income_ratio`, `employment_years`, `created_at`, `updated_at`) VALUES
(1, 'personal', 3.00, 720, 15000.00, 0.50, 2.0, '2025-01-16 02:56:00', '2025-01-16 10:43:43');

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `log_id` int NOT NULL,
  `user_id` int NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `log_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_templates`
--

CREATE TABLE `message_templates` (
  `id` int NOT NULL,
  `message` text NOT NULL,
  `type` enum('confirmation','due_notification') NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `message_templates`
--

INSERT INTO `message_templates` (`id`, `message`, `type`, `updated_at`) VALUES
(1, 'Your loan application has been successfully confirmed. Thank you for choosing us!', 'confirmation', '2025-05-20 21:52:56'),
(2, 'Reminder: Your loan payment is due. Please make the payment by the due date to avoid penalties.', 'due_notification', '2025-05-20 21:52:56');

-- --------------------------------------------------------

--
-- Table structure for table `nonemployed_details`
--

CREATE TABLE `nonemployed_details` (
  `nonemployed_id` int NOT NULL,
  `borrower_id` int NOT NULL,
  `income_source` enum('Business','Self-Employed','Unemployed','Pensioner') NOT NULL,
  `income_proof` varchar(1000) NOT NULL,
  `monthly_income` decimal(10,0) NOT NULL,
  `business_type` varchar(255) NOT NULL,
  `business_name` text NOT NULL,
  `business_address` text NOT NULL,
  `pensioner` enum('GSIS','SSS') NOT NULL,
  `monthly_pension` decimal(10,0) NOT NULL,
  `atm_card_number` varchar(30) NOT NULL,
  `account_number` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `nonemployed_details`
--

INSERT INTO `nonemployed_details` (`nonemployed_id`, `borrower_id`, `income_source`, `income_proof`, `monthly_income`, `business_type`, `business_name`, `business_address`, `pensioner`, `monthly_pension`, `atm_card_number`, `account_number`) VALUES
(1, 20, 'Business', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1746855928411-Campground%20Owner%20Dashboard.pdf?alt=media&token=67c7b2a1-64f6-4761-8946-6f10091a6a3d', 2000, 'Business Type', 'Business Name', 'DNHS', 'SSS', 3000, '3232 3232 2321 3434', '56485858'),
(2, 21, 'Pensioner', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1746863156088-Campground%20Owner%20Dashboard.pdf?alt=media&token=fb3bf363-67ca-4b99-b97f-799182655142', 130, '53045 Spencer Creek', 'Jace Bartoletti-Hartmann', '13821 Chase Throughway', 'SSS', 434325454, '263', '165'),
(3, 27, 'Unemployed', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1746948995491-Campground%20Owner%20Dashboard.pdf?alt=media&token=758eeb93-e28a-4582-abc5-10eb947d7ece', 280, '3783 Reilly Greens', 'Porter Lehner', '91585 Scot Park', 'GSIS', 543, '430', '435'),
(4, 29, 'Pensioner', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1746949295115-Campground%20Owner%20Dashboard.pdf?alt=media&token=a5cdb852-57ae-48e4-afd4-afbcc5b8f3b7', 666, '64959 Naomi Via', 'Marcella O\'Hara', '8341 Barton Meadow', 'GSIS', 386, '130', '259'),
(5, 30, 'Self-Employed', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1746949445364-Campground%20Owner%20Dashboard.pdf?alt=media&token=8e1d2d85-21c4-4912-9d8b-be8d1b55e4ca', 278, '7605 Stroman Center', 'Name Wintheiser', '87903 Mertz Shoal', 'GSIS', 304, '583', '369'),
(6, 31, 'Business', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1746949635334-Campground%20Owner%20Dashboard.pdf?alt=media&token=493a4980-61a5-46b8-a771-9a6613da1924', 281, '353 Waelchi Lake', 'Sophie Altenwerth', '78746 Jewell Plain', 'GSIS', 71, '362', '0'),
(7, 32, 'Business', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1746949755037-Campground%20Owner%20Dashboard.pdf?alt=media&token=3c1fdd8a-a511-445e-a980-ba544496903f', 397, '86443 Cleora Circles', 'Eryn Schmitt', '49203 Wisozk Parkways', 'GSIS', 335, '498', '112'),
(8, 40, 'Business', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1746964169730-Campground%20Owner%20Dashboard.pdf?alt=media&token=bcec0073-07c3-4f97-bf18-ec8f5393060f', 30000, 'Coffee Shop', 'All things Coffee', '7842 Reinger Square', 'GSIS', 1000, '3714 4963 5398 431', '091234567890'),
(9, 43, 'Business', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1746981537241-Campground%20Owner%20Dashboard.pdf?alt=media&token=eac8e3a8-9155-4fc7-b27a-5a81c3f3ae92', 20000, 'Test Type', 'Test Name', 'Test Address', 'GSIS', 20000, '4166 6766 6766 674', '416667666766671'),
(10, 45, 'Business', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1747043175056-Campground%20Owner%20Dashboard.pdf?alt=media&token=30cff38f-78f1-4791-8010-21c9a80cf93d', 20000, 'Central Integration Technician', 'Central Integration Technician', '6675 Jaquelin Prairie', 'GSIS', 2000, '6432 9874 6743 6746', '6432987467436743'),
(11, 50, 'Business', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1747048246465-Campground%20Owner%20Dashboard.pdf?alt=media&token=5e5c34ee-3f6d-48c4-a03c-ef36915ca392', 40000, 'Business Type', 'Business Name', '768 Jovany Burgs', 'GSIS', 2000, '2432 4343 4343 4343', '43434344'),
(12, 51, 'Self-Employed', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1747055727820-Campground%20Owner%20Dashboard.pdf?alt=media&token=29e1fe30-d4a9-4b17-b489-4bf802df1a23', 100000, 'Business Type', 'Business Name', 'Test', 'GSIS', 2000, '3234 0930 2193 2093', '9230493092390'),
(13, 52, 'Self-Employed', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1747055987966-Campground%20Owner%20Dashboard.pdf?alt=media&token=93db35a3-7630-4155-bde8-2e1b4b05b16e', 3000, 'Business Type', 'Business Name', '8549859048908', 'GSIS', 30000, '4839 0840 9343 8240', '859408549085'),
(14, 58, 'Business', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/income_proof%2F1747067698123-Campground%20Owner%20Dashboard.pdf?alt=media&token=8f4a34d7-a49b-45a0-9bc6-03e260280ce7', 20000, 'Business Type', 'Business Name', '371 Camerata Walk', 'SSS', 100000, '8489 7894 8734 7837', '0912832983');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`notification_id`),
  `borrower_id` int DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `date_sent` datetime DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`notification_id`, `borrower_id`, `message`, `date_sent`, `status`) VALUES
(1, 1, 'Your loan application has been approved.', '2024-01-20 10:00:00', 'Sent');

-- --------------------------------------------------------

--
-- Table structure for table `notification_template`
--

CREATE TABLE `notification_template` (
  `template_id` int NOT NULL,
  PRIMARY KEY (`template_id`),
  `template_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `template_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification_template`
--

INSERT INTO `notification_template` (`template_id`, `template_name`, `template_content`) VALUES
(1, 'Loan Approval Notification', 'Dear [Name], your loan application has been approved. Thank you for choosing our service.');

-- --------------------------------------------------------

--
-- Table structure for table `password_recovery_req`
--

CREATE TABLE `password_recovery_req` (
  `recovery_id` int NOT NULL,
  PRIMARY KEY (`recovery_id`),
  `user_id` int DEFAULT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `expiration_date` datetime DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int NOT NULL PRIMARY KEY,
  `loan_id` int DEFAULT NULL,
  `payment_amount` decimal(10,2) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_method_id` int DEFAULT NULL,
  `payment_method` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `transaction_id` int DEFAULT NULL,
  `reference_number` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `selectedTableRowIndex` int NOT NULL,
  `proof_of_payment` varchar(10000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approval_or_rejected_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `loan_officer_id` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `includes_past_due` tinyint(1) DEFAULT '0',
  `past_due_amount` decimal(10,2) DEFAULT '0.00',
  `original_amount` decimal(10,2) DEFAULT NULL,
  `remarks` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `past_due_handled` tinyint(1) NOT NULL DEFAULT '0',
  `past_due_handled_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `loan_id`, `payment_amount`, `payment_date`, `payment_status`, `payment_method_id`, `payment_method`, `transaction_id`, `reference_number`, `selectedTableRowIndex`, `proof_of_payment`, `approval_or_rejected_date`, `loan_officer_id`, `includes_past_due`, `past_due_amount`, `original_amount`, `remarks`, `past_due_handled`, `past_due_handled_date`) VALUES
(82, 41, 3933.33, '2025-05-16 14:43:13', 'Approved', NULL, 'EWALLET', NULL, 'LOAN-maqwqjbqf26', 1, '{\"id\":\"68274ecf04badd57f4d8afb2\",\"external_id\":\"LOAN-maqwqjbqf26\",\"user_id\":\"680846c63556ce3a888470a3\",\"payment_method\":\"EWALLET\",\"status\":\"PAID\",\"merchant_name\":\"LendEase\",\"merchant_profile_picture_url\":\"https://du8nwjtfkinx.cloudfront.net/xendit.png\",\"amount\":3933.33,\"paid_amount\":3933.33,\"paid_at\":\"2025-05-16T14:43:01.034Z\",\"payer_email\":\"borrower@email.com\",\"description\":\"Loan Payment for ac7c41bb-1028-4f6d-9432-b907d74972e3 - Month 1\",\"expiry_date\":\"2025-05-17T14:42:23.541Z\",\"invoice_url\":\"https://checkout-staging.xendit.co/web/68274ecf04badd57f4d8afb2\",\"available_banks\":[],\"available_retail_outlets\":[{\"retail_outlet_name\":\"7ELEVEN\"},{\"retail_outlet_name\":\"CEBUANA\"}],\"available_ewallets\":[{\"ewallet_type\":\"PAYMAYA\"},{\"ewallet_type\":\"GCASH\"}],\"available_qr_codes\":[],\"available_direct_debits\":[],\"available_paylaters\":[],\"should_exclude_credit_card\":false,\"should_send_email\":false,\"success_redirect_url\":\"http://localhost:5173//app/loan_details/41?payment=success&reference=LOAN-maqwqjbqf26\",\"failure_redirect_url\":\"http://localhost:5173//app/loan_details/41?payment=failed&reference=LOAN-maqwqjbqf26\",\"created\":\"2025-05-16T14:42:23.711Z\",\"updated\":\"2025-05-16T14:43:03.679Z\",\"currency\":\"PHP\",\"payment_channel\":\"GCASH\",\"items\":[{\"name\":\"Loan Payment - Month 1\",\"quantity\":1,\"price\":3933.3333333333335,\"category\":\"Loan Payment\"}],\"fees\":[{\"type\":\"Interest\",\"value\":0}],\"payment_id\":\"ewc_f6e7671c-c78e-4502-aae0-47fe23857307\",\"payment_method_id\":\"pm-0b0d6394-6122-400b-b554-6f78c2b3e6c9\",\"customer\":{\"given_names\":\"Borrower\",\"surname\":\"Name\",\"email\":\"borrower@email.com\",\"mobile_number\":\"+639123456789\"},\"customer_notification_preference\":{\"invoice_created\":[\"email\",\"sms\"],\"invoice_reminder\":[\"email\",\"sms\"],\"invoice_paid\":[\"email\",\"sms\"],\"invoice_expired\":[\"email\"]},\"metadata\":null}', '2025-05-16 14:43:13', NULL, 0, 0.00, 3933.33, 'Payment received via Xendit (GCASH) - Manual Processing', 0, '2025-05-16 14:43:13'),
(83, 41, 3933.33, '2025-05-16 17:13:09', 'Approved', NULL, 'EWALLET', NULL, 'LOAN-mar242dc2lr', 2, '{\"id\":\"68277211f8b2f613b29f0c6c\",\"external_id\":\"LOAN-mar242dc2lr\",\"user_id\":\"680846c63556ce3a888470a3\",\"payment_method\":\"EWALLET\",\"status\":\"PAID\",\"merchant_name\":\"LendEase\",\"merchant_profile_picture_url\":\"https://du8nwjtfkinx.cloudfront.net/xendit.png\",\"amount\":3933.33,\"paid_amount\":3933.33,\"paid_at\":\"2025-05-16T17:12:57.150Z\",\"payer_email\":\"borrower@email.com\",\"description\":\"Loan Payment for ac7c41bb-1028-4f6d-9432-b907d74972e3 - Month 2\",\"expiry_date\":\"2025-05-17T17:12:50.078Z\",\"invoice_url\":\"https://checkout-staging.xendit.co/web/68277211f8b2f613b29f0c6c\",\"available_banks\":[],\"available_retail_outlets\":[{\"retail_outlet_name\":\"7ELEVEN\"},{\"retail_outlet_name\":\"CEBUANA\"}],\"available_ewallets\":[{\"ewallet_type\":\"PAYMAYA\"},{\"ewallet_type\":\"GCASH\"}],\"available_qr_codes\":[],\"available_direct_debits\":[],\"available_paylaters\":[],\"should_exclude_credit_card\":false,\"should_send_email\":false,\"success_redirect_url\":\"http://localhost:5173//app/loan_details/41?payment=success&reference=LOAN-mar242dc2lr\",\"failure_redirect_url\":\"http://localhost:5173//app/loan_details/41?payment=failed&reference=LOAN-mar242dc2lr\",\"created\":\"2025-05-16T17:12:50.361Z\",\"updated\":\"2025-05-16T17:12:59.308Z\",\"currency\":\"PHP\",\"payment_channel\":\"GCASH\",\"items\":[{\"name\":\"Loan Payment - Month 2\",\"quantity\":1,\"price\":3933.3333333333335,\"category\":\"Loan Payment\"}],\"fees\":[{\"type\":\"Interest\",\"value\":0}],\"payment_id\":\"ewc_22f4d056-67f0-41f0-a358-aa012b332d1c\",\"payment_method_id\":\"pm-52389bbd-74fc-4554-b17f-af292f79da9d\",\"customer\":{\"given_names\":\"Borrower\",\"surname\":\"Name\",\"email\":\"borrower@email.com\",\"mobile_number\":\"+639123456789\"},\"customer_notification_preference\":{\"invoice_created\":[\"email\",\"sms\"],\"invoice_reminder\":[\"email\",\"sms\"],\"invoice_paid\":[\"email\",\"sms\"],\"invoice_expired\":[\"email\"]},\"metadata\":null}', '2025-05-16 17:13:09', NULL, 0, 0.00, 3933.33, 'Payment received via Xendit (GCASH) - Manual Processing', 0, '2025-05-16 17:13:09');

-- --------------------------------------------------------

--
-- Table structure for table `payment_attempts`
--

CREATE TABLE `payment_attempts` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `loan_id` int NOT NULL,
  `payment_index` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `payment_intent_id` varchar(255) NOT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  `error_message` text,
  `created_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_attempts`
--

INSERT INTO `payment_attempts` (`id`, `loan_id`, `payment_index`, `amount`, `reference`, `payment_intent_id`, `status`, `error_message`, `created_at`, `completed_at`) VALUES
(59, 41, 1, 3933.33, 'LOAN-ac7c41bb-1028-4f6d-9432-b907d74972e3-1-1747177371896', '6823cf9c77df12120eecb665', 'completed', NULL, '2025-05-14 07:02:52', NULL),
(60, 41, 1, 3933.33, 'LOAN-ac7c41bb-1028-4f6d-9432-b907d74972e3-1-1747177551831', '6823d05004badd57f4d409c2', 'completed', NULL, '2025-05-14 07:05:52', NULL),
(61, 41, 1, 3933.33, 'LOAN-ac7c41bb-1028-4f6d-9432-b907d74972e3-1-1747178145245', '6823d2a104badd57f4d40dc9', 'completed', NULL, '2025-05-14 07:15:45', NULL),
(62, 41, 1, 3933.33, 'LOAN-ac7c41bb-1028-4f6d-9432-b907d74972e3-1-1747178377800', '6823d38a04badd57f4d40e90', 'completed', NULL, '2025-05-14 07:19:38', NULL),
(63, 41, 1, 3933.33, 'LOAN-ac7c41bb-1028-4f6d-9432-b907d74972e3-1-1747178844167', '6823d55c04badd57f4d410c4', 'completed', NULL, '2025-05-14 07:27:25', NULL),
(64, 41, 1, 3933.33, 'P-man57egosfj', '6823d5a004badd57f4d4111c', 'completed', NULL, '2025-05-14 07:28:32', NULL),
(65, 41, 1, 3933.33, 'P-man58d9v6y2', '6823d5c004badd57f4d41136', 'completed', NULL, '2025-05-14 07:29:04', NULL),
(66, 41, 1, 3933.33, 'LOAN-man58x8he8d', '6823d5db04badd57f4d41151', 'completed', NULL, '2025-05-14 07:29:31', NULL),
(67, 41, 1, 3933.33, 'LOAN-man64vwu7b7', '6823dbad77df12120eecc6f1', 'completed', NULL, '2025-05-14 07:54:22', NULL),
(68, 41, 1, 3933.33, 'LOAN-manyo8som2i', '682496ebfb48fba4059850e3', 'completed', NULL, '2025-05-14 21:13:15', NULL),
(69, 41, 1, 3933.33, 'LOAN-maqwlg6z3tz', '68274de204badd57f4d8aef1', 'completed', NULL, '2025-05-16 22:38:24', NULL),
(70, 41, 1, 3933.33, 'LOAN-maqwqjbqf26', '68274ecf04badd57f4d8afb2', 'completed', NULL, '2025-05-16 22:42:20', NULL),
(71, 41, 2, 3933.33, 'LOAN-mar242dc2lr', '68277211f8b2f613b29f0c6c', 'completed', NULL, '2025-05-17 01:12:50', NULL),
(72, 41, 3, 3933.33, 'LOAN-mar3ra3f837', '68277cdcf8b2f613b29f15ba', 'completed', NULL, '2025-05-17 01:58:52', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payment_method`
--

CREATE TABLE `payment_method` (
  `method_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `method_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_method`
--

INSERT INTO `payment_method` (`method_id`, `method_name`) VALUES
(1, 'Cash'),
(2, 'Gcash'),
(3, 'Bank Transfer'),
(4, 'Cash');

-- --------------------------------------------------------

--
-- Table structure for table `qr_code`
--

CREATE TABLE `qr_code` (
  `qr_code_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `qr_code`
--

INSERT INTO `qr_code` (`qr_code_id`, `code`, `type`) VALUES
(1, 'QR123456', 'Loan Application'),
(5, 'c0ac1912-9b6a-4393-abad-5969bb591167', 'Loan Application'),
(6, '5b346826-8415-48a2-bb13-240e3d73f6e4', 'Loan Application'),
(7, 'bf6a7887-c4be-4583-bffe-fda1be10bd41', 'Loan Application'),
(8, 'e813e5c1-ef0d-454e-a6c6-177f6d560cb3', 'Loan Application'),
(9, 'b0c012fd-c095-4c3a-bc2a-d3ff73040dca', 'Loan Application'),
(10, 'fe218ef6-e1cc-4ea9-a962-e9e61f070ca1', 'Loan Application'),
(11, '4d89f7c4-6342-4bba-8bba-b77e7754b737', 'Loan Application'),
(12, '2ba23258-028c-4e3e-b658-008352e56ad4', 'Loan Application'),
(13, '0791da49-762c-44ff-906e-1327b8cc6ffe', 'Loan Application'),
(14, '4e2787a3-6c1e-436d-a07e-662127105c4e', 'Loan Application'),
(15, '7e0b0130-067a-4c2a-82c0-f150d1301760', 'Loan Application'),
(16, '3f307c53-d8be-46b0-8126-a3769174d4ef', 'Loan Application'),
(17, '42b720a1-6a12-4619-a24f-af01e9631d04', 'Loan Application'),
(18, '2b4591c4-8b3f-4029-b667-2ddef52f5230', 'Loan Application'),
(19, '35a4b33f-379b-42e8-9380-4672f1047cfb', 'Loan Application'),
(20, 'd616d4e0-bb89-43ec-b280-6f042ae040c7', 'Loan Application'),
(21, 'c0956404-8a61-42d0-8411-84b328eb6c80', 'Loan Application'),
(22, 'd71cd7f5-2077-49f8-b218-c53b47bb0df2', 'Loan Application'),
(23, 'd8ab5a08-b274-4bab-9bc1-3f0b8e8bebc8', 'Loan Application'),
(24, 'beb935e2-3b01-43da-8496-a007dc7bf3d8', 'Loan Application'),
(25, 'e286fceb-fc91-4c55-82e0-1405ad82701b', 'Loan Application'),
(26, '290a7b15-6540-4c12-8951-55c970ece746', 'Loan Application'),
(27, 'ec43029e-23a4-4a7d-a1a8-762d15fd5f7d', 'Loan Application'),
(28, '9be204ca-00b0-43bc-82a4-0c839d98ebde', 'Loan Application'),
(29, '0456ceda-fa9a-4d5c-b5a3-d8fc378b0bd5', 'Loan Application'),
(30, 'acdc8068-86d0-410b-9f6b-d5fe4b866c5c', 'Loan Application'),
(31, 'fef2a249-6c17-4d15-81cb-e13ba685402e', 'Loan Application'),
(32, 'f62b8dad-0b7d-479a-9d64-0765f60d0e2c', 'Loan Application'),
(33, '2a687572-3cd1-4526-a850-1e0b25c74539', 'Loan Application'),
(34, 'e700d005-55d6-4953-8591-18301120b93d', 'Loan Application'),
(35, '9df84a54-2832-41f2-8fa5-8dc565060293', 'Loan Application'),
(36, 'ce6b072c-7bb9-4653-ba22-3e14ddcbbf5a', 'Loan Application'),
(37, 'c56de879-f3b5-41b3-a3b0-c55f8b9e39c1', 'Loan Application'),
(38, 'cae3d163-154b-4a4a-b489-28e1620ff5d7', 'Loan Application'),
(39, '7731a096-cdb6-443c-8ed1-baa3765d624a', 'Loan Application'),
(40, 'e890c2b8-4656-4200-b263-f894a50ed06e', 'Loan Application'),
(41, 'ac7c41bb-1028-4f6d-9432-b907d74972e3', 'Loan Application'),
(42, '25a691e0-62b5-47cf-8ccc-efc8919ccbfd', 'Loan Application'),
(43, '94db8588-8f11-4ba8-afce-e396f35c1ec2', 'Loan Application'),
(44, '4a428414-8f77-4676-a275-c896d880e30d', 'Loan Application'),
(45, '3d83757e-e7c0-48c5-a48f-e8f7a771593d', 'Loan Application'),
(46, '52685d93-ed6c-4ce2-9369-4a7a0cda5af4', 'Loan Application'),
(47, 'f962bd7b-cfce-4572-8c01-8469c2b92f39', 'Loan Application');

-- --------------------------------------------------------

--
-- Table structure for table `sms`
--

CREATE TABLE `sms` (
  `sms_id` int NOT NULL,
  `sender` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `receiver` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `date_sent` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sms`
--

INSERT INTO `sms` (`sms_id`, `sender`, `receiver`, `message`, `date_sent`, `status`) VALUES
(1, 'dextermiranda441@gmail.com', '09275478620', 'Your loan application has been successfully confirmed. Thank you for choosing us!', '2024-12-25 06:59:31', 'Pending'),
(2, 'SYSTEM', '09275478620', 'Your loan application has been successfully confirmed. Thank you for choosing us!', '2024-12-25 07:00:25', 'Pending'),
(3, 'SYSTEM', '09275478620', 'Reminder: Your loan payment is due. Please make the payment by the due date to avoid penalties.', '2024-12-25 07:16:48', 'Pending'),
(4, 'SYSTEM', '09275478620', 'Reminder: Your loan payment is due. Please make the payment by the due date to avoid penalties.', '2024-12-25 07:17:54', 'Pending'),
(5, 'SYSTEM', '09275478620', 'Your loan application has been successfully confirmed. Thank you for choosing us!', '2024-12-25 07:32:02', 'Pending'),
(6, 'SYSTEM', '09275478620', 'Your loan application has been successfully confirmed. Thank you for choosing us!', '2025-01-16 10:25:10', 'Pending'),
(7, 'SYSTEM', '09275478620', 'Your loan application has been successfully confirmed. Thank you for choosing us!', '2025-01-16 10:25:24', 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `staff_salaries`
--

CREATE TABLE `staff_salaries` (
  `salary_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `staff_id` int NOT NULL,
  `salary_amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` enum('Cash','Bank Transfer','GCash') DEFAULT 'Cash'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `payment_id` int DEFAULT NULL,
  `method_id` int DEFAULT NULL,
  `transaction_amount` decimal(10,2) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `transaction_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `role` enum('Dentist','Secretary','Patient') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_account`
--

CREATE TABLE `user_account` (
  `user_id` int NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `borrower_id` int DEFAULT NULL,
  `collector_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `officer_id` int DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_account`
--

INSERT INTO `user_account` (`user_id`, `username`, `password`, `role_id`, `borrower_id`, `collector_id`, `admin_id`, `officer_id`, `is_verified`) VALUES
(1, 'borrower@gmail.com', 'password', 4, 1, NULL, NULL, NULL, 1),
(2, 'loan_officer@gmail.com', 'password', 2, NULL, NULL, NULL, 1, 1),
(4, 'jham@gmail.com', 'password', 4, 11, NULL, NULL, NULL, 1),
(5, 'dextermiranda441@gmail.com', 'password', 4, 14, NULL, NULL, NULL, 1),
(6, 'admin@gmail.com', 'password', 1, NULL, NULL, 1, NULL, 1),
(8, 'collector@gmail.com', 'password', 3, NULL, 1, NULL, NULL, 1),
(13, 'ninagillianvillamin1128@gmail.com', 'dsadsasasas', 4, 58, NULL, NULL, NULL, 1),
(14, 'numinum1128@gmail.com', 'z38a2x8f', 4, 59, NULL, NULL, NULL, 1),
(15, 'ninagv090522@gmail.com', 't92whetr', 4, 60, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_log`
--

CREATE TABLE `user_log` (
  `log_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_log`
--

INSERT INTO `user_log` (`log_id`, `user_id`, `action`, `timestamp`, `details`, `ip_address`) VALUES
(1, 1, 'Login', '2024-11-04 10:00:00', 'User logged in successfully', '192.168.1.1');

-- --------------------------------------------------------

--
-- Table structure for table `user_role`
--

CREATE TABLE `user_role` (
  `role_id` int NOT NULL,
  `role_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_role`
--

INSERT INTO `user_role` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(2, 'Loan Officer'),
(3, 'Collector'),
(4, 'Borrower');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `borrower_id` (`borrower_id`);

--
-- Indexes for table `admin_account`
--
ALTER TABLE `admin_account`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `borrower_account`
--
ALTER TABLE `borrower_account`
  ADD PRIMARY KEY (`borrower_id`);

--
-- Indexes for table `collateral`
--
ALTER TABLE `collateral`
  ADD PRIMARY KEY (`collateral_id`),
  ADD KEY `loan_id` (`loan_id`);

--
-- Indexes for table `collector_account`
--
ALTER TABLE `collector_account`
  ADD PRIMARY KEY (`collector_id`),
  ADD UNIQUE KEY `collector_id` (`collector_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `disbursement_details`
--
ALTER TABLE `disbursement_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employed_details`
--
ALTER TABLE `employed_details`
  ADD PRIMARY KEY (`employed_id`);

--
-- Indexes for table `guarantor`
--
ALTER TABLE `guarantor`
  ADD PRIMARY KEY (`guarantor_id`),
  ADD KEY `borrower_id` (`borrower_id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_inventory_item_name` (`item_name`);

--
-- Indexes for table `loan`
--
ALTER TABLE `loan`
  ADD PRIMARY KEY (`loan_id`),
  ADD KEY `borrower_id` (`borrower_id`);

--
-- Indexes for table `loan_application`
--
ALTER TABLE `loan_application`
  ADD PRIMARY KEY (`application_id`),
  ADD KEY `borrower_id` (`borrower_id`),
  ADD KEY `qr_code_id` (`qr_code_id`);

--
-- Indexes for table `loan_officer`
--
ALTER TABLE `loan_officer`
  ADD PRIMARY KEY (`officer_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `loan_setting_parameters`
--
ALTER TABLE `loan_setting_parameters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loan_type` (`loan_type`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `message_templates`
--
ALTER TABLE `message_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nonemployed_details`
--
ALTER TABLE `nonemployed_details`
  ADD PRIMARY KEY (`nonemployed_id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `borrower_id` (`borrower_id`);

--
-- Indexes for table `notification_template`
--
ALTER TABLE `notification_template`
  ADD PRIMARY KEY (`template_id`);

--
-- Indexes for table `password_recovery_req`
--
ALTER TABLE `password_recovery_req`
  ADD PRIMARY KEY (`recovery_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `payment_method_id` (`payment_method_id`);

--
-- Indexes for table `payment_attempts`
--
ALTER TABLE `payment_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_id` (`loan_id`);

--
-- Indexes for table `payment_method`
--
ALTER TABLE `payment_method`
  ADD PRIMARY KEY (`method_id`);

--
-- Indexes for table `qr_code`
--
ALTER TABLE `qr_code`
  ADD PRIMARY KEY (`qr_code_id`);

--
-- Indexes for table `sms`
--
ALTER TABLE `sms`
  ADD PRIMARY KEY (`sms_id`);

--
-- Indexes for table `staff_salaries`
--
ALTER TABLE `staff_salaries`
  ADD PRIMARY KEY (`salary_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `method_id` (`method_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_account`
--
ALTER TABLE `user_account`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `borrower_id` (`borrower_id`),
  ADD KEY `collector_id` (`collector_id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `officer_id` (`officer_id`);

--
-- Indexes for table `user_log`
--
ALTER TABLE `user_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `borrower_account`
--
ALTER TABLE `borrower_account`
  MODIFY `borrower_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `disbursement_details`
--
ALTER TABLE `disbursement_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `employed_details`
--
ALTER TABLE `employed_details`
  MODIFY `employed_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `item_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan`
--
ALTER TABLE `loan`
  MODIFY `loan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `loan_setting_parameters`
--
ALTER TABLE `loan_setting_parameters`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_templates`
--
ALTER TABLE `message_templates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `nonemployed_details`
--
ALTER TABLE `nonemployed_details`
  MODIFY `nonemployed_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `payment_attempts`
--
ALTER TABLE `payment_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `qr_code`
--
ALTER TABLE `qr_code`
  MODIFY `qr_code_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `sms`
--
ALTER TABLE `sms`
  MODIFY `sms_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `staff_salaries`
--
ALTER TABLE `staff_salaries`
  MODIFY `salary_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_account`
--
ALTER TABLE `user_account`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `collateral`
--
ALTER TABLE `collateral`
  ADD CONSTRAINT `collateral_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`loan_id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_application`
--
ALTER TABLE `loan_application`
  ADD CONSTRAINT `loan_application_ibfk_2` FOREIGN KEY (`qr_code_id`) REFERENCES `qr_code` (`qr_code_id`);

--
-- Constraints for table `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `staff_salaries`
--
ALTER TABLE `staff_salaries`
  ADD CONSTRAINT `staff_salaries_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`method_id`) REFERENCES `payment_method` (`method_id`);

--
-- Constraints for table `user_account`
--
ALTER TABLE `user_account`
  ADD CONSTRAINT `user_account_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `user_role` (`role_id`),
  ADD CONSTRAINT `user_account_ibfk_3` FOREIGN KEY (`collector_id`) REFERENCES `collector_account` (`collector_id`),
  ADD CONSTRAINT `user_account_ibfk_4` FOREIGN KEY (`admin_id`) REFERENCES `admin_account` (`admin_id`),
  ADD CONSTRAINT `user_account_ibfk_5` FOREIGN KEY (`officer_id`) REFERENCES `loan_officer` (`officer_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
