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
