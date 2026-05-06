-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 06, 2026 at 10:39 PM
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
-- Database: `ligonines_sistema`
--

-- --------------------------------------------------------

--
-- Table structure for table `darbuotojas`
--

CREATE TABLE `darbuotojas` (
  `asmens_kodas` varchar(11) NOT NULL,
  `role` enum('gydytojas','administratorius','laboratorijos darbuotojas') NOT NULL,
  `patirties_metai` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Medicinos personalas: gydytojai, administratoriai, laborantai';

--
-- Dumping data for table `darbuotojas`
--

INSERT INTO `darbuotojas` (`asmens_kodas`, `role`, `patirties_metai`) VALUES
('00000000000', 'gydytojas', 0),
('11111111111', 'gydytojas', 0),
('11111111112', 'gydytojas', 0),
('12340000000', 'gydytojas', 5);

-- --------------------------------------------------------

--
-- Table structure for table `kandidatas`
--

CREATE TABLE `kandidatas` (
  `id` int(11) NOT NULL,
  `prioritetinis_rodiklis` double NOT NULL,
  `busena` enum('aktyvus','rezervuotas','atmestas') NOT NULL DEFAULT 'aktyvus',
  `pacientas` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kandidatas_organas`
--

CREATE TABLE `kandidatas_organas` (
  `kandidatas_id` int(11) NOT NULL,
  `organas_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kandidatas laukia konkretaus organo';

-- --------------------------------------------------------

--
-- Table structure for table `laboratorija`
--

CREATE TABLE `laboratorija` (
  `id` int(11) NOT NULL,
  `pavadinimas` varchar(255) NOT NULL,
  `adresas` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `laboratorija`
--

INSERT INTO `laboratorija` (`id`, `pavadinimas`, `adresas`) VALUES
(1, 'Demo laboratorija', 'Demo adresas'),
(2, 'Demo laboratorija', 'Demo adresas'),
(3, 'Demo laboratorija', 'Demo adresas');

-- --------------------------------------------------------

--
-- Table structure for table `naudotojas`
--

CREATE TABLE `naudotojas` (
  `asmens_kodas` varchar(11) NOT NULL,
  `vardas` varchar(100) NOT NULL,
  `pavarde` varchar(100) NOT NULL,
  `elPastas` varchar(255) NOT NULL,
  `slaptazodis` varchar(255) NOT NULL,
  `tel_nr` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Visi sistemos naudotojai (pacientai ir darbuotojai)';

--
-- Dumping data for table `naudotojas`
--

INSERT INTO `naudotojas` (`asmens_kodas`, `vardas`, `pavarde`, `elPastas`, `slaptazodis`, `tel_nr`) VALUES
('00000000000', 'd', 'd', 'd@d.d', 'dddd', '000000000'),
('11111111111', 'a', 'a', 'b@a.a', 'aaaa', '0'),
('11111111112', 'c', 'c', 'c@c.c', 'cccc', 'c'),
('12340000000', 'a', 'a', 'a@a.a', 'aaaa', 'a');

-- --------------------------------------------------------

--
-- Table structure for table `operacija`
--

CREATE TABLE `operacija` (
  `id` int(11) NOT NULL,
  `tipas` enum('Revaskuliarizacinė operacija','Vožtuvų operacija','Aortos ir didžiųjų kraujagyslių operacija','Įgimtų ydų korekcija','Ritmo chirurgija','Mechaninės pagalbos ir transplantacijos operacija','Rekonstrukcinė operacija','Širdies navikų chirurgija','Perikardo chirurgija','Traumų chirurgija') NOT NULL,
  `prioritetas` enum('1','2','3','4','5') NOT NULL,
  `data` date NOT NULL,
  `pradzios_laikas` time NOT NULL DEFAULT '08:00:00',
  `trukme_min` int(11) NOT NULL,
  `busena` enum('užregistruotas','aktīvus','atliktas') NOT NULL DEFAULT 'užregistruotas',
  `sudetingumas` enum('1','2','3','4','5') NOT NULL,
  `pacientas` varchar(11) NOT NULL,
  `operacine_nr` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `operacija_gydytojas`
--

CREATE TABLE `operacija_gydytojas` (
  `operacija_id` int(11) NOT NULL,
  `gydytojas_id` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gydytojai, dalyvavę operacijoje';

-- --------------------------------------------------------

--
-- Table structure for table `operacijos_rezultatai`
--

CREATE TABLE `operacijos_rezultatai` (
  `id` int(11) NOT NULL,
  `paciento_stabilumas` enum('1','2','3','4','5') NOT NULL,
  `komplikaciju_sunkumas` enum('1','2','3','4','5') NOT NULL,
  `skausmo_lygis` enum('1','2','3','4','5') NOT NULL,
  `operacija_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `operacine`
--

CREATE TABLE `operacine` (
  `nr` int(11) NOT NULL,
  `atliekamos_operacijos_tipas` enum('Revaskuliarizacinė operacija','Vožtuvų operacija','Aortos ir didžiųjų kraujagyslių operacija','Įgimtų ydų korekcija','Ritmo chirurgija','Mechaninės pagalbos ir transplantacijos operacija','Rekonstrukcinė operacija','Širdies navikų chirurgija','Perikardo chirurgija','Traumų chirurgija') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `operacine`
--

INSERT INTO `operacine` (`nr`, `atliekamos_operacijos_tipas`) VALUES
(1, 'Mechaninės pagalbos ir transplantacijos operacija'),
(2, 'Ritmo chirurgija'),
(3, 'Širdies navikų chirurgija'),
(4, 'Aortos ir didžiųjų kraujagyslių operacija'),
(5, 'Širdies navikų chirurgija'),
(6, 'Mechaninės pagalbos ir transplantacijos operacija');

-- --------------------------------------------------------

--
-- Table structure for table `organas`
--

CREATE TABLE `organas` (
  `id` int(11) NOT NULL,
  `tipas` enum('širdis') NOT NULL,
  `kraujo_grupe` enum('O','A','B','AB') NOT NULL,
  `gavimo_data` date NOT NULL,
  `busena` enum('laisvas','rezervuotas') NOT NULL DEFAULT 'laisvas',
  `donoro_amzius` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organas`
--

INSERT INTO `organas` (`id`, `tipas`, `kraujo_grupe`, `gavimo_data`, `busena`, `donoro_amzius`) VALUES
(1, 'širdis', 'A', '2026-04-20', 'laisvas', 87);

-- --------------------------------------------------------

--
-- Table structure for table `pacientas`
--

CREATE TABLE `pacientas` (
  `asmens_kodas` varchar(11) NOT NULL,
  `kraujo_grupe` enum('O','A','B','AB') NOT NULL,
  `ugis_cm` int(11) NOT NULL,
  `svoris_kg` int(11) NOT NULL,
  `amzius` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pacientų medicininiai duomenys';

--
-- Dumping data for table `pacientas`
--

INSERT INTO `pacientas` (`asmens_kodas`, `kraujo_grupe`, `ugis_cm`, `svoris_kg`, `amzius`) VALUES
('00000000000', 'B', 180, 77, 29);

-- --------------------------------------------------------

--
-- Table structure for table `transplantacija`
--

CREATE TABLE `transplantacija` (
  `id` int(11) NOT NULL,
  `registracijos_data` date NOT NULL,
  `prioritetas` enum('1','2','3','4','5') NOT NULL,
  `busena` enum('įvyko','nevyko','laukiama','rezervuota') NOT NULL DEFAULT 'laukiama',
  `vieta_eileje` int(11) NOT NULL,
  `organas_id` int(11) DEFAULT NULL,
  `operacija_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Organų transplantacijos įrašai';

-- --------------------------------------------------------

--
-- Table structure for table `trumpalaikis_slaptazodis`
--

CREATE TABLE `trumpalaikis_slaptazodis` (
  `id` int(11) NOT NULL,
  `slaptazodis` varchar(255) NOT NULL,
  `data` date NOT NULL,
  `naudotojas` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tyrimas`
--

CREATE TABLE `tyrimas` (
  `id` int(11) NOT NULL,
  `tipas` enum('Elektrofiziologinis tyrimas','Vaizdinis tyrimas','Funkcinis tyrimas','Invazinis diagnostinis tyrimas','Laboratorinis tyrimas','Hemodinaminis tyrimas','Monitoravimo tyrimas','Rizikos vertinimo ir priešoperacinis tyrimas','Genetinis ir molekulinis tyrimas') NOT NULL,
  `data` date NOT NULL,
  `kabinetas` int(11) NOT NULL,
  `busena` enum('užregistruotas','aktīvus','atliktas') NOT NULL DEFAULT 'užregistruotas',
  `pacientas` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tyrimas`
--

INSERT INTO `tyrimas` (`id`, `tipas`, `data`, `kabinetas`, `busena`, `pacientas`) VALUES
(3, 'Laboratorinis tyrimas', '2026-05-05', 1, 'užregistruotas', '00000000000'),
(4, 'Elektrofiziologinis tyrimas', '2026-05-06', 2, 'užregistruotas', '00000000000');

-- --------------------------------------------------------

--
-- Table structure for table `tyrimo_rezultatai`
--

CREATE TABLE `tyrimo_rezultatai` (
  `id` int(11) NOT NULL,
  `rodiklis` float NOT NULL,
  `rodiklis_min` float NOT NULL,
  `rodiklis_max` float NOT NULL,
  `vertinimas` enum('gerai','vidutiniškai','blogai') NOT NULL,
  `data` date NOT NULL,
  `tyrimas_id` int(11) NOT NULL,
  `laboratorija_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tyrimo_rezultatai`
--

INSERT INTO `tyrimo_rezultatai` (`id`, `rodiklis`, `rodiklis_min`, `rodiklis_max`, `vertinimas`, `data`, `tyrimas_id`, `laboratorija_id`) VALUES
(7, 9.47, 2.32, 9.91, 'vidutiniškai', '2026-05-05', 3, 1),
(8, 3.21, 2.22, 8.32, 'gerai', '2026-05-05', 4, 3);

-- --------------------------------------------------------

--
-- Table structure for table `vizitas`
--

CREATE TABLE `vizitas` (
  `id` int(11) NOT NULL,
  `priezastis` varchar(255) NOT NULL,
  `data` date NOT NULL,
  `trukme_min` int(11) NOT NULL,
  `kabinetas` int(11) NOT NULL,
  `pacientas` varchar(11) NOT NULL,
  `gydytojas` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vizitas`
--

INSERT INTO `vizitas` (`id`, `priezastis`, `data`, `trukme_min`, `kabinetas`, `pacientas`, `gydytojas`) VALUES
(1, 'taip', '2025-03-09', 25, 127, '00000000000', '11111111111');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `darbuotojas`
--
ALTER TABLE `darbuotojas`
  ADD PRIMARY KEY (`asmens_kodas`);

--
-- Indexes for table `kandidatas`
--
ALTER TABLE `kandidatas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_kandidatas_pacientas` (`pacientas`),
  ADD KEY `idx_kandidatas_prioritetas` (`prioritetinis_rodiklis`);

--
-- Indexes for table `kandidatas_organas`
--
ALTER TABLE `kandidatas_organas`
  ADD PRIMARY KEY (`kandidatas_id`,`organas_id`),
  ADD KEY `fk_ko_org` (`organas_id`);

--
-- Indexes for table `laboratorija`
--
ALTER TABLE `laboratorija`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `naudotojas`
--
ALTER TABLE `naudotojas`
  ADD PRIMARY KEY (`asmens_kodas`),
  ADD UNIQUE KEY `uq_naudotojas_email` (`elPastas`);

--
-- Indexes for table `operacija`
--
ALTER TABLE `operacija`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_op_sala` (`operacine_nr`),
  ADD KEY `idx_operacija_pacientas` (`pacientas`),
  ADD KEY `idx_operacija_data` (`data`);

--
-- Indexes for table `operacija_gydytojas`
--
ALTER TABLE `operacija_gydytojas`
  ADD PRIMARY KEY (`operacija_id`,`gydytojas_id`),
  ADD KEY `fk_og_darb` (`gydytojas_id`);

--
-- Indexes for table `operacijos_rezultatai`
--
ALTER TABLE `operacijos_rezultatai`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_or_op` (`operacija_id`);

--
-- Indexes for table `operacine`
--
ALTER TABLE `operacine`
  ADD PRIMARY KEY (`nr`);

--
-- Indexes for table `organas`
--
ALTER TABLE `organas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_organas_busena` (`busena`);

--
-- Indexes for table `pacientas`
--
ALTER TABLE `pacientas`
  ADD PRIMARY KEY (`asmens_kodas`);

--
-- Indexes for table `transplantacija`
--
ALTER TABLE `transplantacija`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tr_org` (`organas_id`),
  ADD KEY `fk_tr_op` (`operacija_id`),
  ADD KEY `idx_transplantacija_busena` (`busena`);

--
-- Indexes for table `trumpalaikis_slaptazodis`
--
ALTER TABLE `trumpalaikis_slaptazodis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ts_naud` (`naudotojas`);

--
-- Indexes for table `tyrimas`
--
ALTER TABLE `tyrimas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tyrimas_pacientas` (`pacientas`);

--
-- Indexes for table `tyrimo_rezultatai`
--
ALTER TABLE `tyrimo_rezultatai`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tr_tyr` (`tyrimas_id`),
  ADD KEY `fk_tr_lab` (`laboratorija_id`);

--
-- Indexes for table `vizitas`
--
ALTER TABLE `vizitas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vizitas_pacientas` (`pacientas`),
  ADD KEY `idx_vizitas_gydytojas` (`gydytojas`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kandidatas`
--
ALTER TABLE `kandidatas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `laboratorija`
--
ALTER TABLE `laboratorija`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `operacija`
--
ALTER TABLE `operacija`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `operacijos_rezultatai`
--
ALTER TABLE `operacijos_rezultatai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `operacine`
--
ALTER TABLE `operacine`
  MODIFY `nr` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `organas`
--
ALTER TABLE `organas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transplantacija`
--
ALTER TABLE `transplantacija`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trumpalaikis_slaptazodis`
--
ALTER TABLE `trumpalaikis_slaptazodis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tyrimas`
--
ALTER TABLE `tyrimas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tyrimo_rezultatai`
--
ALTER TABLE `tyrimo_rezultatai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `vizitas`
--
ALTER TABLE `vizitas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `darbuotojas`
--
ALTER TABLE `darbuotojas`
  ADD CONSTRAINT `fk_darb_naud` FOREIGN KEY (`asmens_kodas`) REFERENCES `naudotojas` (`asmens_kodas`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kandidatas`
--
ALTER TABLE `kandidatas`
  ADD CONSTRAINT `fk_kand_pac` FOREIGN KEY (`pacientas`) REFERENCES `pacientas` (`asmens_kodas`) ON UPDATE CASCADE;

--
-- Constraints for table `kandidatas_organas`
--
ALTER TABLE `kandidatas_organas`
  ADD CONSTRAINT `fk_ko_kand` FOREIGN KEY (`kandidatas_id`) REFERENCES `kandidatas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ko_org` FOREIGN KEY (`organas_id`) REFERENCES `organas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `operacija`
--
ALTER TABLE `operacija`
  ADD CONSTRAINT `fk_op_pac` FOREIGN KEY (`pacientas`) REFERENCES `pacientas` (`asmens_kodas`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_op_sala` FOREIGN KEY (`operacine_nr`) REFERENCES `operacine` (`nr`) ON UPDATE CASCADE;

--
-- Constraints for table `operacija_gydytojas`
--
ALTER TABLE `operacija_gydytojas`
  ADD CONSTRAINT `fk_og_darb` FOREIGN KEY (`gydytojas_id`) REFERENCES `darbuotojas` (`asmens_kodas`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_og_op` FOREIGN KEY (`operacija_id`) REFERENCES `operacija` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `operacijos_rezultatai`
--
ALTER TABLE `operacijos_rezultatai`
  ADD CONSTRAINT `fk_or_op` FOREIGN KEY (`operacija_id`) REFERENCES `operacija` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pacientas`
--
ALTER TABLE `pacientas`
  ADD CONSTRAINT `fk_pac_naud` FOREIGN KEY (`asmens_kodas`) REFERENCES `naudotojas` (`asmens_kodas`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transplantacija`
--
ALTER TABLE `transplantacija`
  ADD CONSTRAINT `fk_tr_op` FOREIGN KEY (`operacija_id`) REFERENCES `operacija` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tr_org` FOREIGN KEY (`organas_id`) REFERENCES `organas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `trumpalaikis_slaptazodis`
--
ALTER TABLE `trumpalaikis_slaptazodis`
  ADD CONSTRAINT `fk_ts_naud` FOREIGN KEY (`naudotojas`) REFERENCES `naudotojas` (`asmens_kodas`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tyrimas`
--
ALTER TABLE `tyrimas`
  ADD CONSTRAINT `fk_tyr_pac` FOREIGN KEY (`pacientas`) REFERENCES `pacientas` (`asmens_kodas`) ON UPDATE CASCADE;

--
-- Constraints for table `tyrimo_rezultatai`
--
ALTER TABLE `tyrimo_rezultatai`
  ADD CONSTRAINT `fk_tr_lab` FOREIGN KEY (`laboratorija_id`) REFERENCES `laboratorija` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tr_tyr` FOREIGN KEY (`tyrimas_id`) REFERENCES `tyrimas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vizitas`
--
ALTER TABLE `vizitas`
  ADD CONSTRAINT `fk_viz_darb` FOREIGN KEY (`gydytojas`) REFERENCES `darbuotojas` (`asmens_kodas`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_viz_pac` FOREIGN KEY (`pacientas`) REFERENCES `pacientas` (`asmens_kodas`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
