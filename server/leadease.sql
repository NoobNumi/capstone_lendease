-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 26, 2025 at 03:02 PM
-- Server version: 8.4.3
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `final_bu`
--

-- --------------------------------------------------------

--
-- Table structure for table `address`
--

CREATE TABLE `address` (
  `address_id` int NOT NULL,
  `borrower_id` int DEFAULT NULL,
  `street` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `zip_code` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  `admin_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  `borrower_id` int NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nationality` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `religion` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_region` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_province` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_barangay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `zip_code` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employment_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employment_years` decimal(10,2) DEFAULT NULL,
  `monthly_income` decimal(10,2) DEFAULT NULL,
  `credit_score` int DEFAULT NULL,
  `registration_date` datetime DEFAULT NULL,
  `profile_pic` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `work_type` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `position` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrower_account`
--

INSERT INTO `borrower_account` (`borrower_id`, `first_name`, `middle_name`, `last_name`, `age`, `contact_number`, `email`, `date_of_birth`, `gender`, `nationality`, `religion`, `address_region`, `address_province`, `address_city`, `address_barangay`, `zip_code`, `employment_status`, `employment_years`, `monthly_income`, `credit_score`, `registration_date`, `profile_pic`, `work_type`, `position`, `status`) VALUES
(1, 'Zoren', 'Bequillo', 'Madridano', 30, '09275478620', 'dextermiranda441@gmail.com', '1997-04-17', 'Female', 'Filipino', 'Christian', '05', '0505', '050517', '050517002', '1100', 'Employed', 2.00, 40000.00, 750, '2024-11-04 12:00:00', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Fuser%2F1%2Fprofile_pic%2Fmiddle-school-male-student_10045-787.jpg?alt=media&token=c5b2ae57-2f11-46d0-94f0-abdb348626ab', NULL, NULL, NULL),
(2, 'Dexter', '', 'Miranda', 1, '09275478620', 'dextermiranda442@gmail.com', '2023-01-01', 'MALE', 'FILIPINO', 'JW', '01', '0128', 'MALE', '012801001', NULL, NULL, 0.00, 15000.00, NULL, NULL, NULL, 'Private Employee', 'programmer', 'employed'),
(11, 'Jham', '', 'Banaria', 1, '09275478630', 'jham@gmail.com', '2023-01-01', 'MALE', 'FILIPINO', 'JW', '01', '0128', 'MALE', '012801001', NULL, NULL, 0.00, 20000.00, NULL, NULL, 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Fuser%2F4%2Fprofile_pic%2Fmiddle-school-male-student_10045-787.jpg?alt=media&token=99bc8a07-190f-46f8-9fb3-5a61e6df8505', 'Private Employee', 'dev', 'employed'),
(12, 'Dexter', '', 'Miranda', NULL, '09275478620', 'dextermiranda441@gmail.com', '2025-01-24', NULL, NULL, NULL, '05', '0505', '050501', '050501002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'Dexter', '', 'Miranda', NULL, '09275478930', 'dextermiranda445@gmail.com', '2025-01-24', NULL, NULL, NULL, '02', '0209', '020903', '020903002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Dexter', '', 'Miranda', NULL, '09914762429', 'dextermirand345@gmail.com', '2025-01-24', NULL, NULL, NULL, '02', '0209', '020903', '020903002', NULL, NULL, NULL, NULL, NULL, NULL, 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Fuser%2F5%2Fprofile_pic%2Fcool_16876150.png?alt=media&token=f7883f16-c28b-4cc7-b54f-a7451054821c', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `collateral`
--

CREATE TABLE `collateral` (
  `collateral_id` int NOT NULL,
  `loan_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `value` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `collector_account`
--

CREATE TABLE `collector_account` (
  `collector_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `collector_account`
--

INSERT INTO `collector_account` (`collector_id`, `name`, `department`, `contact_number`, `email`, `username`, `password`) VALUES
(1, 'Bob Johnson', 'Collections', '09123456789', 'bob.johnson@example.com', 'bobjohnson', 'securepassword');

-- --------------------------------------------------------

--
-- Table structure for table `disbursement_details`
--

CREATE TABLE `disbursement_details` (
  `id` int NOT NULL,
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
(4, 39, 'Dexter Miranda', '09275478620', 20000.00, '2025-01-24 01:16:12', 'E-WALLET/BANK TRANSFER', 'Gcash', '', '2025-01-24 01:16:12', '2025-01-24 01:16:12', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F39%2Fproof_of_disbursement%2FBlue%20White%20Aesthetic%20Wedding%20Invitation.png?alt=media&token=4ceb4558-0357-456c-bd56-abf1f14c4aae');

-- --------------------------------------------------------

--
-- Table structure for table `guarantor`
--

CREATE TABLE `guarantor` (
  `guarantor_id` int NOT NULL,
  `borrower_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `relationship_to_borrower` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  `item_id` int NOT NULL,
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
  `loan_id` int NOT NULL,
  `loan_application_id` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `borrower_id` int DEFAULT NULL,
  `loan_type_id` int DEFAULT NULL,
  `loan_type_value` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `loan_amount` decimal(10,2) DEFAULT NULL,
  `interest_rate` decimal(5,2) DEFAULT NULL,
  `loan_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `application_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `approval_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `repayment_schedule_id` int DEFAULT NULL,
  `purpose` text COLLATE utf8mb4_general_ci,
  `remarks` text COLLATE utf8mb4_general_ci,
  `borrowers_valid_id` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `bank_statement` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `co_makers_valid_id` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `loan_officer_id` int DEFAULT NULL,
  `disbursement_id` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_work_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_has_business` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_type_of_business` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_business_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_income_flow` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_income_amount` decimal(10,2) DEFAULT NULL,
  `non_employee_numberField` decimal(10,2) DEFAULT NULL,
  `non_employee_loan_security` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_relationship_to_loan_guarantor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `non_employee_loan_guarantor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `disbursement_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `disbursement_bank_or_wallet_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `disbursement_account_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `disbursement_account_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan`
--

INSERT INTO `loan` (`loan_id`, `loan_application_id`, `borrower_id`, `loan_type_id`, `loan_type_value`, `loan_amount`, `interest_rate`, `loan_status`, `application_date`, `approval_date`, `repayment_schedule_id`, `purpose`, `remarks`, `borrowers_valid_id`, `bank_statement`, `co_makers_valid_id`, `loan_officer_id`, `disbursement_id`, `non_employee_work_name`, `non_employee_has_business`, `non_employee_type_of_business`, `non_employee_business_address`, `non_employee_income_flow`, `non_employee_income_amount`, `non_employee_numberField`, `non_employee_loan_security`, `non_employee_relationship_to_loan_guarantor`, `non_employee_loan_guarantor`, `disbursement_type`, `disbursement_bank_or_wallet_name`, `disbursement_account_name`, `disbursement_account_number`) VALUES
(34, 'e700d005-55d6-4953-8591-18301120b93d', 1, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 36.00, 'Approved', '2024-12-25 03:35:25', '2024-12-25 03:35:25', 6, 'HOUSING LOAN', 'approve and validated', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe700d005-55d6-4953-8591-18301120b93d%2Ffossil.jpg?alt=media&token=a3f9b91a-5ea8-4c79-b769-ad09b7180005', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe700d005-55d6-4953-8591-18301120b93d%2Fgalaxy.jpg?alt=media&token=94c38f49-2b6e-484c-adfb-4b20ca55c87f', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe700d005-55d6-4953-8591-18301120b93d%2Fgalaxy2.jpg?alt=media&token=2d9c660c-e3dd-403e-97a0-d11c791fdbf0', 2, '', '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL),
(35, '9df84a54-2832-41f2-8fa5-8dc565060293', 11, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 15000.00, 36.00, 'Pending', '2024-12-28 06:15:02', '2024-12-28 06:15:02', 6, 'HOUSING LOAN', '', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F9df84a54-2832-41f2-8fa5-8dc565060293%2Ffossil.jpg?alt=media&token=79a5f99c-adbd-4689-82eb-51cf0f702ab3', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F9df84a54-2832-41f2-8fa5-8dc565060293%2Fgalaxy.jpg?alt=media&token=931f9daa-2c8f-413c-b3e4-0e1366b958c3', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F9df84a54-2832-41f2-8fa5-8dc565060293%2Fiii.jfif?alt=media&token=9c22e21d-4952-4e9a-be74-e960d92ee362', NULL, '', '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL),
(36, 'ce6b072c-7bb9-4653-ba22-3e14ddcbbf5a', 11, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 30000.00, 36.00, 'Approved', '2024-12-28 06:28:07', '2024-12-28 06:28:07', 12, 'HOUSING LOAN', 'approved', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fce6b072c-7bb9-4653-ba22-3e14ddcbbf5a%2Fb2f54200-f606-4828-b929-6d5a54886309%20(1).jfif?alt=media&token=62c655cb-5dad-486f-9a20-cb420c3f4f10', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fce6b072c-7bb9-4653-ba22-3e14ddcbbf5a%2Fdc9540bb-7b1f-4610-a839-5389429f68b9.jfif?alt=media&token=9523c205-aa67-4c45-b791-0ea9098ea836', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fce6b072c-7bb9-4653-ba22-3e14ddcbbf5a%2Feb435d2b-a1a2-4aa9-a215-6225fdd7bad7%20(1).jfif?alt=media&token=f498e25b-b0de-4602-b966-4545881f2d20', 2, '', '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL),
(37, 'c56de879-f3b5-41b3-a3b0-c55f8b9e39c1', 1, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 20000.00, 7.00, 'Rejected', '2024-12-29 14:02:04', '2024-12-29 14:02:04', 12, 'OTHERS', 'rejected', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fc56de879-f3b5-41b3-a3b0-c55f8b9e39c1%2F2022-02-21.png?alt=media&token=11dd4cf1-a852-4898-9a43-cbd921430c2a', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fc56de879-f3b5-41b3-a3b0-c55f8b9e39c1%2F2022-02-21.png?alt=media&token=7a695832-6fb7-4736-a1c0-506e1c1373e1', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fc56de879-f3b5-41b3-a3b0-c55f8b9e39c1%2F2022-02-21.png?alt=media&token=90399346-8249-47af-b213-82386f7fa51d', 1, '', '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL),
(38, 'cae3d163-154b-4a4a-b489-28e1620ff5d7', 1, NULL, 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', 26000.00, 7.00, 'Rejected', '2025-01-16 09:18:18', '2025-01-16 09:18:18', 6, 'HOUSING LOAN', 'rejected no id', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fcae3d163-154b-4a4a-b489-28e1620ff5d7%2F49e7128e-0aca-4e94-b3cc-9726d3edd51b.jpg?alt=media&token=14090b52-1e43-423a-bb60-bb2ee9c9fec0', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fcae3d163-154b-4a4a-b489-28e1620ff5d7%2F49e7128e-0aca-4e94-b3cc-9726d3edd51b.jpg?alt=media&token=fa466e6b-9a03-4a60-9a6f-288492e60e75', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fcae3d163-154b-4a4a-b489-28e1620ff5d7%2Fcool_16876150.png?alt=media&token=d5e5e1eb-ccf5-4d18-8b81-4d38e518fc65', 1, NULL, '', '', NULL, '', '', 0.00, 0.00, '', '', '', '', NULL, NULL, NULL),
(39, '7731a096-cdb6-443c-8ed1-baa3765d624a', 1, NULL, 'NON-EMPLOYEE LOAN', 20000.00, 3.00, 'Approved', '2025-01-23 11:57:31', '2025-01-23 11:57:31', 6, '', 'approved', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F7731a096-cdb6-443c-8ed1-baa3765d624a%2FWedding%20Invitation.png?alt=media&token=ddc6f20f-17c9-490e-850f-b2e289065d49', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F7731a096-cdb6-443c-8ed1-baa3765d624a%2FWedding%20Invitation.png?alt=media&token=0a638dde-9f89-4f98-9da8-88a8da4f6419', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F7731a096-cdb6-443c-8ed1-baa3765d624a%2FBlue%20White%20Aesthetic%20Wedding%20Invitation.png?alt=media&token=fc39a3bf-be1a-44cf-8b00-ceaafd8c4128', 1, NULL, 'tindera', 'YES', 'Corporation', 'pawa legazpi city', 'MONTHLY', 19999.00, 123.00, '123', 'SPOUSE', 'jam', 'E-WALLET/BANK TRANSFER', 'Gcash', 'Dexter Miranda', '09275478620'),
(40, 'e890c2b8-4656-4200-b263-f894a50ed06e', 14, NULL, 'NON-EMPLOYEE LOAN', 20000.00, 3.00, 'Approved', '2025-01-24 01:43:37', '2025-01-24 01:43:37', 6, '', 'done', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe890c2b8-4656-4200-b263-f894a50ed06e%2FBlue%20White%20Aesthetic%20Wedding%20Invitation.png?alt=media&token=a03d546c-ce58-4123-879c-a753c0cc562f', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe890c2b8-4656-4200-b263-f894a50ed06e%2FWedding%20Invitation.png?alt=media&token=86cdbf3d-8fa2-4a05-a432-8a84e5e7d4e6', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2Fe890c2b8-4656-4200-b263-f894a50ed06e%2FWedding%20Invitation.png?alt=media&token=03e51082-dd8f-4b16-a2c9-96769421aa34', 1, NULL, 'tindera', 'YES', 'Corporation', '5th wave', 'MONTHLY', 150000.00, 1.00, '1', 'SPOUSE', 'jam', 'CASH', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `loan_application`
--

CREATE TABLE `loan_application` (
  `application_id` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `borrower_id` int DEFAULT NULL,
  `loan_amount` decimal(10,2) DEFAULT NULL,
  `application_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qr_code_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_application`
--

INSERT INTO `loan_application` (`application_id`, `borrower_id`, `loan_amount`, `application_date`, `status`, `qr_code_id`) VALUES
('162161c5-6812-46c2-86f5-9bf306f6c979', 1, 26000.00, '2025-01-16 09:17:43', 'Pending', 1),
('16238677-8933-4874-8971-2cece0622da4', 1, 20000.00, '2025-01-23 11:55:53', 'Pending', 1),
('18b7fc42-b6c5-47b8-869b-ae26aeb8bfe0', 1, 20000.00, '2024-12-25 03:31:08', 'Pending', 1),
('2b805a17-a00a-4dd2-bc01-bc26884b56e2', 1, 20000.00, '2024-12-25 03:34:00', 'Pending', 1),
('319a5019-33c9-40ee-a9ce-57d859c997cd', 1, 20000.00, '2024-12-25 03:35:03', 'Pending', 1),
('35cf1603-b12d-42ee-8b37-c96fabe9a45b', 1, 20000.00, '2024-12-25 03:30:41', 'Pending', 1),
('7731a096-cdb6-443c-8ed1-baa3765d624a', 1, 20000.00, '2025-01-23 11:57:31', 'Approved', 1),
('98f18e78-22dd-411f-9da1-4d367c3c4387', 1, 20000.00, '2024-12-25 03:33:00', 'Pending', 1),
('9df84a54-2832-41f2-8fa5-8dc565060293', 4, 15000.00, '2024-12-28 06:15:02', 'Pending', 1),
('c56de879-f3b5-41b3-a3b0-c55f8b9e39c1', 1, 20000.00, '2024-12-29 14:02:04', 'Rejected', 1),
('cae3d163-154b-4a4a-b489-28e1620ff5d7', 1, 26000.00, '2025-01-16 09:18:18', 'Rejected', 1),
('ce6b072c-7bb9-4653-ba22-3e14ddcbbf5a', 11, 30000.00, '2024-12-28 06:28:06', 'Approved', 1),
('db7b6325-d1bc-4472-a9d7-b261f319dc10', 1, 26000.00, '2025-01-16 09:17:49', 'Pending', 1),
('e700d005-55d6-4953-8591-18301120b93d', 1, 20000.00, '2024-12-25 03:35:25', 'Approved', 1),
('e890c2b8-4656-4200-b263-f894a50ed06e', 1, 20000.00, '2025-01-24 01:43:36', 'Approved', 1);

-- --------------------------------------------------------

--
-- Table structure for table `loan_officer`
--

CREATE TABLE `loan_officer` (
  `officer_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
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
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `notification_id` int NOT NULL,
  `borrower_id` int DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `date_sent` datetime DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  `template_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `template_content` text COLLATE utf8mb4_general_ci
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
  `user_id` int DEFAULT NULL,
  `token` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `expiration_date` datetime DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int NOT NULL,
  `loan_id` int DEFAULT NULL,
  `payment_amount` decimal(10,2) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_method_id` int DEFAULT NULL,
  `payment_method` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `transaction_id` int DEFAULT NULL,
  `reference_number` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `selectedTableRowIndex` int NOT NULL,
  `proof_of_payment` varchar(10000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approval_or_rejected_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `loan_officer_id` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `loan_id`, `payment_amount`, `payment_date`, `payment_status`, `payment_method_id`, `payment_method`, `transaction_id`, `reference_number`, `selectedTableRowIndex`, `proof_of_payment`, `approval_or_rejected_date`, `loan_officer_id`) VALUES
(13, 34, 3933.33, '2025-01-13 05:09:27', 'Approved', NULL, 'Gcash', NULL, '123456789', 1, 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F34%2Fproof_of_payment%2F462642917_948245339974237_6594802735076409897_n.jpg?alt=media&token=81cb7abd-b0d1-4660-bacc-8a927aec2d8d', '2025-01-17 00:25:52', '1'),
(14, 34, 3933.33, '2025-01-13 05:31:21', 'Approved', NULL, 'Gcash', NULL, '56789', 2, 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F34%2Fproof_of_payment%2FInternet%20(2).jpg?alt=media&token=6fe1636a-739a-43bf-9cb2-50e0fc47d6d8', '2025-01-17 00:25:52', '1'),
(15, 34, 3933.33, '2025-01-13 06:16:18', 'Approved', NULL, 'Gcash', NULL, '1234567', 3, 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F34%2Fproof_of_payment%2FPicture1.png?alt=media&token=6cd6cc4f-d760-4f07-af8d-ffa392a3902b', '2025-01-17 00:25:52', '1'),
(16, 34, 3933.33, '2025-01-13 07:32:15', 'Approved', NULL, 'Gcash', NULL, '1245656', 4, 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F34%2Fproof_of_payment%2FBeige%20White%20Modern%20Minimalist%20Simple%20House%20For%20Sale%20Poster.png?alt=media&token=7f2326e7-7d55-499c-8709-a01d8d0c7aff', '2025-01-17 00:25:52', '1'),
(18, 34, 3933.33, '2025-01-15 05:41:30', 'Approved', NULL, 'Gcash', NULL, '12345678', 5, 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F34%2Fproof_of_payment%2Ff0cbac21-5ab3-4b1a-a8b1-8c1a875adfd1.jpg?alt=media&token=fc9918e6-418f-408d-86cd-fe13624d0881', '2025-01-17 00:25:52', '1'),
(19, 38, 3933.33, '2025-01-16 11:51:22', 'Pending', NULL, 'Gcash', NULL, '12345678', 1, 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F38%2Fproof_of_payment%2Fcool_16876150.png?alt=media&token=e16dbdd4-efd1-4a00-9ab4-4c9e0bbecd0b', '2025-01-17 00:25:52', ''),
(20, 34, 3933.33, '2025-01-17 01:13:24', 'Approved', NULL, 'Gcash', NULL, '12345678', 6, 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/lendease%2Floans%2F34%2Fproof_of_payment%2Fcool_16876150.png?alt=media&token=5b447f6e-4099-40ec-86d1-cd9f927a1707', '2025-01-17 01:13:24', '1');

-- --------------------------------------------------------

--
-- Table structure for table `payment_method`
--

CREATE TABLE `payment_method` (
  `method_id` int NOT NULL,
  `method_name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  `qr_code_id` int NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
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
(40, 'e890c2b8-4656-4200-b263-f894a50ed06e', 'Loan Application');

-- --------------------------------------------------------

--
-- Table structure for table `sms`
--

CREATE TABLE `sms` (
  `sms_id` int NOT NULL,
  `sender` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `receiver` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `date_sent` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  `salary_id` int NOT NULL,
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
  `transaction_id` int NOT NULL,
  `payment_id` int DEFAULT NULL,
  `method_id` int DEFAULT NULL,
  `transaction_amount` decimal(10,2) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `transaction_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  `username` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
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
(8, 'collector@gmail.com', 'password', 3, NULL, 1, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_log`
--

CREATE TABLE `user_log` (
  `log_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `details` text COLLATE utf8mb4_general_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  `role_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `disbursement_details`
--
ALTER TABLE `disbursement_details`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `borrower_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `disbursement_details`
--
ALTER TABLE `disbursement_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `item_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan`
--
ALTER TABLE `loan`
  MODIFY `loan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

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
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `qr_code`
--
ALTER TABLE `qr_code`
  MODIFY `qr_code_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

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
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`loan_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_method` (`method_id`);

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
