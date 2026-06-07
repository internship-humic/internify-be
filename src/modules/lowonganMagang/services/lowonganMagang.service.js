const { v4: uuidv4 } = require('uuid');
const path = require('path');
const lowonganMagangRepository = require('../repositories/lowonganMagang.repository');
const batchRepository = require('../../batch/repositories/batch.repository');
const imageUploadHelper = require('../../../helpers/utils/imageUpload.helper');
const statusHelper = require('../helpers/status.helper');
const { deleteFileIfExists, validateImagePath } = require('../../../helpers/utils/fileHelper');
const { data, error } = require('../../../helpers/utils/wrapper');
const { NotFoundError } = require('../../../helpers/error');

class LowonganMagangService {
  async createLowonganMagang(lowonganData, imageFile) {
    try {
      const activeBatch = await batchRepository.findActiveBatch();

      if (!activeBatch) {
        return error(new NotFoundError('Tidak ada batch yang aktif'));
      }

      const id = uuidv4();
      const imagePath = imageUploadHelper.uploadImage(imageFile);
      const status = statusHelper.calculateStatus(
        lowonganData.durasi_awal,
        lowonganData.durasi_akhir
      );

      const newLowonganData = {
        id,
        ...lowonganData,
        id_batch: activeBatch.id,
        status_lowongan: status,
        image_path: imagePath,
      };

      const result = await lowonganMagangRepository.create(newLowonganData);
      return data(result);
    } catch (err) {
      if (imageFile?.filename) {
        try {
          await deleteFileIfExists(imageFile.filename);
        } catch (cleanupErr) {
          console.error('Failed to cleanup file:', cleanupErr);
        }
      }
      return error(err);
    }
  }

  async getAllLowonganMagang() {
    try {
      const lowonganList = await lowonganMagangRepository.findAll();

      if (lowonganList.length === 0) {
        return data([]);
      }

      const updatedList = statusHelper.updateMultipleLowonganStatus(lowonganList);

      const validatedList = updatedList.map(lowongan => ({
        ...lowongan,
        image_path: validateImagePath(lowongan.image_path)
      }));

      return data(validatedList);
    } catch (err) {
      return error(err);
    }
  }

  async getLowonganMagangById(id) {
    try {
      const lowongan = await lowonganMagangRepository.findById(id);

      if (!lowongan) {
        return error(new NotFoundError('Lowongan Magang Tidak Ditemukan'));
      }

      const updatedLowongan = statusHelper.updateLowonganStatus(lowongan);

      updatedLowongan.image_path = validateImagePath(updatedLowongan.image_path);

      return data(updatedLowongan);
    } catch (err) {
      return error(err);
    }
  }

  async getLowonganByKelompokPeminatan(kelompok_peminatan) {
    try {
      const lowonganList = await lowonganMagangRepository.findByKelompokPeminatan(
        kelompok_peminatan
      );

      if (lowonganList.length === 0) {
        return data([]);
      }

      const updatedList = statusHelper.updateMultipleLowonganStatus(lowonganList);

      const validatedList = updatedList.map(lowongan => ({
        ...lowongan,
        image_path: validateImagePath(lowongan.image_path)
      }));

      return data(validatedList);
    } catch (err) {
      return error(err);
    }
  }

  async getAllKelompokPeminatan() {
    try {
      const kelompokList = await lowonganMagangRepository.findAllKelompokPeminatan();
      const kelompokNames = kelompokList.map((row) => row.kelompok_peminatan);
      return data(kelompokNames);
    } catch (err) {
      return error(err);
    }
  }

  async updateLowonganMagang(id, lowonganData, imageFile) {
    let oldImagePath = null;
    let newImageUploaded = false;

    try {
      const checkResult = await this.getLowonganMagangById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const existingLowongan = checkResult.data;

      if (imageFile) {
        oldImagePath = existingLowongan.image_path;

        lowonganData.image_path = imageUploadHelper.uploadImage(imageFile);
        newImageUploaded = true;

        if (oldImagePath) {
          const oldFileName = path.basename(oldImagePath);
          await deleteFileIfExists(oldFileName);
        }
      }

      if (lowonganData.durasi_awal || lowonganData.durasi_akhir) {
        const durasi_awal = lowonganData.durasi_awal || existingLowongan.durasi_awal;
        const durasi_akhir = lowonganData.durasi_akhir || existingLowongan.durasi_akhir;

        lowonganData.status_lowongan = statusHelper.calculateStatus(
          durasi_awal,
          durasi_akhir
        );
      }

      const result = await lowonganMagangRepository.updateById(id, lowonganData);
      return data(result);
    } catch (err) {
      if (newImageUploaded && imageFile?.filename) {
        try {
          await deleteFileIfExists(imageFile.filename);
        } catch (cleanupErr) {
          console.error('Failed to cleanup new file:', cleanupErr);
        }
      }
      return error(err);
    }
  }

  async deleteLowonganMagang(id) {
    try {
      const checkResult = await this.getLowonganMagangById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const lowongan = checkResult.data;

      if (lowongan.image_path) {
        const fileName = path.basename(lowongan.image_path);
        await deleteFileIfExists(fileName);
      }

      const result = await lowonganMagangRepository.deleteById(id);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }
}

module.exports = new LowonganMagangService();
