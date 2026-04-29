-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主机： 127.0.0.1
-- 生成日期： 2026-04-29 16:04:41
-- 服务器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 数据库： `chengpu_polyurethane`
--

-- --------------------------------------------------------

--
-- 表的结构 `application_scenes`
--

CREATE TABLE `application_scenes` (
  `id` int(11) NOT NULL,
  `title` varchar(180) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `imageUrl` text DEFAULT NULL,
  `icon` varchar(32) DEFAULT NULL,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 转存表中的数据 `application_scenes`
--

INSERT INTO `application_scenes` (`id`, `title`, `subtitle`, `description`, `imageUrl`, `icon`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, '冷库工程', '', '大型冷库保温工程承包，确保冷链物流的温度稳定性', '/images/enterprise-site/1777449190196-kip7k4-----1_7c0712a4.png', '❄️', 1, 1, '2026-04-29 05:43:46', '2026-04-29 07:53:13'),
(2, '渔船保温', '', '渔船冷藏舱隔热保温，保证海产品新鲜度', '/images/enterprise-site/1777449169987-n45bwz-----1_01f7b80e.jpg', '🚢', 2, 1, '2026-04-29 05:43:46', '2026-04-29 07:52:52'),
(3, '建筑外墙保温', '', '建筑节能保温系统，提高建筑能效', '/images/enterprise-site/1777449209404-yoza0s-------1_f4a1a68f.png', '🏢', 3, 1, '2026-04-29 05:43:46', '2026-04-29 07:53:30'),
(4, '管道保温', '', '工业管道隔热保温，减少热损失', '/images/enterprise-site/1777449219535-r75xlp-----_d6b36671.jpg', '🔧', 4, 1, '2026-04-29 05:43:46', '2026-04-29 07:53:42'),
(5, '罐体保温', '', '啤酒罐、食品发酵罐等罐体保温应用', '/images/enterprise-site/1777449235188-f6ao0b-----1_a302b0d9.jpg', '🏭', 5, 1, '2026-04-29 05:43:46', '2026-04-29 07:53:56'),
(10, '环氧自流坪', '', '环氧自流坪是用环氧树脂为主材、固化剂、稀释剂、溶剂、分散剂、消泡剂及色浆填料等混合加工而成的环氧地坪漆。具有耐水性、耐油性、耐酸碱性、耐盐雾腐蚀性等化学特性，及耐磨性、耐冲压性、耐洗刷性等物理特性，且表面光亮、平整、美观、无接缝、易清洗、易维修保养、经久耐用，可以满足现代工业对地坪的需要。\n', '/images/enterprise-site/1777460808080-p711cq------2_e774fdb6.jpg', '', 6, 1, '2026-04-29 07:55:36', '2026-04-29 11:06:48');

-- --------------------------------------------------------

--
-- 表的结构 `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `title` varchar(180) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `imageUrl` text NOT NULL,
  `ctaLabel` varchar(80) DEFAULT NULL,
  `ctaLink` varchar(255) DEFAULT NULL,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 转存表中的数据 `banners`
--

INSERT INTO `banners` (`id`, `title`, `subtitle`, `imageUrl`, `ctaLabel`, `ctaLink`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, '聚氨酯材料服务国内外工业客户', '围绕保温、冷链、建筑外墙与工业构件场景，提供稳定可靠的聚氨酯产品与配套方案。', '/images/enterprise-site/1777459978037-1gsyud-slide3_a65ce0fd.jpg', '了解产品中心', '/products', 0, 1, '2026-04-20 10:34:20', '2026-04-29 10:52:59'),
(2, '以人为本，合作共赢，质量第一，客户至上', '客户的满意和信任是我们追求的目标', '/images/enterprise-site/1777395536538-4nf82s-slide2_63280803.jpg', '了解更多', '/products', 0, 1, '2026-04-28 16:56:26', '2026-04-28 16:58:58');

-- --------------------------------------------------------

--
-- 表的结构 `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `description` text DEFAULT NULL,
  `parentId` int(11) DEFAULT NULL,
  `level` int(11) NOT NULL DEFAULT 1,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `coverImage` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 转存表中的数据 `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parentId`, `level`, `sortOrder`, `coverImage`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, '组合聚醚', 'polyether-polyol', '适用于冷链与保温系统的组合聚醚产品。', NULL, 1, 0, NULL, 1, '2026-04-20 10:34:20', '2026-04-29 11:01:36'),
