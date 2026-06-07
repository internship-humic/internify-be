const feedbackService = require('../services/feedback.service');
const { response, error } = require('../../../helpers/utils/wrapper');
const { BadRequestError, InternalServerError } = require('../../../helpers/error');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { createFeedbackModel, updateFeedbackModel, getAllFeedbackModel } = require('../models/feedback.model');
const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');

class FeedbackController {
  async addFeedback(req, res) {
    try {
      const image_path = req.file;

      const validatePayload = isValidPayload(req.body, createFeedbackModel);

      if (validatePayload.err) {
        if (image_path?.filename) {
          await deleteFileIfExists(image_path.filename);
        }
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await feedbackService.createFeedback(validatePayload.data, image_path);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Feedback berhasil dibuat', SUCCESS.CREATED);
    } catch (err) {
      if (req.file?.filename) {
        await deleteFileIfExists(req.file.filename);
      }
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getAllFeedback(req, res) {
    try {
      const validatePayload = isValidPayload(req.query, getAllFeedbackModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Query parameter tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await feedbackService.getAllFeedback(validatePayload.data);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Berhasil mengambil semua feedback', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getFeedbackById(req, res) {
    try {
      const { id } = req.params;

      const result = await feedbackService.getFeedbackById(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Berhasil mengambil feedback berdasarkan ID', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async updateFeedback(req, res) {
    try {
      const { id } = req.params;
      const image_path = req.file;

      const validatePayload = isValidPayload(req.body, updateFeedbackModel);

      if (validatePayload.err) {
        if (image_path?.filename) {
          await deleteFileIfExists(image_path.filename);
        }
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await feedbackService.updateFeedback(id, validatePayload.data, image_path);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Feedback berhasil diperbarui', SUCCESS.OK);
    } catch (err) {
      if (req.file?.filename) {
        await deleteFileIfExists(req.file.filename);
      }
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async deleteFeedback(req, res) {
    try {
      const { id } = req.params;

      const result = await feedbackService.deleteFeedback(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Feedback berhasil dihapus', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }
}

module.exports = new FeedbackController();
