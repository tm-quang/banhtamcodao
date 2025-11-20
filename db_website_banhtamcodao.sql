-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 15, 2025 at 06:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_website_banhtamcodao`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` int(11) NOT NULL COMMENT 'Khóa chính, tự tăng',
  `username` varchar(255) NOT NULL COMMENT 'Tên đăng nhập, không trùng lặp.',
  `password_hash` varchar(255) NOT NULL COMMENT 'Mật khẩu đã được mã hóa an toàn.',
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer' COMMENT 'Vai trò của tài khoản: khách hàng hoặc quản trị viên.',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Trạng thái tài khoản: đang hoạt động hoặc bị khóa.',
  `reset_token` varchar(255) DEFAULT NULL COMMENT 'Mã đặc biệt dùng để khôi phục mật khẩu.',
  `reset_token_expires` datetime DEFAULT NULL COMMENT 'Thời gian mã khôi phục hết hạn.',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Ngày giờ tạo tài khoản.',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Ngày giờ cập nhật thông tin gần nhất.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu trữ thông tin xác thực và vai trò người dùng.';

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `username`, `password_hash`, `role`, `status`, `reset_token`, `reset_token_expires`, `created_at`, `updated_at`) VALUES
(1, 'banhtamcodao', '$2b$10$tD/YQ909QYTSo6Kp0dI0kOF7lVdnlBXlPDYKFARr3evKYpQBvNgPK', 'admin', 'active', NULL, NULL, '2025-08-30 02:19:56', '2025-08-30 02:24:54'),
(2, 'minhquang030', '$2b$10$olBSbMFaQ6yxbqeN5YevMOsUnxZL4qKMCKbGnm41hJRbPCwQQaVP2', 'admin', 'active', 'cc9e30a223fd54801c859f9ab182ed896d5db298f85d3b797f59cbf9b83c49a3', '2025-09-07 13:47:20', '2025-08-30 02:30:36', '2025-09-07 12:47:20'),
(3, 'minh', '$2b$10$olBSbMFaQ6yxbqeN5YevMOsUnxZL4qKMCKbGnm41hJRbPCwQQaVP2', 'customer', 'active', NULL, NULL, '2025-08-31 18:19:05', '2025-10-04 12:18:00'),
(4, 'tang', '$2b$10$olBSbMFaQ6yxbqeN5YevMOsUnxZL4qKMCKbGnm41hJRbPCwQQaVP2', 'customer', 'active', NULL, NULL, '2025-09-01 11:13:17', '2025-10-04 12:18:03'),
(5, 'beo', '$2b$10$znGriwpHLAEKN1empN.aOOka/5jIwTKjG2210Ffj.H82epc5qxRay$2b$10$olBSbMFaQ6yxbqeN5YevMOsUnxZL4qKMCKbGnm41hJRbPCwQQaVP2', 'customer', 'active', NULL, NULL, '2025-09-04 20:40:07', '2025-10-04 12:18:05'),
(6, 'vana', '$2b$10$5BKFb0cgVeQaJHzUesmRwejORIrGoH5Wm835/XDGebkLbSK0Bd5Sm', 'customer', 'active', NULL, NULL, '2025-09-07 12:37:55', '2025-09-07 12:37:55'),
(7, '323', '$2b$10$/7/xeMnYStc1fMekBsWrPO5YNk6sEkXRIFZqJ0k5Z2lAsAODCftdO', 'customer', 'active', NULL, NULL, '2025-10-03 10:31:03', '2025-10-03 10:31:03');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL COMMENT 'Tiêu đề của thông báo.',
  `content` text NOT NULL COMMENT 'Nội dung chi tiết của thông báo.',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Cờ để bật/tắt thông báo (1 = hoạt động).',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu các thông báo chung cho khách hàng trong trang cá nhân.';

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL COMMENT 'Khóa chính, tự tăng.',
  `parent_id` int(11) DEFAULT NULL COMMENT 'ID của danh mục cha, cho phép tạo danh mục đa cấp.',
  `name` varchar(255) NOT NULL COMMENT 'Tên danh mục (VD: Bánh tằm, Thức uống).',
  `slug` varchar(255) DEFAULT NULL COMMENT 'Chuỗi URL thân thiện (vd: banh-tam).',
  `created_at` datetime DEFAULT current_timestamp() COMMENT 'Ngày giờ tạo danh mục.',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Ngày giờ cập nhật gần nhất.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Phân loại sản phẩm thành các nhóm khác nhau.';

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Bánh Tằm', 'banh-tam', '2025-08-24 13:30:36', '2025-09-07 12:31:00'),
(2, 1, 'Món Phụ', 'mon-phu', '2025-08-24 13:30:47', '2025-09-07 12:31:05'),
(3, NULL, 'Thức Uống', 'thuc-uong', '2025-08-24 13:31:10', '2025-09-07 12:31:09'),
(4, 3, 'Trà Sữa', 'tra-sua', '2025-08-24 13:31:21', '2025-09-07 12:31:12'),
(5, 2, 'Ăn Vặt', 'cac-mon-an-vat', '2025-09-07 12:31:29', '2025-09-07 12:31:29');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL COMMENT 'Khóa chính, tự tăng.',
  `account_id` int(11) NOT NULL COMMENT 'Khóa ngoại, liên kết với bảng `accounts`.',
  `full_name` varchar(255) NOT NULL COMMENT 'Tên đầy đủ của khách hàng.',
  `phone_number` varchar(20) DEFAULT NULL COMMENT 'Số điện thoại, không trùng lặp.',
  `email` varchar(255) DEFAULT NULL COMMENT 'Địa chỉ email, không trùng lặp.',
  `shipping_address` text DEFAULT NULL COMMENT 'Địa chỉ giao hàng mặc định của khách.',
  `city` varchar(100) DEFAULT NULL COMMENT 'Tỉnh/Thành phố.',
  `district` varchar(100) DEFAULT NULL COMMENT 'Quận/Huyện.',
  `reward_points` int(11) NOT NULL DEFAULT 0 COMMENT 'Điểm thưởng tích lũy của khách hàng.',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Ngày giờ tạo hồ sơ.',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Ngày giờ cập nhật hồ sơ gần nhất.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu trữ thông tin cá nhân chi tiết của khách hàng.';

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `account_id`, `full_name`, `phone_number`, `email`, `shipping_address`, `city`, `district`, `reward_points`, `created_at`, `updated_at`) VALUES
(1, 1, 'Bánh Tằm Cô Đào - Admin', '0933960788', 'banhtamcodao@gmail.com', NULL, NULL, NULL, 5000, '2025-08-30 02:27:13', '2025-09-04 17:56:27'),
(2, 2, 'Trần Minh Quang', '0394181140', 'minhquang030@gmail.com', 'Cảng An Thới', 'An Giang', 'Phú Quốc', 0, '2025-08-30 02:30:36', '2025-08-31 15:10:05'),
(3, 3, 'Minh', '0931311311', 'minh@gmail.com', NULL, NULL, NULL, 0, '2025-08-31 18:19:05', '2025-08-31 18:19:05'),
(4, 4, 'Tăng', '0123999110', 'tang@gmail.com', 'Chợ củ', NULL, NULL, 0, '2025-09-01 11:13:17', '2025-09-05 11:28:24'),
(5, 5, 'Beo', '0278888111', NULL, NULL, NULL, NULL, 0, '2025-09-04 20:40:07', '2025-09-04 20:40:07'),
(6, 6, 'nguyen van a', '0111111111', '1@2.com', NULL, NULL, NULL, 0, '2025-09-07 12:37:55', '2025-09-07 12:50:55'),
(7, 7, '323', '323232', '2323@gmail.com', NULL, NULL, NULL, 0, '2025-10-03 10:31:03', '2025-10-03 10:31:03');

