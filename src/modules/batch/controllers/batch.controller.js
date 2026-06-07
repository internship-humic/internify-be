const batchService = require('../services/batch.service');
const { response, error } = require('../../../helpers/utils/wrapper');
const { BadRequestError, InternalServerError } = require('../../../helpers/error');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { createBatchModel, updateBatchModel } = require('../models/batch.model');

class BatchController {
  async createBatch(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, createBatchModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await batchService.createBatch(validatePayload.data);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Batch berhasil dibuat', SUCCESS.CREATED);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getAllBatches(req, res) {
    try {
      const result = await batchService.getAllBatches();

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Berhasil mengambil semua batch', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async updateBatch(req, res) {
    try {
      const id = parseInt(req.params.id);

      const validatePayload = isValidPayload(req.body, updateBatchModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await batchService.updateBatch(id, validatePayload.data);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Batch berhasil diperbarui', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async deleteBatch(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return response(
          res,
          'fail',
          error(new BadRequestError('ID batch harus berupa angka')),
          'ID batch tidak valid',
          ERROR.BAD_REQUEST
        );
      }

      const result = await batchService.deleteBatch(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Batch berhasil dihapus', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async switchBatch(req, res) {
    try {
      const batch_number = parseInt(req.params.batch_number);

      if (isNaN(batch_number)) {
        return response(
          res,
          'fail',
          error(new BadRequestError('Nomor batch harus berupa angka')),
          'Nomor batch tidak valid',
          ERROR.BAD_REQUEST
        );
      }

      const result = await batchService.switchBatch(batch_number);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Batch berhasil diaktifkan', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }
}

module.exports = new BatchController();