(2, '异氰酸酯', 'isocyanate', NULL, NULL, 1, 0, NULL, 1, '2026-04-20 10:34:20', '2026-04-29 11:01:01'),
(3, '双组份氰凝', 'Two-component-cyanate-ester', NULL, NULL, 1, 0, NULL, 1, '2026-04-20 10:34:20', '2026-04-29 11:04:09');

-- --------------------------------------------------------

--
-- 表的结构 `company_settings`
--

CREATE TABLE `company_settings` (
  `id` int(11) NOT NULL,
  `key` varchar(64) NOT NULL,
  `value` longtext DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 转存表中的数据 `company_settings`
--

INSERT INTO `company_settings` (`id`, `key`, `value`, `description`, `createdAt`, `updatedAt`) VALUES
(1, 'name', '绍兴市顺丰聚氨酯有限公司', '企业名称', '2026-04-21 15:56:49', '2026-04-21 15:56:49'),
(2, 'address', '浙江省绍兴市越城区孙端街道许家桥村7幢1楼', '企业地址', '2026-04-21 15:56:49', '2026-04-21 15:56:49'),
(3, 'phone', '13567550208', '企业电话', '2026-04-21 15:56:49', '2026-04-21 15:56:49'),
(4, 'email', 'sxsfjaz@126.com', '企业邮箱', '2026-04-21 15:56:49', '2026-04-21 15:56:49'),
(5, 'fax', '', '企业传真', '2026-04-21 15:56:49', '2026-04-21 15:56:49'),
(6, 'website', '绍兴市顺丰聚氨酯有限公司', '企业网站', '2026-04-21 15:56:49', '2026-04-22 02:56:20');

-- --------------------------------------------------------

--
-- 表的结构 `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `title` varchar(220) NOT NULL,
  `slug` varchar(240) NOT NULL,
  `summary` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `coverImage` text DEFAULT NULL,
  `isPublished` tinyint(1) NOT NULL DEFAULT 1,
  `publishedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `authorId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 转存表中的数据 `news`
--

INSERT INTO `news` (`id`, `title`, `slug`, `summary`, `content`, `coverImage`, `isPublished`, `publishedAt`, `authorId`, `createdAt`, `updatedAt`) VALUES
(1, '工程喷涂系列组合料在建筑领域的应用趋势', 'spray-material-building-trend', '从施工效率、节能表现与耐久性角度，观察聚氨酯喷涂材料的行业价值。', '<p>随着建筑节能要求不断提高，聚氨酯喷涂材料在围护结构中的应用越来越广。其优势主要体现在保温效率、施工连续性与复杂结构适应能力等方面。</p><p>在工业厂房、冷链设施与公共建筑节能改造中，该类材料能够显著提升整体热工性能。</p>', '/images/喷涂组合聚醚应用.png', 1, '2026-04-29 05:43:46', NULL, '2026-04-20 10:34:20', '2026-04-29 05:43:46'),
(2, '聚氨酯冷库板在冷链工程中的选型建议', 'cold-room-board-selection-guide', '围绕芯材性能、面材方案与施工节点控制，梳理冷库板选型要点。', '<p>冷链工程对保温材料的稳定性和密封性要求较高，冷库板的结构强度、导热性能与接口处理方式均会影响长期运行表现。</p>', '/images/板材组合聚醚应用.png', 1, '2026-04-29 05:43:46', NULL, '2026-04-20 10:34:20', '2026-04-29 05:43:46'),
(3, '企业生产线升级后交付效率进一步提升', 'production-line-upgrade', '通过工艺优化与流程标准化，缩短部分产品交付周期。', '<p>在生产和质检环节持续优化后，公司在冷链板材与组合料类产品的交付效率上取得进一步提升，为客户项目推进提供更稳定支持。</p>', '/images/header.png', 1, '2026-04-29 05:43:46', NULL, '2026-04-20 10:34:20', '2026-04-29 05:43:46');

-- --------------------------------------------------------

--
-- 表的结构 `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `name` varchar(180) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `parameters` text DEFAULT NULL,
  `coverImage` text DEFAULT NULL,
  `gallery` text DEFAULT NULL,
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `isPublished` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 转存表中的数据 `products`
--

INSERT INTO `products` (`id`, `categoryId`, `name`, `slug`, `excerpt`, `description`, `parameters`, `coverImage`, `gallery`, `isFeatured`, `isPublished`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
(1, 1, '包装材料组合聚醚', 'Packaging-material', '适用于易碎品包装', '该系列材料可用于易碎品与高价值物品包装。', '[{\"label\":\"适用场景\",\"value\":\"易碎品包装\"},{\"label\":\"主要特点\",\"value\":\"包裹性强、尺寸稳定\"},{\"label\":\"交付方式\",\"value\":\"组合料\"}]', '/images/enterprise-site/1777462489067-eubtz2-----------_11261de2.png', '[\"/images/enterprise-site/1777462489067-eubtz2-----------_11261de2.png\"]', 1, 1, 0, '2026-04-20 10:34:20', '2026-04-29 11:34:57'),
(3, 1, '板材组合聚醚', 'polyurethane-composite-board', '适用于工业厂房、设备外壳与建筑围护的复合板产品。', '复合板兼顾强度与保温性，适配多类工业建筑和设备配套场景。', '[{\"label\":\"应用\",\"value\":\"工业围护/设备外壳\"},{\"label\":\"特点\",\"value\":\"平整度高、保温稳定\"}]', '/images/板材组合聚醚应用.png', '[\"/images/板材组合聚醚应用.png\"]', 1, 1, 0, '2026-04-20 10:34:20', '2026-04-29 11:25:44'),
(4, 1, '喷涂组合聚醚', 'Spray-applied-polyether-combination', '服务于现场喷涂保温、防腐与建筑节能应用。', '面向建筑外墙、屋面与工业管道等场景，满足不同施工工艺要求。', '[{\"label\":\"施工方式\",\"value\":\"现场喷涂\"},{\"label\":\"应用场景\",\"value\":\"建筑/工业保温\"}]', '/images/喷涂组合聚醚应用.png', '[\"/images/喷涂组合聚醚应用.png\"]', 1, 1, 0, '2026-04-20 10:34:20', '2026-04-29 11:26:43'),
(5, 2, '异氰酸酯', 'isocyanate', '异氰酸酯', '公司生产的CX系列组合聚醚、EPS复合板胶水、聚氨酯板材、彩钢瓦楞板等产品齐全，质量优异，产品主要用于冰箱、冷柜、太阳能热水器、车库门、仿木材料、现场喷涂、冷库渔船、啤酒罐保温、以及节能环保的聚氨酯建筑外墙保温材料等。', '[{\"label\":\"适用场景\",\"value\":\"工业保温容器\"},{\"label\":\"主要特点\",\"value\":\"导热系数低、尺寸稳定\"},{\"label\":\"交付方式\",\"value\":\"组合料\"}]', '/images/enterprise-site/1777460980796-ae3fm3-----_1b35bba1.png', '[\"/images/enterprise-site/1777460980796-ae3fm3-----_1b35bba1.png\"]', 1, 1, 0, '2026-04-29 11:09:42', '2026-04-29 11:27:14'),
(6, 3, '双组份氰凝', 'Two-component cyanate ester', '双组份氰凝', '公司生产的CX系列组合聚醚、EPS复合板胶水、聚氨酯板材、彩钢瓦楞板等产品齐全，质量优异，产品主要用于冰箱、冷柜、太阳能热水器、车库门、仿木材料、现场喷涂、冷库渔船、啤酒罐保温、以及节能环保的聚氨酯建筑外墙保温材料等。', '[{\"label\":\"适用场景\",\"value\":\"工业保温容器\"},{\"label\":\"主要特点\",\"value\":\"导热系数低、尺寸稳定\"},{\"label\":\"交付方式\",\"value\":\"组合料\"}]', '/images/enterprise-site/1777461281102-me8wzs------_8d7ef4eb.jpg', '[\"/images/enterprise-site/1777461281102-me8wzs------_8d7ef4eb.jpg\"]', 1, 1, 0, '2026-04-29 11:14:44', '2026-04-29 11:27:24'),
(7, 1, '仿木/仿石组合聚醚', 'imitation-wood/imitation-stone', '适合外观', NULL, '[{\"label\":\"适用场景\",\"value\":\"工业保温容器\"},{\"label\":\"主要特点\",\"value\":\"导热系数低、尺寸稳定\"},{\"label\":\"交付方式\",\"value\":\"组合料\"}]', '/images/enterprise-site/1777462136449-o1c8bo------------_4e3c4468.png', '[\"/images/enterprise-site/1777462136449-o1c8bo------------_4e3c4468.png\"]', 1, 1, 0, '2026-04-29 11:29:11', '2026-04-29 11:31:16');

-- --------------------------------------------------------

--
-- 表的结构 `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `openId` varchar(64) NOT NULL,
  `name` text DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `loginMethod` varchar(64) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lastSignedIn` timestamp NOT NULL DEFAULT current_timestamp(),
  `passwordHash` varchar(255) DEFAULT NULL,
  `isLocalAuthEnabled` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 转存表中的数据 `users`
--

INSERT INTO `users` (`id`, `openId`, `name`, `email`, `loginMethod`, `role`, `createdAt`, `updatedAt`, `lastSignedIn`, `passwordHash`, `isLocalAuthEnabled`) VALUES
(1, 'local_wanggl0628@126.com_1776681598214', 'admin', 'wanggl0628@126.com', 'local', 'admin', '2026-04-20 10:39:58', '2026-04-29 14:04:27', '2026-04-29 06:04:27', '02171abb520eeed8216626240bfc86f31d4a2f7b8719b9b8607f26e6f4ece583$100000$0b078c77adb5e6903304d471de038b1d34e5d0bd0ae8b5e8e7cbdcd2e29713de0d4369eb1023aaed545b9df8f2a2d35e78f981022429c4e83a46b9e3ab5fe389', 1),
(1080, 'local_admin@admin.com_1777470045793', 'admin', 'admin@admin.com', 'local', 'admin', '2026-04-29 13:40:45', '2026-04-29 13:40:45', '2026-04-29 05:40:45', '6c61802629918b7ef323bc5054e8f852ea27e867a90479e5fe6a99fe0f80e713$100000$46618b46adc32d8c15d55498cb035feec85de14ea9b37e7590af32a9edd30a8a759ed8e9877f1d77207363b7f918d81db5f2c27bb58a9553b9258bebd4828761', 1);

-- --------------------------------------------------------

--
-- 表的结构 `__drizzle_migrations`
--

CREATE TABLE `__drizzle_migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hash` text NOT NULL,
  `created_at` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 转存表中的数据 `__drizzle_migrations`
--

INSERT INTO `__drizzle_migrations` (`id`, `hash`, `created_at`) VALUES
(1, '814a08e40d7fc2bcfd458759d18319198ca8ae394f2fa15617a78678e9c9c93b', 1776363355726),
(2, '40a04488fea99daf0ca9683927a08109e09b692605bf1598136732a8032f705c', 1776363727210),
(3, 'b61dbfef76a65db6ed979649d3bdd35f250536282cab69383a08a735aaf4a56a', 1776678952572);

--
-- 转储表的索引
--

--
-- 表的索引 `application_scenes`
--
ALTER TABLE `application_scenes`
  ADD PRIMARY KEY (`id`);

--
-- 表的索引 `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- 表的索引 `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`);

--
-- 表的索引 `company_settings`
--
ALTER TABLE `company_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`),
  ADD KEY `idx_key` (`key`);

--
-- 表的索引 `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `news_slug_unique` (`slug`);

--
-- 表的索引 `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`);

--
-- 表的索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_openId_unique` (`openId`);

--
-- 表的索引 `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  ADD PRIMARY KEY (`id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `application_scenes`
--
ALTER TABLE `application_scenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- 使用表AUTO_INCREMENT `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 使用表AUTO_INCREMENT `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用表AUTO_INCREMENT `company_settings`
--
ALTER TABLE `company_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- 使用表AUTO_INCREMENT `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 使用表AUTO_INCREMENT `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- 使用表AUTO_INCREMENT `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1091;

--
-- 使用表AUTO_INCREMENT `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