-- --------------------------------------------------------

--
-- Table structure for table `display_campaigns`
--

CREATE TABLE `display_campaigns` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Tên nội bộ của chiến dịch để quản lý.',
  `type` enum('banner','notification') NOT NULL COMMENT 'Loại hình: banner ảnh hoặc thông báo chữ.',
  `display_location` enum('product_detail','home_popup','cart_page') NOT NULL COMMENT 'Vị trí sẽ hiển thị trên web.',
  `content` text DEFAULT NULL COMMENT 'Nội dung văn bản cho loại "notification".',
  `image_url` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh cho loại "banner".',
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive' COMMENT 'Trạng thái hoạt động của chiến dịch.',
  `start_date` datetime DEFAULT NULL COMMENT 'Ngày giờ bắt đầu hiển thị.',
  `end_date` datetime DEFAULT NULL COMMENT 'Ngày giờ kết thúc hiển thị.',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Quản lý các banner, popup, thông báo hiển thị trên web.';

--
-- Dumping data for table `display_campaigns`
--

INSERT INTO `display_campaigns` (`id`, `name`, `type`, `display_location`, `content`, `image_url`, `status`, `start_date`, `end_date`, `created_at`) VALUES
(1, 'Giảm giá khai trương', 'notification', 'product_detail', 'Giảm 10% khi mua từ 3 phần', NULL, 'active', '2025-09-06 23:24:00', '2025-09-13 23:24:00', '2025-09-06 16:24:55'),
(3, 'Popup', 'banner', 'home_popup', NULL, '/assets/images/banner-logo/campaign-1757244419097-banner-index.jpg', 'active', '2025-09-05 12:33:00', '2025-09-12 12:33:00', '2025-09-06 16:33:55'),
(4, 'Miễn phí ship', 'notification', 'product_detail', 'FREESHIP cho đơn hàng từ 50K (*)', NULL, 'active', '2025-09-07 12:51:00', '2025-09-14 12:51:00', '2025-09-07 05:52:07');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL COMMENT 'Khóa chính, tự tăng.',
  `order_code` varchar(255) NOT NULL COMMENT 'Mã đơn hàng hiển thị cho khách (VD: DH-09250001).',
  `recipient_name` varchar(255) NOT NULL COMMENT 'Tên người nhận hàng.',
  `phone_number` varchar(20) NOT NULL COMMENT 'Số điện thoại người đặt (dùng để tra cứu).',
  `delivery_address` varchar(255) NOT NULL COMMENT 'Địa chỉ giao hàng hoặc địa chỉ chi nhánh đến lấy.',
  `items_list` text NOT NULL COMMENT 'Danh sách món ăn trong đơn, lưu dưới dạng chuỗi đặc biệt.',
  `note` text DEFAULT NULL COMMENT 'Ghi chú của khách hàng cho đơn hàng.',
  `subtotal` decimal(10,2) NOT NULL COMMENT 'Tổng tiền hàng (chưa tính phí ship, giảm giá).',
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Phí giao hàng.',
  `promo_code` varchar(50) DEFAULT NULL COMMENT 'Mã khuyến mãi đã được áp dụng.',
  `discount_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Số tiền được giảm giá.',
  `total_amount` decimal(10,2) NOT NULL COMMENT 'Tổng số tiền cuối cùng khách phải trả.',
  `delivery_method` varchar(50) NOT NULL COMMENT 'Phương thức giao/nhận: "Giao tận nơi" hoặc "Đến lấy".',
  `payment_status` varchar(50) NOT NULL DEFAULT 'unpaid',
  `delivery_date` date NOT NULL COMMENT 'Ngày dự kiến giao hàng hoặc đến lấy.',
  `delivery_time` time NOT NULL COMMENT 'Thời gian dự kiến giao hàng hoặc đến lấy.',
  `status` enum('Chờ xác nhận','Đã xác nhận','Đang vận chuyển','Hoàn thành','Đã hủy') DEFAULT 'Chờ xác nhận' COMMENT 'Trạng thái của đơn hàng.',
  `order_time` datetime NOT NULL COMMENT 'Thời gian chính xác khách hàng bấm nút đặt hàng.',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Ngày giờ bản ghi được tạo trong CSDL.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu trữ toàn bộ thông tin về một đơn hàng.';

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_code`, `recipient_name`, `phone_number`, `delivery_address`, `items_list`, `note`, `subtotal`, `shipping_fee`, `promo_code`, `discount_amount`, `total_amount`, `delivery_method`, `payment_status`, `delivery_date`, `delivery_time`, `status`, `order_time`, `created_at`) VALUES
(26, 'DH-09250001', 'Quang', '0394181140', 'Bánh Tằm Cô Đào', '{\"name\":\"Bánh tằm chay\",\"qty\":1,\"totalPrice\":24000}|||{\"name\":\"Cafe đá\",\"qty\":1,\"totalPrice\":17000}', NULL, 41000.00, 0.00, NULL, 0.00, 41000.00, 'Đến lấy', 'paid', '2025-09-07', '08:30:00', 'Hoàn thành', '2025-09-07 10:35:02', '2025-09-07 03:35:02'),
(27, 'DH-09250002', 'Hùng', '011111111', 'Bánh Tằm Cô Đào', '{\"name\":\"Bánh tằm cay\",\"qty\":1,\"totalPrice\":35000}|||{\"name\":\"Matcha latte\",\"qty\":1,\"totalPrice\":18000}|||{\"name\":\"Trà tắc\",\"qty\":1,\"totalPrice\":15000}', NULL, 68000.00, 0.00, NULL, 0.00, 68000.00, 'Đến lấy', 'paid', '2025-09-07', '08:30:00', 'Hoàn thành', '2025-09-07 12:49:14', '2025-09-07 05:49:14'),
(28, 'DH-09250003', 'Nhật Minh', '0933960788', 'Bánh Tằm Cô Đào', '{\"name\":\"Bánh Tằm Bì\",\"qty\":1,\"totalPrice\":26000}|||{\"name\":\"Matcha latte\",\"qty\":2,\"totalPrice\":36000}|||{\"name\":\"Bánh tằm cay\",\"qty\":1,\"totalPrice\":35000}|||{\"name\":\"Bánh tằm chay\",\"qty\":1,\"totalPrice\":24000}|||{\"name\":\"Trà tắc\",\"qty\":1,\"totalPrice\":15000}|||{\"name\":\"Trà đào\",\"qty\":1,\"totalPrice\":18000}', NULL, 154000.00, 0.00, 'VIP', 77000.00, 77000.00, 'Đến lấy', 'paid', '2025-09-10', '10:30:00', 'Hoàn thành', '2025-09-09 02:06:29', '2025-09-08 19:06:29'),
(29, 'DH-10250004', 'Quang', '0394181140', 'Test', '{\"name\":\"Bánh tằm bì xíu mại\",\"qty\":1,\"totalPrice\":32000}|||{\"name\":\"Cocacola\",\"qty\":1,\"totalPrice\":10000}|||{\"name\":\"Bánh Tằm Bì\",\"qty\":1,\"totalPrice\":26000}', NULL, 68000.00, 10000.00, NULL, 0.00, 78000.00, 'Giao tận nơi', 'paid', '2025-10-04', '11:30:00', 'Hoàn thành', '2025-10-03 23:21:20', '2025-10-03 16:21:20');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL COMMENT 'Khóa chính, tự tăng.',
  `category_id` int(11) DEFAULT NULL COMMENT 'Khóa ngoại, liên kết tới bảng `categories`.',
  `name` varchar(255) NOT NULL COMMENT 'Tên sản phẩm/món ăn.',
  `slug` varchar(255) DEFAULT NULL COMMENT 'Chuỗi URL thân thiện (vd: banh-tam-bi).',
  `description` text DEFAULT NULL COMMENT 'Mô tả chi tiết về sản phẩm.',
  `image_url` varchar(500) DEFAULT NULL COMMENT 'Đường dẫn đến ảnh đại diện của sản phẩm.',
  `price` decimal(10,2) NOT NULL COMMENT 'Giá bán gốc của sản phẩm.',
  `discount_price` decimal(10,2) DEFAULT NULL COMMENT 'Giá sau khi đã khuyến mãi (nếu có).',
  `promo_text` varchar(255) DEFAULT NULL COMMENT 'Câu văn bản khuyến mãi hiển thị trên trang chi tiết (VD: "Mua 2 tặng 1").',
  `promo_quantity` int(11) DEFAULT NULL COMMENT 'Số lượng tối thiểu khách phải mua để được hưởng khuyến mãi này.',
  `promo_discount_percent` int(11) DEFAULT NULL COMMENT 'Phần trăm giảm giá khi mua đủ số lượng (`promo_quantity`).',
  `status` enum('active','inactive','hidden') DEFAULT 'active' COMMENT 'Trạng thái: đang bán, ngưng bán, hoặc ẩn khỏi menu.',
  `is_special` tinyint(1) DEFAULT 0 COMMENT 'Đánh dấu sản phẩm đặc biệt/nổi bật (1 = có, 0 = không).',
  `created_at` datetime DEFAULT current_timestamp() COMMENT 'Ngày giờ thêm sản phẩm.',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Ngày giờ cập nhật gần nhất.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu trữ thông tin cơ bản của các món ăn/sản phẩm.';

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `image_url`, `price`, `discount_price`, `promo_text`, `promo_quantity`, `promo_discount_percent`, `status`, `is_special`, `created_at`, `updated_at`) VALUES
(1, 1, 'Bánh Tằm Bì', 'banh-tam-bi', NULL, 'https://res.cloudinary.com/dgoe8cra8/image/upload/v1759491677/rzwnunxwdxc1uq3himrt.webp', 26000.00, 25000.00, 'Bánh Tằm Bì', NULL, NULL, 'active', 1, '2025-08-24 13:41:43', '2025-10-03 22:23:06'),
(2, 1, 'Bánh tằm bì xíu mại', 'banh-tam-bi-xiu-mai', NULL, 'https://res.cloudinary.com/dgoe8cra8/image/upload/v1759491658/fqpemlcplpwfqkkpu9ry.webp', 32000.00, NULL, NULL, NULL, NULL, 'active', 1, '2025-08-24 13:45:31', '2025-10-03 22:21:27'),
(10, 3, 'Trà đào', 'tra-dao', 'Trà đào', 'https://res.cloudinary.com/dgoe8cra8/image/upload/v1759491641/n2eqogdoganlmnarebn1.png', 18000.00, NULL, NULL, NULL, NULL, 'active', 1, '2025-08-26 11:36:44', '2025-10-13 23:18:59'),
(13, 3, 'Cocacola', 'cocacola', NULL, 'https://res.cloudinary.com/dgoe8cra8/image/upload/v1759491614/h0hcepfnfwbmbfggewqs.webp', 10000.00, 80000.00, NULL, NULL, NULL, 'active', 1, '2025-08-26 11:54:26', '2025-10-04 00:32:41');

