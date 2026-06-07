const partnershipService = require('../services/partnership.service');
const { response, error } = require('../../../helpers/utils/wrapper');
const { InternalServerError } = require('../../../helpers/error');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { createPartnershipModel, updatePartnershipModel } = require('../models/partnership.model');
const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');

class PartnershipController {
  async addPartnership(req, res) {
    try {
      const image = req.file;

      const validatePayload = isValidPayload(req.body, createPartnershipModel);

      if (validatePayload.err) {
        if (image?.filename) {
          await deleteFileIfExists(image.filename);
        }
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const { nama_partner } = validatePayload.data;
      const result = await partnershipService.createPartnership(nama_partner, image);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data partnership berhasil ditambahkan', SUCCESS.CREATED);
    } catch (err) {
      if (req.file?.filename) {
        await deleteFileIfExists(req.file.filename);
      }
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getPartnership(req, res) {
    try {
      const result = await partnershipService.getAllPartnerships();

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data partnership berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getPartnershipById(req, res) {
    try {
      const { id } = req.params;

      const result = await partnershipService.getPartnershipById(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data partnership berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async updatePartnership(req, res) {
    try {
      const { id } = req.params;
      const image = req.file;

      const validatePayload = isValidPayload(req.body, updatePartnershipModel);

      if (validatePayload.err) {
        if (image?.filename) {
          await deleteFileIfExists(image.filename);
        }
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const { nama_partner } = validatePayload.data;
      const result = await partnershipService.updatePartnership(id, nama_partner, image);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data partnership berhasil diperbarui', SUCCESS.OK);
    } catch (err) {
      if (req.file?.filename) {
        await deleteFileIfExists(req.file.filename);
      }
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async deletePartnership(req, res) {
    try {
      const { id } = req.params;

      const result = await partnershipService.deletePartnership(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data partnership berhasil dihapus', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }
}

module.exports = new PartnershipController();
