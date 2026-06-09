-- CreateTable
CREATE TABLE `certificate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_project` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `certificate_no` VARCHAR(255) NOT NULL,
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `certificate_certificate_no_key`(`certificate_no`),
    INDEX `certificate_id_project_foreign`(`id_project`),
    INDEX `certificate_id_user_foreign`(`id_user`),
    UNIQUE INDEX `certificate_id_project_id_user_key`(`id_project`, `id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `certificate` ADD CONSTRAINT `certificate_id_project_foreign` FOREIGN KEY (`id_project`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificate` ADD CONSTRAINT `certificate_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
