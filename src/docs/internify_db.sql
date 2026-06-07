
CREATE TABLE `admin` (
  `id` bigint(20) NOT NULL,
  `nama_depan` varchar(255) NOT NULL,
  `nama_belakang` varchar(255) NOT NULL,
  `role` enum('admin') NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `hasil_research` (
  `id` bigint(20) NOT NULL,
  `image_path` text NOT NULL,
  `nama_project` varchar(255) NOT NULL,
  `deskripsi` varchar(255) NOT NULL,
  `link_project` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `lamaran_magang` (
  `id` bigint(20) NOT NULL,
  `id_mahasiswa` bigint(20) NOT NULL,
  `id_lowongan_magang` varchar(255) NOT NULL,
  `status` enum('diterima','diproses','ditolak') NOT NULL,
  `created_at` datetime NOT NULL,
  `update_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `lowongan_magang` (
  `id` varchar(255) NOT NULL,
  `posisi` varchar(255) NOT NULL,
  `kelompok_peminatan` varchar(255) NOT NULL,
  `image_path` text NOT NULL,
  `jobdesk` text NOT NULL,
  `lokasi` varchar(255) NOT NULL,
  `kualifikasi` text NOT NULL,
  `benefit` text NOT NULL,
  `durasi_awal` date NOT NULL,
  `durasi_akhir` date NOT NULL,
  `status_lowongan` enum('dibuka','ditutup') NOT NULL,
  `paid` enum('paid','unpaid') NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `mahasiswa` (
  `id` bigint(20) NOT NULL,
  `nama_depan` varchar(255) NOT NULL,
  `nama_belakang` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `kontak` varchar(255) NOT NULL,
  `jurusan` varchar(255) NOT NULL,
  `role` enum('student') NOT NULL,
  `cv_path` text NOT NULL,
  `portofolio_path` text NOT NULL,
  `motivasi` text NOT NULL,
  `relevant_skills` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `partnership` (
  `id` bigint(20) NOT NULL,
  `nama_partner` varchar(255) NOT NULL,
  `image_path` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `hasil_research`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `lamaran_magang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lamaran_magang_id_mahasiswa_foreign` (`id_mahasiswa`),
  ADD KEY `lamaran_magang_id_lowongan_magang_foreign` (`id_lowongan_magang`);

ALTER TABLE `lowongan_magang`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `mahasiswa`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `partnership`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `admin`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `hasil_research`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `lamaran_magang`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `mahasiswa`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `partnership`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `lamaran_magang`
  ADD CONSTRAINT `lamaran_magang_id_lowongan_magang_foreign` FOREIGN KEY (`id_lowongan_magang`) REFERENCES `lowongan_magang` (`id`),
  ADD CONSTRAINT `lamaran_magang_id_mahasiswa_foreign` FOREIGN KEY (`id_mahasiswa`) REFERENCES `mahasiswa` (`id`);
COMMIT;


