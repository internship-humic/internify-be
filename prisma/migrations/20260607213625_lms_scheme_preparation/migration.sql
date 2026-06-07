-- AlterTable
ALTER TABLE `admin` ADD COLUMN `professional_bio` TEXT NULL,
    ADD COLUMN `profile_picture` TEXT NULL,
    MODIFY `role` ENUM('admin', 'intern') NOT NULL DEFAULT 'admin';

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_mahasiswa` INTEGER NOT NULL,
    `id_lamaran_magang` INTEGER NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` TEXT NOT NULL,
    `role` ENUM('admin', 'intern') NOT NULL DEFAULT 'intern',
    `professional_bio` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_id_mahasiswa_key`(`id_mahasiswa`),
    UNIQUE INDEX `user_id_lamaran_magang_key`(`id_lamaran_magang`),
    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_admin` INTEGER NOT NULL,
    `project_icon` ENUM('code', 'chart', 'cloud', 'mobile', 'gear', 'users', 'clipboard', 'speedometer', 'lightbulb', 'shield') NOT NULL DEFAULT 'code',
    `project_name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `max_members` INTEGER NOT NULL DEFAULT 8,
    `status` ENUM('active', 'completed', 'archived') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `project_id_admin_foreign`(`id_admin`),
    INDEX `project_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_project` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `status` ENUM('active', 'removed') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `project_member_id_project_foreign`(`id_project`),
    INDEX `project_member_id_user_foreign`(`id_user`),
    INDEX `project_member_status_idx`(`status`),
    UNIQUE INDEX `project_member_id_project_id_user_key`(`id_project`, `id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_project` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `deadline_at` DATETIME(3) NOT NULL,
    `submission_type` ENUM('file_upload', 'url_link') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `task_id_project_foreign`(`id_project`),
    INDEX `task_deadline_at_idx`(`deadline_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_task` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `file_path` TEXT NULL,
    `url_link` TEXT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `task_submission_id_task_foreign`(`id_task`),
    INDEX `task_submission_id_user_foreign`(`id_user`),
    UNIQUE INDEX `task_submission_id_task_id_user_key`(`id_task`, `id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_id_mahasiswa_foreign` FOREIGN KEY (`id_mahasiswa`) REFERENCES `mahasiswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_id_lamaran_magang_foreign` FOREIGN KEY (`id_lamaran_magang`) REFERENCES `lamaran_magang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_id_admin_foreign` FOREIGN KEY (`id_admin`) REFERENCES `admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member` ADD CONSTRAINT `project_member_id_project_foreign` FOREIGN KEY (`id_project`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member` ADD CONSTRAINT `project_member_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_id_project_foreign` FOREIGN KEY (`id_project`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_submission` ADD CONSTRAINT `task_submission_id_task_foreign` FOREIGN KEY (`id_task`) REFERENCES `task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_submission` ADD CONSTRAINT `task_submission_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