-- --------------------------------------------------------

--
-- Table structure for table `product_attributes`
--

CREATE TABLE `product_attributes` (
  `id` int(11) NOT NULL COMMENT 'Khóa chính, tự tăng.',
  `product_id` int(11) NOT NULL COMMENT 'Khóa ngoại, liên kết tới sản phẩm.',
  `attribute_name` varchar(255) NOT NULL COMMENT 'Tên thuộc tính (VD: Size, Độ cay).',
  `attribute_value` varchar(255) NOT NULL COMMENT 'Giá trị của thuộc tính (VD: Lớn, Cay cấp 7).',
  `extra_price` decimal(10,2) DEFAULT 0.00 COMMENT 'Giá cộng thêm cho thuộc tính này.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Thuộc tính mở rộng cho sản phẩm (ít dùng hơn options).';

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL COMMENT 'Khóa chính, tự tăng.',
  `product_id` int(11) NOT NULL COMMENT 'Khóa ngoại, liên kết tới sản phẩm sở hữu ảnh này.',
  `image_url` varchar(500) NOT NULL COMMENT 'Đường dẫn tới file hình ảnh.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu nhiều ảnh cho một sản phẩm.';

-- --------------------------------------------------------

--
-- Table structure for table `product_options`
--

CREATE TABLE `product_options` (
  `id` int(11) NOT NULL COMMENT 'Khóa chính, tự tăng.',
  `product_id` int(11) NOT NULL COMMENT 'Khóa ngoại, liên kết tới sản phẩm có tùy chọn này.',
  `option_group` varchar(100) NOT NULL DEFAULT 'Topping' COMMENT 'Nhóm tùy chọn (VD: Topping, Size, Mức độ cay).',
  `option_name` varchar(255) NOT NULL COMMENT 'Tên tùy chọn (VD: Thêm trứng cút, Size Lớn).',
  `extra_price` decimal(10,2) DEFAULT 0.00 COMMENT 'Giá tiền phải trả thêm cho tùy chọn này.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Các tùy chọn thêm cho sản phẩm như topping, size...';

--
-- Dumping data for table `product_options`
--

INSERT INTO `product_options` (`id`, `product_id`, `option_group`, `option_name`, `extra_price`) VALUES
(10, 1, 'Topping', 'Bánh Tằm', 5000.00),
(11, 1, 'Topping', 'Xíu Mại', 10000.00);

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL COMMENT 'Khóa ngoại, liên kết tới sản phẩm được đánh giá.',
  `customer_id` int(11) DEFAULT NULL COMMENT 'Khóa ngoại, liên kết tới khách hàng (nếu họ đã đăng nhập).',
  `product_name` varchar(255) DEFAULT NULL COMMENT 'LƯU Ý: Tên sản phẩm, lưu lại để truy vấn nhanh, nhưng có thể không đồng bộ nếu tên sản phẩm thay đổi.',
  `customer_name` varchar(255) NOT NULL COMMENT 'Tên của người đánh giá.',
  `rating` tinyint(4) NOT NULL COMMENT 'Số sao đánh giá (từ 1 đến 5).',
  `comment` text DEFAULT NULL COMMENT 'Nội dung bình luận của khách hàng.',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái kiểm duyệt của đánh giá.',
  `is_verified_purchase` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Cờ xác nhận khách đã thực sự mua hàng (1 = có, 0 = không).',
  `created_at` datetime DEFAULT current_timestamp() COMMENT 'Ngày giờ gửi đánh giá.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu trữ các đánh giá, bình luận của khách về sản phẩm.';

--
-- Dumping data for table `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `product_id`, `customer_id`, `product_name`, `customer_name`, `rating`, `comment`, `status`, `is_verified_purchase`, `created_at`) VALUES
(1, 1, NULL, NULL, 'Quang', 5, 'Ngon', 'approved', 0, '2025-09-06 00:02:59'),
(5, 1, NULL, NULL, 'Tèo', 5, 'Nước mắm ngon.nước dừa béo', 'approved', 0, '2025-09-06 13:55:39'),
(6, 1, NULL, NULL, 'Yu', 5, 'Hhhj\nL', 'approved', 0, '2025-09-06 14:01:04'),
(13, 2, NULL, NULL, 'Tùng', 5, 'Ngon', 'approved', 0, '2025-09-14 03:28:13'),
(14, 1, NULL, NULL, 'Tèo', 5, 'Ngon sẽ ủng hộ tiếp', 'approved', 0, '2025-10-04 01:04:56'),
(15, 1, NULL, NULL, '23', 5, '23232', 'approved', 0, '2025-10-04 01:28:20'),
(16, 1, NULL, NULL, '424', 5, '2424', 'approved', 0, '2025-10-04 01:28:24'),
(17, 1, NULL, NULL, '2424', 5, '2424', 'approved', 0, '2025-10-04 01:28:27'),
(18, 1, NULL, NULL, 'Minh', 5, 'Ngon bổ rẻ', 'approved', 0, '2025-10-04 01:33:51'),
(19, 1, NULL, NULL, 'Tyuu', 5, 'Ghh', 'approved', 0, '2025-10-15 21:51:56');

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` int(11) NOT NULL,
  `promo_code` varchar(50) NOT NULL COMMENT 'Mã khuyến mãi để khách hàng nhập (VD: FREESHIP).',
  `title` varchar(255) NOT NULL COMMENT 'Tên của chương trình khuyến mãi.',
  `description` text DEFAULT NULL COMMENT 'Mô tả chi tiết về chương trình.',
  `discount_type` enum('percent','fixed','free_shipping') NOT NULL COMMENT 'Loại giảm giá: theo %, số tiền cố định, hoặc miễn phí ship.',
  `discount_value` decimal(10,2) NOT NULL COMMENT 'Giá trị giảm (VD: 10 cho 10%, 20000 cho 20k).',
  `min_order_value` decimal(10,2) DEFAULT 0.00 COMMENT 'Giá trị đơn hàng tối thiểu để được áp dụng.',
  `usage_limit` int(11) DEFAULT 0 COMMENT 'Tổng số lượt sử dụng tối đa (0 = không giới hạn).',
  `used_count` int(11) DEFAULT 0 COMMENT 'Số lượt đã được sử dụng.',
  `start_date` datetime NOT NULL COMMENT 'Ngày giờ bắt đầu hiệu lực.',
  `end_date` datetime NOT NULL COMMENT 'Ngày giờ kết thúc hiệu lực.',
  `status` enum('active','inactive','expired') DEFAULT 'active' COMMENT 'Trạng thái của mã khuyến mãi.',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Quản lý các mã giảm giá và chương trình khuyến mãi.';

--
-- Dumping data for table `promotions`
--

INSERT INTO `promotions` (`id`, `promo_code`, `title`, `description`, `discount_type`, `discount_value`, `min_order_value`, `usage_limit`, `used_count`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'FREESHIP', 'Miễn phí ship', 'Miễn phí ship', 'free_shipping', 10000.00, 50000.00, 5, 2, '2025-09-04 00:22:00', '2025-09-20 01:22:00', 'active', '2025-09-04 22:23:01', '2025-09-04 23:02:03'),
(2, 'BANHTAM20', 'Khai Trương', 'BANHTAM5', 'fixed', 5000.00, 0.00, 5, 1, '2025-09-03 18:28:00', '2025-09-10 18:28:00', 'active', '2025-09-04 22:28:45', '2025-09-04 23:24:16'),
(3, 'BANHTAMCODAO', 'KHAI TRƯƠNG', 'KHAI TRƯƠNG', 'percent', 5.00, 30000.00, 50, 1, '2025-09-04 08:35:00', '2025-11-05 08:35:00', 'active', '2025-09-05 12:35:45', '2025-10-03 23:56:35'),
(4, 'VIP', 'VIP', 'VIP', 'percent', 50.00, 100000.00, 100, 1, '2025-09-09 02:05:00', '2025-09-12 02:05:00', 'active', '2025-09-09 02:05:12', '2025-09-09 02:06:29');

-- --------------------------------------------------------

--
-- Table structure for table `promotion_usage_history`
--

CREATE TABLE `promotion_usage_history` (
  `id` int(11) NOT NULL,
  `promotion_id` int(11) NOT NULL COMMENT 'Khóa ngoại, liên kết tới bảng `promotions`.',
  `order_id` int(11) NOT NULL COMMENT 'Khóa ngoại, liên kết tới đơn hàng đã sử dụng mã.',
  `customer_phone` varchar(20) NOT NULL COMMENT 'SĐT của khách hàng đã sử dụng.',
  `used_at` datetime DEFAULT current_timestamp() COMMENT 'Thời gian sử dụng mã.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Ghi lại lịch sử mỗi lần mã khuyến mãi được áp dụng.';

--
-- Dumping data for table `promotion_usage_history`
--

INSERT INTO `promotion_usage_history` (`id`, `promotion_id`, `order_id`, `customer_phone`, `used_at`) VALUES
(2, 4, 28, '0933960788', '2025-09-09 02:06:29');

-- --------------------------------------------------------

--
-- Table structure for table `review_votes`
--

CREATE TABLE `review_votes` (
  `id` int(11) NOT NULL,
  `review_id` int(11) NOT NULL COMMENT 'Khóa ngoại, liên kết tới đánh giá được bình chọn.',
  `account_id` int(11) NOT NULL COMMENT 'Khóa ngoại, liên kết tới tài khoản đã bình chọn.',
  `vote_type` enum('up','down') NOT NULL DEFAULT 'up' COMMENT 'Loại bình chọn: hữu ích hoặc không.',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu lại khi người dùng bấm "hữu ích" cho một đánh giá.';

--
-- Dumping data for table `review_votes`
--

INSERT INTO `review_votes` (`id`, `review_id`, `account_id`, `vote_type`, `created_at`) VALUES
(3, 6, 2, 'up', '2025-10-04 00:34:40'),
(4, 1, 2, 'up', '2025-10-04 00:34:41'),
(5, 5, 2, 'up', '2025-10-04 00:34:42');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setting_key` varchar(50) NOT NULL COMMENT 'Khóa của cài đặt (VD: delivery_fee).',
  `setting_value` text DEFAULT NULL COMMENT 'Giá trị của cài đặt (VD: 15000).'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu các cài đặt chung cho website theo dạng key-value.';

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('closing_time', '10:30'),
('delivery_fee', '10000'),
('opening_time', '06:00'),
('payment_cod_enabled', '1'),
('payment_transfer_enabled', '1'),
('store_address', 'Ngã 5 cảng An Thới, Khu 1, Phường An Thới, Đặc Khu Phú Quốc'),
('store_email', 'banhtamcodao@gmail.com'),
('store_name', 'Bánh Tằm Cô Đào'),
('store_phone', '0933 960 788'),
('vat_tax', '8');

-- --------------------------------------------------------

--
-- Table structure for table `site_content`
--

CREATE TABLE `site_content` (
  `id` int(11) NOT NULL,
  `element_key` varchar(100) NOT NULL COMMENT 'Khóa định danh duy nhất (VD: homepage_slideshow)',
  `content_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Nội dung lưu dưới dạng JSON, chứa danh sách URL ảnh' CHECK (json_valid(`content_value`)),
  `description` varchar(255) DEFAULT NULL COMMENT 'Mô tả ngắn về mục đích của element này',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lưu trữ các nội dung động có thể thay đổi từ dashboard';

--
-- Dumping data for table `site_content`
--

INSERT INTO `site_content` (`id`, `element_key`, `content_value`, `description`, `updated_at`) VALUES
(1, 'homepage_slideshow', '[\"/assets/images/banner-logo/campaign-1757243748372-beach.jpg\",\"/assets/images/banner-logo/campaign-1757243748378-contac-background.jpg\",\"/assets/images/banner-logo/campaign-1757243748385-drop.jpg\"]', 'Các ảnh slideshow cho trang chủ', '2025-09-07 11:15:48'),
(2, 'menu_slideshow', '[\"/assets/images/banner-logo/campaign-1757243085999-drop4.jpg\",\"/assets/images/banner-logo/campaign-1757243086000-giavi3.jpg\",\"/assets/images/banner-logo/campaign-1757243086006-pork-slide-min.jpg\"]', 'Các ảnh slideshow cho trang Menu', '2025-09-07 11:04:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_category_name` (`name`),
  ADD KEY `fk_category_parent` (`parent_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_id` (`account_id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `display_campaigns`
--
ALTER TABLE `display_campaigns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_product_name` (`name`),
  ADD KEY `fk_product_category` (`category_id`);

--
-- Indexes for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attr_product` (`product_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_image_product` (`product_id`);

--
-- Indexes for table `product_options`
--
ALTER TABLE `product_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_option_product` (`product_id`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_review_product` (`product_id`),
  ADD KEY `fk_review_customer` (`customer_id`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `promo_code` (`promo_code`);

--
-- Indexes for table `promotion_usage_history`
--
ALTER TABLE `promotion_usage_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_history_promotion` (`promotion_id`),
  ADD KEY `fk_history_order` (`order_id`);

--
-- Indexes for table `review_votes`
--
ALTER TABLE `review_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_vote` (`review_id`,`account_id`),
  ADD KEY `fk_vote_account` (`account_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `site_content`
--
ALTER TABLE `site_content`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_element_key` (`element_key`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính, tự tăng', AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính, tự tăng.', AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính, tự tăng.', AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `display_campaigns`
--
ALTER TABLE `display_campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính, tự tăng.', AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính, tự tăng.', AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `product_attributes`
--
ALTER TABLE `product_attributes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính, tự tăng.';

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính, tự tăng.', AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `product_options`
--
ALTER TABLE `product_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính, tự tăng.', AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `promotion_usage_history`
--
ALTER TABLE `promotion_usage_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `review_votes`
--
ALTER TABLE `review_votes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `site_content`
--
ALTER TABLE `site_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customer_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD CONSTRAINT `fk_attr_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_image_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_options`
--
ALTER TABLE `product_options`
  ADD CONSTRAINT `fk_option_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `fk_review_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `promotion_usage_history`
--
ALTER TABLE `promotion_usage_history`
  ADD CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_history_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `review_votes`
--
ALTER TABLE `review_votes`
  ADD CONSTRAINT `fk_vote_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vote_review` FOREIGN KEY (`review_id`) REFERENCES `product_reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
