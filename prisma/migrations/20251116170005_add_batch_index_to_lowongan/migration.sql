/*
  Warnings:

  - You are about to drop the column `batch` on the `lowongan_magang` table. All the data in the column will be lost.
  - Added the required column `id_batch` to the `lowongan_magang` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lowongan_magang` DROP COLUMN `batch`,
    ADD COLUMN `id_batch` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `lowongan_magang_id_batch_foreign` ON `lowongan_magang`(`id_batch`);

-- AddForeignKey
ALTER TABLE `lowongan_magang` ADD CONSTRAINT `lowongan_magang_id_batch_foreign` FOREIGN KEY (`id_batch`) REFERENCES `batch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
