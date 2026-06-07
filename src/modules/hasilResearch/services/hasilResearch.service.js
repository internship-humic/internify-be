const hasilResearchRepository = require('../repositories/hasilResearch.repository');
const path = require('path');
const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
const imageUploadHelper = require('../../../helpers/utils/imageUpload.helper');
const { data, error } = require('../../../helpers/utils/wrapper');
const { NotFoundError } = require('../../../helpers/error');

class HasilResearchService {
  async createHasilResearch(researchData, imageFile) {
    try {
      const imagePath = imageUploadHelper.uploadImage(imageFile);

      const newResearchData = {
        ...researchData,
        image_path: imagePath,
      };

      const result = await hasilResearchRepository.create(newResearchData);
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

  async getAllHasilResearch() {
    try {
      const researchList = await hasilResearchRepository.findAll();
      return data(researchList);
    } catch (err) {
      return error(err);
    }
  }

  async getHasilResearchById(id) {
    try {
      const research = await hasilResearchRepository.findById(id);

      if (!research) {
        return error(new NotFoundError('Hasil Research Tidak Ditemukan'));
      }

      return data(research);
    } catch (err) {
      return error(err);
    }
  }

  async updateHasilResearch(id, researchData, imageFile) {
    let oldImagePath = null;
    let newImageUploaded = false;

    try {
      const checkResult = await this.getHasilResearchById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const existingResearch = checkResult.data;
      let imagePath = existingResearch.image_path;

      if (imageFile) {
        oldImagePath = existingResearch.image_path;

        imagePath = imageUploadHelper.uploadImage(imageFile);
        newImageUploaded = true;

        if (oldImagePath) {
          const oldFileName = path.basename(oldImagePath);
          await deleteFileIfExists(oldFileName);
        }
      }

      const updatedResearchData = {
        ...researchData,
        image_path: imagePath,
      };

      const result = await hasilResearchRepository.updateById(id, updatedResearchData);
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

  async deleteHasilResearch(id) {
    try {
      const checkResult = await this.getHasilResearchById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const research = checkResult.data;

      if (research.image_path) {
        const fileName = path.basename(research.image_path);
        await deleteFileIfExists(fileName);
      }

      const result = await hasilResearchRepository.deleteById(id);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }
}

module.exports = new HasilResearchService();
