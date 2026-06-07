-- CreateIndex
CREATE INDEX `lamaran_magang_batch_idx` ON `lamaran_magang`(`batch`);

-- AddForeignKey
ALTER TABLE `lamaran_magang` ADD CONSTRAINT `lamaran_magang_batch_foreign` FOREIGN KEY (`batch`) REFERENCES `batch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
