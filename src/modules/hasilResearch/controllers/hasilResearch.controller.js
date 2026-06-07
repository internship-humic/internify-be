const hasilResearchService = require('../services/hasilResearch.service');
const { response, error } = require('../../../helpers/utils/wrapper');
const { BadRequestError, InternalServerError } = require('../../../helpers/error');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { createHasilResearchModel, updateHasilResearchModel } = require('../models/hasilResearch.model');
const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');

class HasilResearchController {
  async addHasilResearch(req, res) {
    try {
      const image = req.file;

      const validatePayload = isValidPayload(req.body, createHasilResearchModel);

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

      const result = await hasilResearchService.createHasilResearch(validatePayload.data, image);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data hasil research berhasil ditambahkan', SUCCESS.CREATED);
    } catch (err) {
      if (req.file?.filename) {
        await deleteFileIfExists(req.file.filename);
      }
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getHasilResearch(req, res) {
    try {
      const result = await hasilResearchService.getAllHasilResearch();

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data research berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getHasilResearchById(req, res) {
    try {
      const { id } = req.params;

      const result = await hasilResearchService.getHasilResearchById(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data research berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async updateHasilResearch(req, res) {
    try {
      const { id } = req.params;
      const image = req.file;

      const validatePayload = isValidPayload(req.body, updateHasilResearchModel);

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

      const result = await hasilResearchService.updateHasilResearch(id, validatePayload.data, image);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data hasil research berhasil diperbarui', SUCCESS.OK);
    } catch (err) {
      if (req.file?.filename) {
        await deleteFileIfExists(req.file.filename);
      }
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async deleteHasilResearch(req, res) {
    try {
      const { id } = req.params;

      const result = await hasilResearchService.deleteHasilResearch(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Data hasil research berhasil dihapus', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }
}

module.exports = new HasilResearchController();
