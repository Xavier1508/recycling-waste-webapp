-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 18, 2025 at 12:07 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `recycle_waste_webapp`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `CalculateDriverFeeAndDistance` (IN `pickup_id_param` INT, IN `driver_id_param` INT)   BEGIN
    -- Variabel untuk menyimpan data
    DECLARE driver_lat, driver_lon, user_lat, user_lon, tpa_lat, tpa_lon DECIMAL(11, 8);
    DECLARE total_weight, distance_to_user, distance_to_tpa, total_distance DECIMAL(10, 2);
    DECLARE base_fee, distance_rate, weight_rate, final_fee DECIMAL(10, 2);

    -- 1. Konfigurasi Tarif (Bisa Anda ubah sesuai model bisnis)
    SET base_fee = 5000.00;      -- Biaya dasar per penjemputan
    SET distance_rate = 2500.00; -- Biaya per kilometer
    SET weight_rate = 500.00;      -- Biaya tambahan per kilogram

    -- 2. Ambil data koordinat dan berat yang diperlukan
    SELECT d.current_latitude, d.current_longitude INTO driver_lat, driver_lon
    FROM drivers d WHERE d.driver_id = driver_id_param;

    SELECT tpr.pickup_latitude, tpr.pickup_longitude, tpr.total_weight_kg, ds.latitude, ds.longitude
    INTO user_lat, user_lon, total_weight, tpa_lat, tpa_lon
    FROM trash_pickup_requests tpr
    JOIN disposal_sites ds ON tpr.assigned_tpa_id = ds.tpa_id
    WHERE tpr.pickup_id = pickup_id_param;

    -- 3. Hitung Jarak menggunakan Formula Haversine (Akurat untuk GPS)
    -- Rumus ini menghitung jarak antar dua titik di permukaan bumi
    IF driver_lat IS NOT NULL AND user_lat IS NOT NULL AND tpa_lat IS NOT NULL THEN
        -- Jarak dari Driver ke User
        SET distance_to_user = 111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(driver_lat))
             * COS(RADIANS(user_lat))
             * COS(RADIANS(driver_lon - user_lon))
             + SIN(RADIANS(driver_lat))
             * SIN(RADIANS(user_lat)))));

        -- Jarak dari User ke TPA
        SET distance_to_tpa = 111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(user_lat))
             * COS(RADIANS(tpa_lat))
             * COS(RADIANS(user_lon - tpa_lon))
             + SIN(RADIANS(user_lat))
             * SIN(RADIANS(tpa_lat)))));

        SET total_distance = distance_to_user + distance_to_tpa;
    ELSE
        SET total_distance = 0;
    END IF;

    -- 4. Hitung Estimasi Bayaran Driver
    SET final_fee = base_fee + (total_distance * distance_rate) + (COALESCE(total_weight, 0) * weight_rate);

    -- 5. Update tabel trash_pickup_requests dengan data baru
    UPDATE trash_pickup_requests
    SET
        distance_km = total_distance,
        estimated_driver_fee = final_fee,
        assigned_driver_id = driver_id_param -- Tetapkan driver yang dihitung
    WHERE pickup_id = pickup_id_param;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `CalculatePickupPoints` (IN `pickup_id_param` INT)   BEGIN
    -- Siapkan variabel untuk menampung hasil perhitungan.
    DECLARE total_points_calculated INT DEFAULT 0;
    DECLARE total_weight_calculated DECIMAL(10, 2) DEFAULT 0.00;

    -- Langkah 1: Hitung total poin dan total berat dari semua item untuk pickup_id ini.
    -- Ini adalah LOGIKA INTI yang benar: (berat item * poin per kg dari kategori)
    SELECT 
        -- Hitung total poin: Penjumlahan dari (berat item * poin per kg dari kategorinya)
        -- COALESCE digunakan untuk memastikan hasilnya 0 jika tidak ada item sama sekali.
        COALESCE(SUM(ti.weight_kg * tc.points_per_kg), 0),
        
        -- Hitung total berat: Penjumlahan dari semua berat item
        COALESCE(SUM(ti.weight_kg), 0)
    INTO 
        -- Simpan hasil perhitungan ke dalam variabel yang sudah kita siapkan.
        total_points_calculated, 
        total_weight_calculated
    FROM 
        trash_items ti
    -- Gabungkan (JOIN) dengan tabel trash_categories untuk mendapatkan nilai points_per_kg
    JOIN 
        trash_categories tc ON ti.category_id = tc.category_id
    WHERE 
        ti.pickup_id = pickup_id_param;

    -- Langkah 2: Update tabel trash_pickup_requests dengan nilai total yang baru dan akurat.
    -- Ini adalah satu-satunya tugas prosedur ini.
    UPDATE trash_pickup_requests
    SET 
        total_points_earned = total_points_calculated,
        total_weight_kg = total_weight_calculated
    WHERE 
        pickup_id = pickup_id_param;

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `address_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `alias_name` varchar(100) DEFAULT NULL,
  `address_text` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) DEFAULT 'Indonesia',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `gmaps_place_id` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`address_id`, `user_id`, `alias_name`, `address_text`, `city`, `province`, `postal_code`, `country`, `latitude`, `longitude`, `gmaps_place_id`, `notes`, `is_active`, `created_at`) VALUES
(4, 1, 'Rumah Boss', 'Jalan Anggrek Cakra', 'Jakarta', 'Java', '11540', 'Indonesia', -6.20079950, 106.78282189, 'liq_320948672831', NULL, 1, '2025-06-16 05:44:56'),
(6, 1, 'Rumah Kupang', 'Lasiana, Kupang, Kelapa Lima, East Nusa Tenggara, 85361, Indonesia', 'Kupang', 'East Nusa Tenggara', '85361', 'Indonesia', -10.13749488, 123.66758513, 'liq_322403933315', NULL, 0, '2025-06-16 05:47:47'),
(7, 1, 'Kos Malang', 'Jalan Sulfat, RW 08, KEL. BUNULREJO, KOTA MALANG, Bumi Meranti Wangi, Malang, Kota Malang, East Java, 65123, Indonesia', 'Malang', 'East Java', '65123', 'Indonesia', -7.95877901, 112.65679527, 'liq_323296721543', NULL, 0, '2025-06-16 06:01:03');

-- --------------------------------------------------------

--
-- Table structure for table `catalog_items`
--

CREATE TABLE `catalog_items` (
  `catalog_id` int(11) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `item_type` enum('cash','voucher','grocery','tree_planting') NOT NULL,
  `points_required` int(11) NOT NULL,
  `item_value` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `stock_quantity` int(11) DEFAULT -1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `catalog_items`
--

INSERT INTO `catalog_items` (`catalog_id`, `item_name`, `item_type`, `points_required`, `item_value`, `description`, `image_url`, `is_active`, `stock_quantity`, `created_at`, `updated_at`) VALUES
(1, 'Cash Reward', 'cash', 500, 25000.00, 'Transfer uang tunai ke rekening Anda', NULL, 1, 8, '2025-06-03 12:31:32', '2025-06-18 05:38:46'),
(2, 'Grocery Package', 'grocery', 750, 50000.00, 'Paket sembako untuk keluarga', NULL, 1, 10, '2025-06-03 12:31:32', '2025-06-16 07:05:49'),
(3, 'Shopping Voucher', 'voucher', 300, 15000.00, 'Voucher belanja untuk toko retail', NULL, 1, 10, '2025-06-03 12:31:32', '2025-06-16 07:05:51'),
(4, 'Plant a Tree', 'tree_planting', 200, 0.00, 'Kontribusi penanaman pohon untuk lingkungan', NULL, 1, 10, '2025-06-03 12:31:32', '2025-06-16 07:05:55');

-- --------------------------------------------------------

--
-- Table structure for table `disposal_sites`
--

CREATE TABLE `disposal_sites` (
  `tpa_id` int(11) NOT NULL,
  `site_name` varchar(150) NOT NULL,
  `operator_user_id` int(11) DEFAULT NULL,
  `address_text` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `operating_hours` varchar(255) DEFAULT NULL,
  `accepted_trash_categories` text DEFAULT NULL,
  `capacity_ton_per_day` decimal(10,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `disposal_sites`
--

INSERT INTO `disposal_sites` (`tpa_id`, `site_name`, `operator_user_id`, `address_text`, `city`, `province`, `postal_code`, `latitude`, `longitude`, `contact_person`, `contact_phone`, `operating_hours`, `accepted_trash_categories`, `capacity_ton_per_day`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'TPST Bantargebang', NULL, 'Jl. Pangkalan 5, Sumur Batu, Bantargebang', 'Bekasi', 'Jawa Barat', '17151', -6.33805600, 106.99250000, NULL, NULL, '24 Jam (Penerimaan Terjadwal)', 'ORG,ANORG,B3', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(2, 'Bank Sampah Induk Gesit Menteng', NULL, 'Jl. Menteng Pulo No.16, RT.3/RW.12, Menteng Atas, Setiabudi', 'Jakarta Selatan', 'DKI Jakarta', '12960', -6.21653000, 106.83879000, NULL, NULL, 'Senin-Jumat 08:00-16:00', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(3, 'Bank Sampah Hijau Selaras', NULL, 'Jl. H. Jian II No.22, RT.1/RW.7, Cipete Utara, Kebayoran Baru', 'Jakarta Selatan', 'DKI Jakarta', '12150', -6.25581000, 106.80057000, NULL, NULL, 'Sabtu 09:00-12:00', 'ANORG,ORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(4, 'TPS 3R Semeru', NULL, 'Jl. Semeru Raya No.1, RT.1/RW.10, Grogol, Grogol Petamburan', 'Jakarta Barat', 'DKI Jakarta', '11450', -6.16899000, 106.79077000, NULL, NULL, 'Senin-Sabtu 07:00-15:00', 'ORG,ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(5, 'Bank Sampah Maju Bersama Rawasari', NULL, 'Jl. Rawasari Sel. No.20, RT.10/RW.2, Rawasari, Cempaka Putih', 'Jakarta Pusat', 'DKI Jakarta', '10570', -6.18404000, 106.86841000, NULL, NULL, 'Sesuai Jadwal Komunitas', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(6, 'Fasilitas Pengolahan Sampah Sunter (ITF Sunter - Proyek)', NULL, 'Jl. Agung Karya VIII Blok D Kav. No. 1, Sunter Agung, Tanjung Priok', 'Jakarta Utara', 'DKI Jakarta', '14350', -6.13379000, 106.87650000, NULL, NULL, 'Dalam Pembangunan/Perencanaan', 'ORG,ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(7, 'Bank Sampah Anyelir Berseri', NULL, 'Jl. Anyelir Gg. III No. 25 RT. 005 RW. 003, Sukapura, Cilincing', 'Jakarta Utara', 'DKI Jakarta', '14140', -6.13000000, 106.92000000, NULL, NULL, 'Sesuai Jadwal Komunitas', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(8, 'Bank Sampah Kenanga', NULL, 'Jl. Tipar Cakung Rt.001 Rw.05 No. 55, Sukapura, Cilincing', 'Jakarta Utara', 'DKI Jakarta', '14140', -6.13150000, 106.92150000, NULL, NULL, 'Sesuai Jadwal Komunitas', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(9, 'TPS 3R Rawajati', NULL, 'Jl. Rawajati Timur II, RT.3/RW.2, Rawajati, Pancoran', 'Jakarta Selatan', 'DKI Jakarta', '12750', -6.24750000, 106.84820000, NULL, NULL, 'Senin-Sabtu Operasional', 'ORG,ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(10, 'Bank Sampah KSM Sejahtera Pondok Bambu', NULL, 'Jl. Pahlawan Revolusi Gg. H. SABA No.68, RT.1/RW.4, Pd. Bambu, Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', '13430', -6.23780000, 106.90510000, NULL, NULL, 'Sesuai Jadwal Komunitas', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(11, 'Bank Sampah Berkah Cipinang Muara', NULL, 'Jl. Cipinang Muara Raya No.20, RT.14/RW.3, Cipinang Muara, Jatinegara', 'Jakarta Timur', 'DKI Jakarta', '13420', -6.22200000, 106.88800000, NULL, NULL, 'Sesuai Jadwal Komunitas', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(12, 'Bank Sampah Kencana Lestari', NULL, 'Jl. Kencana Lestari Blok CE 1 No. 10, Cilandak Barat', 'Jakarta Selatan', 'DKI Jakarta', '12430', -6.28913000, 106.79047000, NULL, NULL, 'Sesuai Jadwal Komunitas', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(13, 'Pusat Daur Ulang (PDU) Pesanggrahan', NULL, 'Jl. Masjid Al-Mubarok Raya No.30, RT.5/RW.1, Pesanggrahan', 'Jakarta Selatan', 'DKI Jakarta', '12320', -6.26680000, 106.75050000, NULL, NULL, 'Senin-Jumat 08:00-16:00', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(14, 'Bank Sampah RW 03 Pegadungan', NULL, 'Jl. Pegadungan Raya No.01, RT.1/RW.3, Pegadungan, Kalideres', 'Jakarta Barat', 'DKI Jakarta', '11830', -6.13950000, 106.70800000, NULL, NULL, 'Sesuai Jadwal Komunitas', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16'),
(15, 'Bank Sampah Melati Bersih Cengkareng', NULL, 'Jl. Utama Raya No.48, RT.1/RW.1, Cengkareng Bar., Kecamatan Cengkareng', 'Jakarta Barat', 'DKI Jakarta', '11730', -6.15000000, 106.73500000, NULL, NULL, 'Sesuai Jadwal Komunitas', 'ANORG', NULL, NULL, 1, '2025-06-03 20:19:16', '2025-06-03 20:19:16');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `wallet_id` int(11) DEFAULT NULL,
  `driver_code` varchar(100) DEFAULT NULL,
  `profile_picture_url` text DEFAULT NULL,
  `license_number` varchar(50) NOT NULL,
  `license_expiry_date` date NOT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `availability_status` enum('available','on_pickup','offline','on_break') DEFAULT 'offline',
  `current_latitude` decimal(10,8) DEFAULT NULL,
  `current_longitude` decimal(11,8) DEFAULT NULL,
  `last_location_update` timestamp NULL DEFAULT NULL,
  `rating_average` decimal(3,2) DEFAULT 0.00,
  `total_ratings` int(11) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0,
  `approved_by_admin_id` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes_admin` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`driver_id`, `user_id`, `wallet_id`, `driver_code`, `profile_picture_url`, `license_number`, `license_expiry_date`, `vehicle_id`, `availability_status`, `current_latitude`, `current_longitude`, `last_location_update`, `rating_average`, `total_ratings`, `is_approved`, `approved_by_admin_id`, `approved_at`, `notes_admin`, `created_at`, `updated_at`) VALUES
