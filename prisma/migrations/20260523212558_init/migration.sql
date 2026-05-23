-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` TEXT NOT NULL,
    `role` ENUM('ADMIN', 'STUDENT') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` VARCHAR(191) NOT NULL,
    `nama_depan` VARCHAR(255) NOT NULL,
    `nama_belakang` VARCHAR(255) NULL,

    UNIQUE INDEX `admin_id_user_key`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahasiswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` VARCHAR(191) NOT NULL,
    `nama_depan` VARCHAR(255) NOT NULL,
    `nama_belakang` VARCHAR(255) NULL,
    `kontak` VARCHAR(255) NOT NULL,
    `jurusan` VARCHAR(255) NOT NULL,
    `universitas` VARCHAR(255) NOT NULL,
    `negara` VARCHAR(255) NOT NULL,
    `cv_path` TEXT NOT NULL,
    `portofolio_path` TEXT NOT NULL,
    `motivasi` TEXT NOT NULL,
    `relevant_skills` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `mahasiswa_id_user_key`(`id_user`),
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

-- CreateTable
CREATE TABLE `lowongan_magang` (
    `id` VARCHAR(255) NOT NULL,
    `id_batch` INTEGER NOT NULL,
    `posisi` VARCHAR(255) NOT NULL,
    `kelompok_peminatan` VARCHAR(255) NOT NULL,
    `image_path` TEXT NOT NULL,
    `jobdesk` TEXT NOT NULL,
    `lokasi` VARCHAR(255) NOT NULL,
    `kualifikasi` TEXT NOT NULL,
    `benefit` TEXT NOT NULL,
    `durasi_awal` DATE NOT NULL,
    `durasi_akhir` DATE NOT NULL,
    `status_lowongan` ENUM('DIBUKA', 'DITUTUP') NOT NULL,
    `paid` ENUM('PAID', 'UNPAID') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lowongan_magang_id_batch_foreign`(`id_batch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lamaran_magang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_mahasiswa` INTEGER NOT NULL,
    `id_lowongan_magang` VARCHAR(255) NOT NULL,
    `status` ENUM('DITERIMA', 'DIPROSES', 'DITOLAK') NOT NULL,
    `batch` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lamaran_magang_id_mahasiswa_foreign`(`id_mahasiswa`),
    INDEX `lamaran_magang_id_lowongan_magang_foreign`(`id_lowongan_magang`),
    INDEX `lamaran_magang_batch_idx`(`batch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin` ADD CONSTRAINT `admin_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lowongan_magang` ADD CONSTRAINT `lowongan_magang_id_batch_foreign` FOREIGN KEY (`id_batch`) REFERENCES `batch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lamaran_magang` ADD CONSTRAINT `lamaran_magang_batch_foreign` FOREIGN KEY (`batch`) REFERENCES `batch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lamaran_magang` ADD CONSTRAINT `lamaran_magang_id_mahasiswa_foreign` FOREIGN KEY (`id_mahasiswa`) REFERENCES `mahasiswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lamaran_magang` ADD CONSTRAINT `lamaran_magang_id_lowongan_magang_foreign` FOREIGN KEY (`id_lowongan_magang`) REFERENCES `lowongan_magang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
