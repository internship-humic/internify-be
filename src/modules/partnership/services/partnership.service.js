const partnershipRepository = require('../repositories/partnership.repository');
const path = require('path');
const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
const imageUploadHelper = require('../../../helpers/utils/imageUpload.helper');
const { data, error } = require('../../../helpers/utils/wrapper');
const { NotFoundError } = require('../../../helpers/error');

class PartnershipService {
  async createPartnership(nama_partner, imageFile) {
    try {
      const imagePath = imageUploadHelper.uploadImage(imageFile);

      const partnershipData = {
        nama_partner,
        image_path: imagePath,
      };

      const result = await partnershipRepository.create(partnershipData);
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

  async getAllPartnerships() {
    try {
      const partnerships = await partnershipRepository.findAll();
      return data(partnerships);
    } catch (err) {
      return error(err);
    }
  }

  async getPartnershipById(id) {
    try {
      const partnership = await partnershipRepository.findById(id);

      if (!partnership) {
        return error(new NotFoundError('Partnership Tidak Ditemukan'));
      }

      return data(partnership);
    } catch (err) {
      return error(err);
    }
  }

  async updatePartnership(id, nama_partner, imageFile) {
    let oldImagePath = null;
    let newImageUploaded = false;

    try {
      const checkResult = await this.getPartnershipById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const existingPartnership = checkResult.data;
      let imagePath = existingPartnership.image_path;

      if (imageFile) {
        oldImagePath = existingPartnership.image_path;

        imagePath = imageUploadHelper.uploadImage(imageFile);
        newImageUploaded = true;

        if (oldImagePath) {
          const oldFileName = path.basename(oldImagePath);
          await deleteFileIfExists(oldFileName);
        }
      }

      const partnershipData = {
        nama_partner,
        image_path: imagePath,
      };

      const result = await partnershipRepository.updateById(id, partnershipData);
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

  async deletePartnership(id) {
    try {
      const checkResult = await this.getPartnershipById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const partnership = checkResult.data;

      if (partnership.image_path) {
        const fileName = path.basename(partnership.image_path);
        await deleteFileIfExists(fileName);
      }

      const result = await partnershipRepository.deleteById(id);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }
}

module.exports = new PartnershipService();