(1, 3, NULL, 'XVR80762DH6574COI', '/uploads/avatars/profile_picture-1749642093329-595831604.jpg', '30440508000018', '2025-06-11', 10, 'available', -6.17676800, 106.76142080, '2025-06-18 09:46:23', 4.88, 8, 1, NULL, NULL, NULL, '2025-06-11 11:41:33', '2025-06-18 09:46:23');

-- --------------------------------------------------------

--
-- Table structure for table `driver_routes`
--

CREATE TABLE `driver_routes` (
  `route_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `assigned_tpa_id` int(11) NOT NULL,
  `route_status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `driver_wallets`
--

CREATE TABLE `driver_wallets` (
  `wallet_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('new_pickup_offer','pickup_accepted','driver_en_route','pickup_completed','pickup_cancelled','system_alert','wallet_credit') NOT NULL,
  `related_pickup_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `pickup_details`
-- (See below for the actual view)
--
CREATE TABLE `pickup_details` (
`pickup_id` int(11)
,`user_id` int(11)
,`user_name` varchar(101)
,`email` varchar(100)
,`phone_number` varchar(20)
,`pickup_address` text
,`pickup_date` date
,`pickup_time` timestamp
,`status` enum('requested','pending_assignment','assigned_to_driver','driver_en_route','arrived_at_location','picked_up','processing_at_facility','completed','cancelled_by_user','cancelled_by_system','failed')
,`total_weight_kg` decimal(10,2)
,`total_points_earned` int(11)
,`requested_at` timestamp
,`items_detail` mediumtext
);

-- --------------------------------------------------------

--
-- Table structure for table `pickup_history`
--

CREATE TABLE `pickup_history` (
  `history_id` int(11) NOT NULL,
  `pickup_id` int(11) NOT NULL,
  `status_from` enum('requested','picked_up','cancelled') DEFAULT NULL,
  `status_to` enum('requested','picked_up','cancelled') DEFAULT NULL,
  `changed_by` varchar(50) DEFAULT NULL,
  `change_reason` text DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pickup_offers`
--

CREATE TABLE `pickup_offers` (
  `offer_id` int(11) NOT NULL,
  `pickup_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `offer_status` enum('sent','seen','accepted','rejected','timed_out') NOT NULL DEFAULT 'sent',
  `offered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pickup_offers`
--

INSERT INTO `pickup_offers` (`offer_id`, `pickup_id`, `driver_id`, `offer_status`, `offered_at`, `expires_at`, `responded_at`) VALUES
(3, 4, 1, 'accepted', '2025-06-16 06:09:22', NULL, '2025-06-16 06:09:25'),
(6, 7, 1, 'accepted', '2025-06-16 07:01:29', NULL, '2025-06-16 07:01:39'),
(11, 12, 1, 'accepted', '2025-06-16 07:09:45', NULL, '2025-06-16 07:10:02'),
(17, 19, 1, 'accepted', '2025-06-16 07:23:48', NULL, '2025-06-16 07:23:53'),
(18, 20, 1, 'accepted', '2025-06-16 07:45:30', NULL, '2025-06-16 07:45:36'),
(19, 21, 1, 'accepted', '2025-06-16 13:48:17', NULL, '2025-06-16 13:48:21'),
(20, 22, 1, 'accepted', '2025-06-16 14:19:18', NULL, '2025-06-16 14:19:21'),
(21, 23, 1, 'accepted', '2025-06-16 14:26:20', NULL, '2025-06-16 14:26:24'),
(22, 24, 1, 'accepted', '2025-06-16 14:33:12', NULL, '2025-06-16 14:33:14'),
(23, 25, 1, 'accepted', '2025-06-16 14:36:59', NULL, '2025-06-16 14:37:01'),
(24, 26, 1, 'accepted', '2025-06-16 16:45:22', NULL, '2025-06-16 16:45:26'),
(25, 27, 1, 'rejected', '2025-06-16 16:57:21', NULL, '2025-06-16 16:57:31'),
(26, 28, 1, 'accepted', '2025-06-16 16:57:55', NULL, '2025-06-16 16:57:57'),
(27, 29, 1, 'sent', '2025-06-16 17:11:03', NULL, NULL),
(28, 30, 1, 'sent', '2025-06-16 17:11:53', NULL, NULL),
(29, 31, 1, 'accepted', '2025-06-16 17:16:07', NULL, '2025-06-16 17:16:10'),
(30, 32, 1, 'accepted', '2025-06-16 17:49:06', NULL, '2025-06-16 17:49:09'),
(31, 33, 1, 'accepted', '2025-06-16 18:28:27', NULL, '2025-06-16 18:28:29'),
(32, 34, 1, 'accepted', '2025-06-17 06:39:05', NULL, '2025-06-17 06:39:08'),
(33, 35, 1, 'accepted', '2025-06-17 06:58:27', NULL, '2025-06-17 06:58:30'),
(34, 36, 1, 'accepted', '2025-06-17 07:24:41', NULL, '2025-06-17 07:24:43'),
(35, 37, 1, 'accepted', '2025-06-17 07:48:06', NULL, '2025-06-17 07:48:08'),
(36, 38, 1, 'sent', '2025-06-18 05:31:30', NULL, NULL),
(37, 39, 1, 'sent', '2025-06-18 05:32:57', NULL, NULL),
(38, 40, 1, 'sent', '2025-06-18 05:34:00', NULL, NULL),
(39, 41, 1, 'accepted', '2025-06-18 05:34:43', NULL, '2025-06-18 05:34:55');

-- --------------------------------------------------------

--
-- Table structure for table `pickup_ratings`
--

CREATE TABLE `pickup_ratings` (
  `rating_id` int(11) NOT NULL,
  `pickup_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Pengguna yang memberikan rating',
  `driver_id` int(11) NOT NULL COMMENT 'Driver yang menerima rating',
  `overall_rating` tinyint(1) NOT NULL COMMENT 'Rating bintang (1-5)',
  `punctuality_rating` tinyint(1) DEFAULT NULL COMMENT 'Rating ketepatan waktu (opsional)',
  `service_rating` tinyint(1) DEFAULT NULL COMMENT 'Rating pelayanan (opsional)',
  `comment` text DEFAULT NULL COMMENT 'Komentar atau kritik & saran dari user',
  `tip_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Jumlah tip yang diberikan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pickup_ratings`
--

INSERT INTO `pickup_ratings` (`rating_id`, `pickup_id`, `user_id`, `driver_id`, `overall_rating`, `punctuality_rating`, `service_rating`, `comment`, `tip_amount`, `created_at`) VALUES
(4, 34, 1, 1, 5, NULL, NULL, 'Mantap jos', 0.00, '2025-06-17 06:40:11'),
(7, 37, 1, 1, 5, NULL, NULL, 'Mantap Josjis', 0.00, '2025-06-17 07:48:44');

-- --------------------------------------------------------

--
-- Table structure for table `points`
--

CREATE TABLE `points` (
  `point_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `points_earned` int(11) NOT NULL,
  `points_type` enum('pickup','bonus','referral','manual') DEFAULT 'pickup',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `points`
--

INSERT INTO `points` (`point_id`, `user_id`, `request_id`, `points_earned`, `points_type`, `description`, `created_at`) VALUES
(1, 1, 37, 6500, 'pickup', 'Poin dari penjemputan sampah #37', '2025-06-17 07:48:31');

-- --------------------------------------------------------

--
-- Table structure for table `point_redemptions`
--

CREATE TABLE `point_redemptions` (
  `redeem_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `points_redeemed` int(11) NOT NULL,
  `reward_type` enum('cash','voucher','grocery','tree_planting') NOT NULL,
  `reward_value` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','approved','completed','cancelled') DEFAULT 'pending',
  `redeemed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL,
  `catalog_id` int(11) DEFAULT NULL COMMENT 'ID item dari tabel katalog'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `point_redemptions`
--

INSERT INTO `point_redemptions` (`redeem_id`, `user_id`, `points_redeemed`, `reward_type`, `reward_value`, `description`, `status`, `redeemed_at`, `processed_at`, `catalog_id`) VALUES
(1, 1, 500, 'cash', 25000.00, 'Redeemed: Cash Reward', 'completed', '2025-06-17 09:12:10', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `route_pickups`
--

CREATE TABLE `route_pickups` (
  `route_pickup_id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `pickup_id` int(11) NOT NULL,
  `pickup_order` int(11) NOT NULL,
  `status` enum('pending','completed','skipped') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trash_categories`
--

CREATE TABLE `trash_categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(50) NOT NULL,
  `category_code` varchar(10) NOT NULL,
  `points_per_kg` int(11) NOT NULL DEFAULT 10,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trash_categories`
--

INSERT INTO `trash_categories` (`category_id`, `category_name`, `category_code`, `points_per_kg`, `description`, `created_at`) VALUES
(1, 'Organic', 'ORG', 5, 'Sampah organik seperti sisa makanan, daun, dll', '2025-06-03 12:31:32'),
(2, 'Anorganic', 'ANORG', 10, 'Sampah anorganik seperti plastik, kertas, logam', '2025-06-03 12:31:32'),
(3, 'B3 (Bahan Berbahaya Beracun)', 'B3', 20, 'Sampah berbahaya seperti baterai, lampu, elektronik', '2025-06-03 12:31:32'),
(4, 'Sampah Kertas', 'PAPER', 8, 'Sampah yang berbahan kertas, seperti koran, majalah, kemasan kertas, dan karton.', '2025-06-15 10:17:54'),
(5, 'Sampah Elektronik', 'EWASTE', 25, 'Sampah dari perangkat elektronik, seperti handphone, komputer, dan lainnya.', '2025-06-15 10:17:54'),
(6, 'Sampah Medis', 'MEDICAL', 50, 'Sampah dari fasilitas kesehatan (memerlukan penanganan khusus).', '2025-06-15 10:17:54'),
(7, 'Sampah Sisa Bangunan', 'CONSTRUCTI', 2, 'Sampah dari pekerjaan konstruksi atau renovasi bangunan.', '2025-06-15 10:17:54');

-- --------------------------------------------------------

--
-- Table structure for table `trash_items`
--

CREATE TABLE `trash_items` (
  `item_id` int(11) NOT NULL,
  `pickup_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `weight_kg` decimal(10,2) NOT NULL,
  `points_earned` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trash_items`
--

INSERT INTO `trash_items` (`item_id`, `pickup_id`, `category_id`, `weight_kg`, `points_earned`, `notes`, `created_at`) VALUES
(1, 2, 2, 0.00, 0, NULL, '2025-06-16 06:01:47'),
(2, 2, 3, 0.00, 0, NULL, '2025-06-16 06:01:47'),
(3, 2, 7, 0.00, 0, NULL, '2025-06-16 06:01:47'),
(4, 2, 4, 0.00, 0, NULL, '2025-06-16 06:01:47'),
(8, 3, 2, 0.00, 0, NULL, '2025-06-16 06:03:17'),
(9, 3, 3, 0.00, 0, NULL, '2025-06-16 06:03:17'),
(10, 3, 6, 0.00, 0, NULL, '2025-06-16 06:03:17'),
(11, 4, 2, 0.00, 0, NULL, '2025-06-16 06:09:22'),
(12, 4, 6, 0.00, 0, NULL, '2025-06-16 06:09:22'),
(13, 4, 1, 0.00, 0, NULL, '2025-06-16 06:09:22'),
(14, 5, 2, 0.00, 0, NULL, '2025-06-16 06:48:29'),
(15, 5, 3, 0.00, 0, NULL, '2025-06-16 06:48:29'),
(16, 5, 4, 0.00, 0, NULL, '2025-06-16 06:48:29'),
(17, 6, 2, 0.00, 0, NULL, '2025-06-16 07:01:04'),
(18, 6, 7, 0.00, 0, NULL, '2025-06-16 07:01:04'),
(19, 6, 6, 0.00, 0, NULL, '2025-06-16 07:01:04'),
(20, 7, 2, 0.00, 0, NULL, '2025-06-16 07:01:29'),
(21, 7, 7, 0.00, 0, NULL, '2025-06-16 07:01:29'),
(22, 7, 6, 0.00, 0, NULL, '2025-06-16 07:01:29'),
(23, 8, 2, 0.00, 0, NULL, '2025-06-16 07:03:31'),
(24, 8, 3, 0.00, 0, NULL, '2025-06-16 07:03:31'),
(25, 8, 6, 0.00, 0, NULL, '2025-06-16 07:03:31'),
(26, 9, 5, 0.00, 0, NULL, '2025-06-16 07:03:58'),
(27, 9, 6, 0.00, 0, NULL, '2025-06-16 07:03:58'),
(29, 10, 2, 0.00, 0, NULL, '2025-06-16 07:04:14'),
(30, 10, 3, 0.00, 0, NULL, '2025-06-16 07:04:14'),
(31, 10, 6, 0.00, 0, NULL, '2025-06-16 07:04:14'),
(32, 11, 2, 0.00, 0, NULL, '2025-06-16 07:04:51'),
(33, 11, 3, 0.00, 0, NULL, '2025-06-16 07:04:51'),
(34, 11, 4, 0.00, 0, NULL, '2025-06-16 07:04:51'),
(35, 12, 2, 0.00, 0, NULL, '2025-06-16 07:09:45'),
(36, 12, 3, 0.00, 0, NULL, '2025-06-16 07:09:45'),
(38, 13, 2, 0.00, 0, NULL, '2025-06-16 07:22:59'),
(39, 13, 6, 0.00, 0, NULL, '2025-06-16 07:22:59'),
(40, 13, 1, 0.00, 0, NULL, '2025-06-16 07:22:59'),
(41, 14, 2, 0.00, 0, NULL, '2025-06-16 07:23:11'),
(42, 14, 6, 0.00, 0, NULL, '2025-06-16 07:23:11'),
(43, 14, 1, 0.00, 0, NULL, '2025-06-16 07:23:11'),
(44, 15, 2, 0.00, 0, NULL, '2025-06-16 07:23:13'),
(45, 15, 6, 0.00, 0, NULL, '2025-06-16 07:23:13'),
(46, 15, 1, 0.00, 0, NULL, '2025-06-16 07:23:13'),
(47, 16, 2, 0.00, 0, NULL, '2025-06-16 07:23:13'),
(48, 16, 6, 0.00, 0, NULL, '2025-06-16 07:23:13'),
(49, 16, 1, 0.00, 0, NULL, '2025-06-16 07:23:13'),
(50, 17, 2, 0.00, 0, NULL, '2025-06-16 07:23:14'),
(51, 17, 6, 0.00, 0, NULL, '2025-06-16 07:23:14'),
(52, 17, 1, 0.00, 0, NULL, '2025-06-16 07:23:14'),
(53, 18, 2, 0.00, 0, NULL, '2025-06-16 07:23:26'),
(54, 18, 3, 0.00, 0, NULL, '2025-06-16 07:23:26'),
(55, 18, 7, 0.00, 0, NULL, '2025-06-16 07:23:26'),
(56, 19, 2, 0.00, 0, NULL, '2025-06-16 07:23:48'),
(57, 19, 3, 0.00, 0, NULL, '2025-06-16 07:23:48'),
(58, 19, 7, 0.00, 0, NULL, '2025-06-16 07:23:48'),
(59, 20, 2, 0.00, 0, NULL, '2025-06-16 07:45:30'),
(60, 20, 3, 0.00, 0, NULL, '2025-06-16 07:45:30'),
(61, 20, 7, 0.00, 0, NULL, '2025-06-16 07:45:30'),
(62, 21, 2, 0.00, 0, NULL, '2025-06-16 13:48:17'),
(63, 21, 3, 0.00, 0, NULL, '2025-06-16 13:48:17'),
(64, 21, 7, 0.00, 0, NULL, '2025-06-16 13:48:17'),
(65, 22, 2, 0.00, 0, NULL, '2025-06-16 14:19:18'),
(66, 22, 3, 0.00, 0, NULL, '2025-06-16 14:19:18'),
(67, 22, 7, 0.00, 0, NULL, '2025-06-16 14:19:18'),
(68, 23, 2, 0.00, 0, NULL, '2025-06-16 14:26:20'),
(69, 23, 3, 0.00, 0, NULL, '2025-06-16 14:26:20'),
(70, 23, 7, 0.00, 0, NULL, '2025-06-16 14:26:20'),
(71, 24, 3, 0.00, 0, NULL, '2025-06-16 14:33:12'),
(72, 24, 7, 0.00, 0, NULL, '2025-06-16 14:33:12'),
(74, 25, 2, 0.00, 0, NULL, '2025-06-16 14:36:59'),
(75, 25, 3, 0.00, 0, NULL, '2025-06-16 14:36:59'),
(76, 25, 7, 0.00, 0, NULL, '2025-06-16 14:36:59'),
(77, 26, 2, 0.00, 0, NULL, '2025-06-16 16:45:22'),
(78, 26, 3, 0.00, 0, NULL, '2025-06-16 16:45:22'),
(79, 26, 7, 0.00, 0, NULL, '2025-06-16 16:45:22'),
(80, 27, 2, 0.00, 0, NULL, '2025-06-16 16:57:21'),
(81, 27, 3, 0.00, 0, NULL, '2025-06-16 16:57:21'),
(82, 27, 7, 0.00, 0, NULL, '2025-06-16 16:57:21'),
(83, 28, 2, 0.00, 0, NULL, '2025-06-16 16:57:55'),
(84, 28, 3, 0.00, 0, NULL, '2025-06-16 16:57:55'),
(86, 29, 2, 0.00, 0, NULL, '2025-06-16 17:11:03'),
(87, 29, 3, 0.00, 0, NULL, '2025-06-16 17:11:03'),
(88, 29, 7, 0.00, 0, NULL, '2025-06-16 17:11:03'),
(89, 30, 7, 0.00, 0, NULL, '2025-06-16 17:11:53'),
(90, 30, 6, 0.00, 0, NULL, '2025-06-16 17:11:53'),
(92, 31, 2, 0.00, 0, NULL, '2025-06-16 17:16:07'),
(93, 31, 3, 0.00, 0, NULL, '2025-06-16 17:16:07'),
(94, 31, 6, 0.00, 0, NULL, '2025-06-16 17:16:07'),
(95, 32, 2, 0.00, 0, NULL, '2025-06-16 17:49:06'),
(96, 32, 3, 0.00, 0, NULL, '2025-06-16 17:49:06'),
(97, 32, 7, 0.00, 0, NULL, '2025-06-16 17:49:06'),
(98, 32, 6, 0.00, 0, NULL, '2025-06-16 17:49:06'),
(102, 33, 2, 0.00, 0, NULL, '2025-06-16 18:28:27'),
(103, 33, 3, 0.00, 0, NULL, '2025-06-16 18:28:27'),
(104, 34, 2, 0.00, 0, NULL, '2025-06-17 06:39:05'),
(105, 34, 3, 0.00, 0, NULL, '2025-06-17 06:39:05'),
(106, 34, 7, 0.00, 0, NULL, '2025-06-17 06:39:05'),
(107, 35, 2, 0.00, 0, NULL, '2025-06-17 06:58:27'),
(108, 35, 3, 0.00, 0, NULL, '2025-06-17 06:58:27'),
(109, 35, 6, 0.00, 0, NULL, '2025-06-17 06:58:27'),
(110, 36, 2, 9.00, 0, NULL, '2025-06-17 07:24:41'),
(111, 36, 3, 10.00, 0, NULL, '2025-06-17 07:24:41'),
(112, 36, 7, 20.00, 0, NULL, '2025-06-17 07:24:41'),
(113, 37, 2, 20.00, 0, NULL, '2025-06-17 07:48:06'),
(114, 37, 3, 20.00, 0, NULL, '2025-06-17 07:48:06'),
(115, 37, 1, 10.00, 0, NULL, '2025-06-17 07:48:06');

--
-- Triggers `trash_items`
--
DELIMITER $$
CREATE TRIGGER `after_trash_items_delete` AFTER DELETE ON `trash_items` FOR EACH ROW BEGIN
    CALL CalculatePickupPoints(OLD.pickup_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_trash_items_insert` AFTER INSERT ON `trash_items` FOR EACH ROW BEGIN
    CALL CalculatePickupPoints(NEW.pickup_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_trash_items_update` AFTER UPDATE ON `trash_items` FOR EACH ROW BEGIN
    CALL CalculatePickupPoints(NEW.pickup_id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `trash_photos`
--

CREATE TABLE `trash_photos` (
  `photo_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `photo_url` text NOT NULL,
  `taken_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `photo_type` enum('before_pickup','after_pickup','sorted') DEFAULT 'before_pickup'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trash_photos`
--

INSERT INTO `trash_photos` (`photo_id`, `request_id`, `photo_url`, `taken_at`, `photo_type`) VALUES
(1, 2, '/uploads/pickups/trash_photo-1750053707302-652469625.jpg', '2025-06-16 06:01:47', 'before_pickup'),
(2, 3, '/uploads/pickups/trash_photo-1750053797170-546822491.JPEG', '2025-06-16 06:03:17', 'before_pickup'),
(3, 4, '/uploads/pickups/trash_photo-1750054162195-993576863.jpg', '2025-06-16 06:09:22', 'before_pickup'),
(4, 5, '/uploads/pickups/trash_photo-1750056509443-794674315.jpg', '2025-06-16 06:48:29', 'before_pickup'),
(5, 6, '/uploads/pickups/trash_photo-1750057264231-790042044.jpg', '2025-06-16 07:01:04', 'before_pickup'),
(6, 7, '/uploads/pickups/trash_photo-1750057289056-221329545.jpg', '2025-06-16 07:01:29', 'before_pickup'),
(7, 8, '/uploads/pickups/trash_photo-1750057410986-310968726.JPEG', '2025-06-16 07:03:31', 'before_pickup'),
(8, 9, '/uploads/pickups/trash_photo-1750057438018-489905720.jpg', '2025-06-16 07:03:58', 'before_pickup'),
(9, 10, '/uploads/pickups/trash_photo-1750057454750-109306355.JPEG', '2025-06-16 07:04:14', 'before_pickup'),
(10, 11, '/uploads/pickups/trash_photo-1750057491727-396260740.JPEG', '2025-06-16 07:04:51', 'before_pickup'),
(11, 13, '/uploads/pickups/trash_photo-1750058579479-92336013.jpg', '2025-06-16 07:22:59', 'before_pickup'),
(12, 14, '/uploads/pickups/trash_photo-1750058590990-945845013.jpg', '2025-06-16 07:23:11', 'before_pickup'),
(13, 15, '/uploads/pickups/trash_photo-1750058593330-588416034.jpg', '2025-06-16 07:23:13', 'before_pickup'),
(14, 16, '/uploads/pickups/trash_photo-1750058593863-629839632.jpg', '2025-06-16 07:23:13', 'before_pickup'),
(15, 17, '/uploads/pickups/trash_photo-1750058594194-521215880.jpg', '2025-06-16 07:23:14', 'before_pickup'),
(16, 26, '/uploads/pickups/trash_photo-1750092322287-489512893.JPEG', '2025-06-16 16:45:22', 'before_pickup');

-- --------------------------------------------------------

--
-- Table structure for table `trash_pickup_requests`
--

CREATE TABLE `trash_pickup_requests` (
  `pickup_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_id` int(11) NOT NULL,
  `pickup_address_text` text NOT NULL,
  `pickup_city` varchar(100) NOT NULL,
  `pickup_postal_code` varchar(20) NOT NULL,
  `pickup_latitude` decimal(10,8) DEFAULT NULL,
  `pickup_longitude` decimal(11,8) DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `preferred_pickup_date` date DEFAULT NULL,
  `preferred_pickup_time_slot` varchar(50) DEFAULT NULL,
  `actual_pickup_time` timestamp NULL DEFAULT NULL,
  `status` enum('requested','pending_assignment','assigned_to_driver','driver_en_route','arrived_at_location','picked_up','processing_at_facility','completed','cancelled_by_user','cancelled_by_system','failed') DEFAULT 'requested',
  `cancellation_reason` text DEFAULT NULL,
  `pickup_time` timestamp NULL DEFAULT NULL,
  `pickup_date` date DEFAULT NULL,
  `pickup_address` text NOT NULL,
  `total_weight_kg` decimal(10,2) DEFAULT 0.00,
  `estimated_volume_liters` decimal(10,2) DEFAULT NULL,
  `total_points_earned` int(11) DEFAULT 0,
  `driver_notes` text DEFAULT NULL,
  `assigned_driver_id` int(11) DEFAULT NULL,
  `assigned_vehicle_id` int(11) DEFAULT NULL,
  `assigned_tpa_id` int(11) DEFAULT NULL,
  `distance_km` decimal(10,2) DEFAULT NULL COMMENT 'Jarak total perjalanan driver untuk pickup ini',
  `estimated_driver_fee` decimal(10,2) DEFAULT NULL COMMENT 'Estimasi bayaran untuk driver saat tugas ditawarkan',
  `actual_driver_fee` decimal(10,2) DEFAULT NULL COMMENT 'Bayaran final untuk driver setelah tugas selesai',
  `notes_for_driver` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trash_pickup_requests`
--

INSERT INTO `trash_pickup_requests` (`pickup_id`, `user_id`, `address_id`, `pickup_address_text`, `pickup_city`, `pickup_postal_code`, `pickup_latitude`, `pickup_longitude`, `requested_at`, `preferred_pickup_date`, `preferred_pickup_time_slot`, `actual_pickup_time`, `status`, `cancellation_reason`, `pickup_time`, `pickup_date`, `pickup_address`, `total_weight_kg`, `estimated_volume_liters`, `total_points_earned`, `driver_notes`, `assigned_driver_id`, `assigned_vehicle_id`, `assigned_tpa_id`, `distance_km`, `estimated_driver_fee`, `actual_driver_fee`, `notes_for_driver`, `updated_at`) VALUES
(2, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 06:01:47', '2025-06-16', '15:04', NULL, 'pending_assignment', NULL, NULL, NULL, '', 89.80, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, 'ggggg', '2025-06-16 06:01:47'),
(3, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 06:03:17', '2025-06-16', '19:09', NULL, 'pending_assignment', NULL, NULL, NULL, '', 90.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, 'tttt', '2025-06-16 06:03:17'),
(4, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 06:09:22', '2025-06-16', '18:14', NULL, 'completed', NULL, NULL, NULL, '', 90.00, NULL, 0, NULL, 1, NULL, 4, 11.92, 79800.00, NULL, 'oke', '2025-06-16 06:47:53'),
(5, 1, 7, 'Jalan Sulfat, RW 08, KEL. BUNULREJO, KOTA MALANG, Bumi Meranti Wangi, Malang, Kota Malang, East Java, 65123, Indonesia', 'Malang', '65123', -7.95877901, 112.65679527, '2025-06-16 06:48:29', '2025-06-16', '18:53', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 1, NULL, NULL, NULL, '124134135', '2025-06-16 06:48:29'),
(6, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:01:04', '2025-06-16', '20:07', NULL, 'pending_assignment', NULL, NULL, NULL, '', 79.60, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, 'etete', '2025-06-16 07:01:04'),
(7, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:01:29', '2025-06-16', '20:07', NULL, 'completed', NULL, NULL, NULL, '', 79.60, NULL, 0, NULL, 1, NULL, 4, 11.92, 74600.00, NULL, 'etete', '2025-06-16 07:03:06'),
(8, 1, 7, 'Jalan Sulfat, RW 08, KEL. BUNULREJO, KOTA MALANG, Bumi Meranti Wangi, Malang, Kota Malang, East Java, 65123, Indonesia', 'Malang', '65123', -7.95877901, 112.65679527, '2025-06-16 07:03:30', '2025-06-16', '16:05', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 1, NULL, NULL, NULL, 'ttttt', '2025-06-16 07:03:30'),
(9, 1, 6, 'Lasiana, Kupang, Kelapa Lima, East Nusa Tenggara, 85361, Indonesia', 'Kupang', '85361', -10.13749488, 123.66758513, '2025-06-16 07:03:58', '2025-06-16', '16:06', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 1, NULL, NULL, NULL, 'tttttt', '2025-06-16 07:03:58'),
(10, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:04:14', '2025-06-16', '20:10', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, 'ggttg', '2025-06-16 07:04:14'),
(11, 1, 7, 'Jalan Sulfat, RW 08, KEL. BUNULREJO, KOTA MALANG, Bumi Meranti Wangi, Malang, Kota Malang, East Java, 65123, Indonesia', 'Malang', '65123', -7.95877901, 112.65679527, '2025-06-16 07:04:51', '2025-06-16', '19:10', NULL, 'pending_assignment', NULL, NULL, NULL, '', 50.00, NULL, 0, NULL, NULL, NULL, 1, NULL, NULL, NULL, 'gggggg', '2025-06-16 07:04:51'),
(12, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:09:45', '2025-06-16', '16:11', NULL, 'completed', NULL, NULL, NULL, '', 7.80, NULL, 0, NULL, 1, NULL, 4, 11.92, 38700.00, NULL, NULL, '2025-06-16 07:23:07'),
(13, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:22:59', '2025-06-16', '16:24', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, 'ggrhwewhh', '2025-06-16 07:22:59'),
(14, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:23:11', '2025-06-16', '16:24', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, 'ggrhwewhh', '2025-06-16 07:23:11'),
(15, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:23:13', '2025-06-16', '16:24', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, 'ggrhwewhh', '2025-06-16 07:23:13'),
(16, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:23:13', '2025-06-16', '16:24', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, 'ggrhwewhh', '2025-06-16 07:23:13'),
(17, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:23:14', '2025-06-16', '16:24', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, 'ggrhwewhh', '2025-06-16 07:23:14'),
(18, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:23:26', '2025-06-16', '15:24', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, NULL, '2025-06-16 07:23:26'),
(19, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:23:48', '2025-06-16', '15:24', NULL, 'completed', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, 1, NULL, 4, 11.92, 74800.00, NULL, NULL, '2025-06-16 07:44:56'),
(20, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 07:45:30', '2025-06-16', '16:47', NULL, 'completed', NULL, NULL, NULL, '', 90.00, NULL, 0, NULL, 1, NULL, 4, 3.64, 59100.00, NULL, NULL, '2025-06-16 08:08:36'),
(21, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 13:48:17', '2025-07-09', '22:50', NULL, 'completed', NULL, NULL, NULL, '', 60.00, NULL, 0, NULL, 1, NULL, 4, 7.21, 53025.00, NULL, '121gg', '2025-06-16 13:53:22'),
(22, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 14:19:18', '2025-06-16', '23:21', NULL, 'completed', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, 1, NULL, 4, 7.21, 63025.00, NULL, NULL, '2025-06-16 14:25:59'),
(23, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 14:26:20', '2025-06-16', '22:27', NULL, 'completed', NULL, NULL, NULL, '', 56.00, NULL, 0, NULL, 1, NULL, 4, 7.21, 51025.00, NULL, NULL, '2025-06-16 14:32:52'),
(24, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 14:33:12', '2025-06-16', '22:34', NULL, 'completed', NULL, NULL, NULL, '', 60.00, NULL, 0, NULL, 1, NULL, 4, 7.21, 53025.00, NULL, NULL, '2025-06-16 14:36:43'),
(25, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 14:36:59', '2025-06-16', '22:37', NULL, 'completed', NULL, NULL, NULL, '', 56.00, NULL, 0, NULL, 1, NULL, 4, 7.21, 51025.00, NULL, NULL, '2025-06-16 15:14:36'),
(26, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 16:45:22', '2025-06-16', '04:51', NULL, 'completed', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, 1, NULL, 4, 3.64, 54100.00, NULL, 'asikk', '2025-06-16 16:48:13'),
(27, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 16:57:21', '2025-06-16', '00:58', NULL, 'pending_assignment', NULL, NULL, NULL, '', 70.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, NULL, '2025-06-16 16:57:21'),
(28, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 16:57:55', '2025-06-16', '00:59', NULL, 'completed', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, 1, NULL, 4, 7.21, 63025.00, NULL, NULL, '2025-06-16 17:10:40'),
(29, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 17:11:03', '2025-06-17', '01:13', NULL, 'pending_assignment', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, NULL, '2025-06-16 17:11:03'),
(30, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 17:11:53', '2025-06-17', '02:14', NULL, 'pending_assignment', NULL, NULL, NULL, '', 90.00, NULL, 0, NULL, NULL, NULL, 4, NULL, NULL, NULL, NULL, '2025-06-16 17:11:53'),
(31, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 17:16:07', '2025-06-17', '01:18', NULL, 'completed', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, 1, NULL, 4, 7.21, 63025.00, NULL, NULL, '2025-06-16 17:20:48'),
(32, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 17:49:06', '2025-06-17', '01:51', NULL, 'completed', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, 1, NULL, 4, 7.21, 63025.00, NULL, NULL, '2025-06-16 18:28:00'),
(33, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-16 18:28:27', '2025-06-17', '03:30', NULL, 'completed', NULL, NULL, NULL, '', 70.00, NULL, 0, NULL, 1, NULL, 4, 7.21, 58025.00, NULL, NULL, '2025-06-16 18:29:42'),
(34, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-17 06:39:05', '2025-06-17', '14:40', '2025-06-17 06:39:46', 'completed', NULL, NULL, NULL, '', 90.00, NULL, 0, NULL, 1, NULL, 4, NULL, NULL, NULL, NULL, '2025-06-17 06:39:46'),
(35, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-17 06:58:27', '2025-06-17', '14:59', '2025-06-17 07:24:20', 'completed', NULL, NULL, NULL, '', 80.00, NULL, 0, NULL, 1, NULL, 4, NULL, NULL, NULL, NULL, '2025-06-17 07:24:20'),
(36, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-17 07:24:41', '2025-06-17', '15:25', '2025-06-17 07:37:00', 'completed', NULL, NULL, NULL, '', 76.00, NULL, 0, NULL, 1, NULL, 4, NULL, NULL, NULL, NULL, '2025-06-17 07:37:00'),
(37, 1, 4, 'Jalan Anggrek Cakra', 'Jakarta', '11540', -6.20079950, 106.78282189, '2025-06-17 07:48:06', '2025-06-17', '15:49', '2025-06-17 07:48:31', 'completed', NULL, NULL, NULL, '', 50.00, NULL, 650, NULL, 1, NULL, 4, NULL, NULL, NULL, NULL, '2025-06-17 07:48:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_picture_url` text DEFAULT NULL,
  `role` enum('customer','driver','admin','tpa_operator') NOT NULL DEFAULT 'customer',
  `account_status` enum('active','inactive','suspended','pending_verification') NOT NULL DEFAULT 'pending_verification',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `phone_number`, `first_name`, `last_name`, `password_hash`, `profile_picture_url`, `role`, `account_status`, `email_verified_at`, `phone_verified_at`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'xaviertalie1508@gmail.com', '08113926360', 'Xavier', 'Renjiro', '$2b$10$y8PQ79BttmRDKravvRqRf.j/ab3sL09UVLIvlwEGQvmNnR/ygI4sO', '/uploads/avatars/avatar-1-1749042757176.jpg', 'customer', 'active', NULL, NULL, NULL, '2025-06-03 14:31:46', '2025-06-04 13:13:04'),
(3, 'xavier.talie@binus.ac.id', '08113926366', 'Xavier', 'Mulyono', '$2b$10$adZKqMuV3157ZIlMRGodDeuvzw1Q6wUi/qkKEedxBBDm3n5v24YtS', '/uploads/avatars/profile_picture-1749642093329-595831604.jpg', 'driver', 'pending_verification', NULL, NULL, NULL, '2025-06-10 17:14:55', '2025-06-11 11:41:33');

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_points_summary`
-- (See below for the actual view)
--
CREATE TABLE `user_points_summary` (
`user_id` int(11)
,`first_name` varchar(50)
,`last_name` varchar(50)
,`email` varchar(100)
,`total_points_earned` decimal(32,0)
,`total_points_redeemed` decimal(32,0)
,`current_points` decimal(33,0)
);

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `vehicle_type` enum('motorcycle_box','small_truck','medium_truck','bicycle_cart') NOT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `year_manufactured` year(4) DEFAULT NULL,
  `capacity_kg` decimal(10,2) DEFAULT NULL,
  `capacity_volume_liters` decimal(10,2) DEFAULT NULL,
  `status` enum('operational','maintenance','out_of_service') DEFAULT 'operational',
  `current_driver_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `license_plate`, `vehicle_type`, `brand`, `model`, `year_manufactured`, `capacity_kg`, `capacity_volume_liters`, `status`, `current_driver_id`, `notes`, `created_at`, `updated_at`) VALUES
(10, 'DH 6574 COI', 'small_truck', NULL, NULL, NULL, NULL, NULL, 'operational', NULL, NULL, '2025-06-11 11:41:33', '2025-06-11 11:41:33'),
(11, 'B 9847 ZZT', 'motorcycle_box', NULL, NULL, NULL, NULL, NULL, 'operational', NULL, NULL, '2025-06-18 05:26:45', '2025-06-18 05:26:45');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `transaction_id` int(11) NOT NULL,
  `wallet_id` int(11) NOT NULL,
  `pickup_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transaction_type` enum('credit_pickup','credit_tip','debit_withdrawal','correction_add','correction_subtract','bonus') NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure for view `pickup_details`
--
DROP TABLE IF EXISTS `pickup_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `pickup_details`  AS SELECT `tpr`.`pickup_id` AS `pickup_id`, `tpr`.`user_id` AS `user_id`, concat(`u`.`first_name`,' ',`u`.`last_name`) AS `user_name`, `u`.`email` AS `email`, `u`.`phone_number` AS `phone_number`, `tpr`.`pickup_address` AS `pickup_address`, `tpr`.`pickup_date` AS `pickup_date`, `tpr`.`pickup_time` AS `pickup_time`, `tpr`.`status` AS `status`, `tpr`.`total_weight_kg` AS `total_weight_kg`, `tpr`.`total_points_earned` AS `total_points_earned`, `tpr`.`requested_at` AS `requested_at`, group_concat(concat(`tc`.`category_name`,': ',`ti`.`weight_kg`,'kg (',`ti`.`points_earned`,' pts)') separator ', ') AS `items_detail` FROM (((`trash_pickup_requests` `tpr` join `users` `u` on(`tpr`.`user_id` = `u`.`id`)) left join `trash_items` `ti` on(`tpr`.`pickup_id` = `ti`.`pickup_id`)) left join `trash_categories` `tc` on(`ti`.`category_id` = `tc`.`category_id`)) GROUP BY `tpr`.`pickup_id`, `tpr`.`user_id`, `u`.`first_name`, `u`.`last_name`, `u`.`email`, `u`.`phone_number`, `tpr`.`pickup_address`, `tpr`.`pickup_date`, `tpr`.`pickup_time`, `tpr`.`status`, `tpr`.`total_weight_kg`, `tpr`.`total_points_earned`, `tpr`.`requested_at` ;

-- --------------------------------------------------------

--
-- Structure for view `user_points_summary`
--
DROP TABLE IF EXISTS `user_points_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_points_summary`  AS SELECT `u`.`id` AS `user_id`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `u`.`email` AS `email`, coalesce(sum(`p`.`points_earned`),0) AS `total_points_earned`, coalesce(sum(`pr`.`points_redeemed`),0) AS `total_points_redeemed`, coalesce(sum(`p`.`points_earned`),0) - coalesce(sum(`pr`.`points_redeemed`),0) AS `current_points` FROM ((`users` `u` left join `points` `p` on(`u`.`id` = `p`.`user_id`)) left join `point_redemptions` `pr` on(`u`.`id` = `pr`.`user_id` and `pr`.`status` = 'completed')) GROUP BY `u`.`id`, `u`.`first_name`, `u`.`last_name`, `u`.`email` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `catalog_items`
--
ALTER TABLE `catalog_items`
  ADD PRIMARY KEY (`catalog_id`);

--
-- Indexes for table `disposal_sites`
--
ALTER TABLE `disposal_sites`
  ADD PRIMARY KEY (`tpa_id`),
  ADD KEY `operator_user_id` (`operator_user_id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD UNIQUE KEY `driver_code` (`driver_code`),
  ADD UNIQUE KEY `wallet_id` (`wallet_id`),
  ADD KEY `approved_by_admin_id` (`approved_by_admin_id`),
  ADD KEY `fk_driver_vehicle` (`vehicle_id`);

--
-- Indexes for table `driver_routes`
--
ALTER TABLE `driver_routes`
  ADD PRIMARY KEY (`route_id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `assigned_tpa_id` (`assigned_tpa_id`);

--
-- Indexes for table `driver_wallets`
--
ALTER TABLE `driver_wallets`
  ADD PRIMARY KEY (`wallet_id`),
  ADD UNIQUE KEY `driver_id` (`driver_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `pickup_history`
--
ALTER TABLE `pickup_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `pickup_id` (`pickup_id`);

--
-- Indexes for table `pickup_offers`
--
ALTER TABLE `pickup_offers`
  ADD PRIMARY KEY (`offer_id`),
  ADD UNIQUE KEY `offer_per_pickup_per_driver` (`pickup_id`,`driver_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `pickup_ratings`
--
ALTER TABLE `pickup_ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD UNIQUE KEY `pickup_id_unique` (`pickup_id`) COMMENT 'Satu pickup hanya bisa memiliki satu rating',
  ADD KEY `fk_rating_user` (`user_id`),
  ADD KEY `fk_rating_driver` (`driver_id`);

--
-- Indexes for table `points`
--
ALTER TABLE `points`
  ADD PRIMARY KEY (`point_id`),
  ADD KEY `request_id` (`request_id`),
  ADD KEY `idx_points_user` (`user_id`);

--
-- Indexes for table `point_redemptions`
--
ALTER TABLE `point_redemptions`
  ADD PRIMARY KEY (`redeem_id`),
  ADD KEY `idx_redemptions_user` (`user_id`),
  ADD KEY `fk_redemption_catalog` (`catalog_id`);

--
-- Indexes for table `route_pickups`
--
ALTER TABLE `route_pickups`
  ADD PRIMARY KEY (`route_pickup_id`),
  ADD UNIQUE KEY `route_pickup_unique` (`route_id`,`pickup_id`),
  ADD KEY `pickup_id` (`pickup_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_sessions_token` (`token`);

--
-- Indexes for table `trash_categories`
--
ALTER TABLE `trash_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_code` (`category_code`);

--
-- Indexes for table `trash_items`
--
ALTER TABLE `trash_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `pickup_id` (`pickup_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `trash_photos`
--
ALTER TABLE `trash_photos`
  ADD PRIMARY KEY (`photo_id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `trash_pickup_requests`
--
ALTER TABLE `trash_pickup_requests`
  ADD PRIMARY KEY (`pickup_id`),
  ADD KEY `address_id` (`address_id`),
  ADD KEY `idx_pickup_user_date` (`user_id`,`pickup_date`),
  ADD KEY `idx_pickup_status` (`status`),
  ADD KEY `fk_pickup_driver` (`assigned_driver_id`),
  ADD KEY `fk_pickup_vehicle` (`assigned_vehicle_id`),
  ADD KEY `fk_pickup_tpa` (`assigned_tpa_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD KEY `idx_users_email` (`email`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD UNIQUE KEY `license_plate` (`license_plate`),
  ADD KEY `current_driver_id` (`current_driver_id`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `wallet_id` (`wallet_id`),
  ADD KEY `pickup_id` (`pickup_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `catalog_items`
--
ALTER TABLE `catalog_items`
  MODIFY `catalog_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `disposal_sites`
--
ALTER TABLE `disposal_sites`
  MODIFY `tpa_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `driver_routes`
--
ALTER TABLE `driver_routes`
  MODIFY `route_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `driver_wallets`
--
ALTER TABLE `driver_wallets`
  MODIFY `wallet_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pickup_history`
--
ALTER TABLE `pickup_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pickup_offers`
--
ALTER TABLE `pickup_offers`
  MODIFY `offer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `pickup_ratings`
--
ALTER TABLE `pickup_ratings`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `points`
--
ALTER TABLE `points`
  MODIFY `point_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `point_redemptions`
--
ALTER TABLE `point_redemptions`
  MODIFY `redeem_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `route_pickups`
--
ALTER TABLE `route_pickups`
  MODIFY `route_pickup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `trash_categories`
--
ALTER TABLE `trash_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `trash_items`
--
ALTER TABLE `trash_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

--
-- AUTO_INCREMENT for table `trash_photos`
--
ALTER TABLE `trash_photos`
  MODIFY `photo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `trash_pickup_requests`
--
ALTER TABLE `trash_pickup_requests`
  MODIFY `pickup_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `disposal_sites`
--
ALTER TABLE `disposal_sites`
  ADD CONSTRAINT `disposal_sites_ibfk_1` FOREIGN KEY (`operator_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `drivers_ibfk_2` FOREIGN KEY (`approved_by_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_driver_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE SET NULL;

--
-- Constraints for table `pickup_history`
--
ALTER TABLE `pickup_history`
  ADD CONSTRAINT `pickup_history_ibfk_1` FOREIGN KEY (`pickup_id`) REFERENCES `trash_pickup_requests` (`pickup_id`) ON DELETE CASCADE;

--
-- Constraints for table `pickup_ratings`
--
ALTER TABLE `pickup_ratings`
  ADD CONSTRAINT `fk_pr_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pr_pickup` FOREIGN KEY (`pickup_id`) REFERENCES `trash_pickup_requests` (`pickup_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rating_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rating_pickup` FOREIGN KEY (`pickup_id`) REFERENCES `trash_pickup_requests` (`pickup_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rating_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `points`
--
ALTER TABLE `points`
  ADD CONSTRAINT `points_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `points_ibfk_2` FOREIGN KEY (`request_id`) REFERENCES `trash_pickup_requests` (`pickup_id`) ON DELETE SET NULL;

--
-- Constraints for table `point_redemptions`
--
ALTER TABLE `point_redemptions`
  ADD CONSTRAINT `fk_redemption_catalog` FOREIGN KEY (`catalog_id`) REFERENCES `catalog_items` (`catalog_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `point_redemptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trash_items`
--
ALTER TABLE `trash_items`
  ADD CONSTRAINT `trash_items_ibfk_1` FOREIGN KEY (`pickup_id`) REFERENCES `trash_pickup_requests` (`pickup_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trash_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `trash_categories` (`category_id`);

--
-- Constraints for table `trash_photos`
--
ALTER TABLE `trash_photos`
  ADD CONSTRAINT `trash_photos_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `trash_pickup_requests` (`pickup_id`) ON DELETE CASCADE;

--
-- Constraints for table `trash_pickup_requests`
--
ALTER TABLE `trash_pickup_requests`
  ADD CONSTRAINT `fk_pickup_driver` FOREIGN KEY (`assigned_driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pickup_tpa` FOREIGN KEY (`assigned_tpa_id`) REFERENCES `disposal_sites` (`tpa_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pickup_vehicle` FOREIGN KEY (`assigned_vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `trash_pickup_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trash_pickup_requests_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`) ON DELETE CASCADE;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`current_driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
