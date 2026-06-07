-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_depan` VARCHAR(255) NOT NULL,
    `nama_belakang` VARCHAR(255) NOT NULL,
    `role` ENUM('admin') NOT NULL DEFAULT 'admin',
    `email` VARCHAR(255) NOT NULL,
    `password` TEXT NOT NULL,
    `signature` TEXT NULL,

    UNIQUE INDEX `admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hasil_research` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_path` TEXT NOT NULL,
    `nama_project` VARCHAR(255) NOT NULL,
    `deskripsi` VARCHAR(255) NOT NULL,
    `link_project` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lamaran_magang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_mahasiswa` INTEGER NOT NULL,
    `id_lowongan_magang` VARCHAR(255) NOT NULL,
    `status` ENUM('diterima', 'diproses', 'ditolak') NOT NULL,
    `batch` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    INDEX `lamaran_magang_id_mahasiswa_foreign`(`id_mahasiswa`),
    INDEX `lamaran_magang_id_lowongan_magang_foreign`(`id_lowongan_magang`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lowongan_magang` (
    `id` VARCHAR(255) NOT NULL,
    `posisi` VARCHAR(255) NOT NULL,
    `kelompok_peminatan` VARCHAR(255) NOT NULL,
    `image_path` TEXT NOT NULL,
    `jobdesk` TEXT NOT NULL,
    `lokasi` VARCHAR(255) NOT NULL,
    `kualifikasi` TEXT NOT NULL,
    `benefit` TEXT NOT NULL,
    `durasi_awal` DATE NOT NULL,
    `durasi_akhir` DATE NOT NULL,
    `batch` INTEGER NULL,
    `status_lowongan` ENUM('dibuka', 'ditutup') NOT NULL,
    `paid` ENUM('paid', 'unpaid') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahasiswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_depan` VARCHAR(255) NOT NULL,
    `nama_belakang` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,
    `kontak` VARCHAR(255) NOT NULL,
    `jurusan` VARCHAR(255) NOT NULL,
    `universitas` VARCHAR(255) NOT NULL,
    `negara` VARCHAR(255) NOT NULL,
    `role` ENUM('student') NOT NULL DEFAULT 'student',
    `cv_path` TEXT NOT NULL,
    `portofolio_path` TEXT NOT NULL,
    `motivasi` TEXT NOT NULL,
    `relevant_skills` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `mahasiswa_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partnership` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_partner` VARCHAR(255) NOT NULL,
    `image_path` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pertanyaan` TEXT NOT NULL,
    `jawaban` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `riwayat_pelamar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch` INTEGER NOT NULL,
    `negara` VARCHAR(255) NULL,
    `posisi` VARCHAR(255) NULL,
    `tahun` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `pelamar_diterima` INTEGER NOT NULL,
    `pelamar_ditolak` INTEGER NOT NULL,
    `pelamar_diproses` INTEGER NOT NULL,
    `presentase_diterima` DOUBLE NOT NULL,
    `presentase_ditolak` DOUBLE NOT NULL,
    `presentase_diproses` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `riwayat_pelamar_batch_idx`(`batch`),
    INDEX `riwayat_pelamar_negara_idx`(`negara`),
    INDEX `riwayat_pelamar_posisi_idx`(`posisi`),
    UNIQUE INDEX `riwayat_pelamar_batch_negara_posisi_key`(`batch`, `negara`, `posisi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(255) NOT NULL,
    `universitas` VARCHAR(255) NOT NULL,
    `pesan` TEXT NOT NULL,
    `batch` INTEGER NOT NULL,
    `posisi` VARCHAR(255) NOT NULL,
    `tahun` INTEGER NOT NULL,
    `image_path` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_number` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `batch_batch_number_key`(`batch_number`),
    INDEX `batch_is_active_idx`(`is_active`),
    INDEX `batch_batch_number_idx`(`batch_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lamaran_magang` ADD CONSTRAINT `lamaran_magang_id_mahasiswa_foreign` FOREIGN KEY (`id_mahasiswa`) REFERENCES `mahasiswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lamaran_magang` ADD CONSTRAINT `lamaran_magang_id_lowongan_magang_foreign` FOREIGN KEY (`id_lowongan_magang`) REFERENCES `lowongan_magang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
