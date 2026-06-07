const faqService = require('../services/faq.services');
const { createFaqModel, updateFaqModel } = require('../models/faq.models');
const { response } = require('../../../helpers/utils/wrapper');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { InternalServerError } = require('../../../helpers/error');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');

class FaqController {
  async addFaq(req, res) {
    try {
      const payload = req.body;

      const validatePayload = isValidPayload(payload, createFaqModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          validatePayload,
          'Validasi gagal',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await faqService.createFaq(validatePayload.data);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(
        res,
        'success',
        result,
        'FAQ berhasil ditambahkan',
        SUCCESS.CREATED
      );
    } catch (err) {
      return response(
        res,
        'fail',
        { err: new InternalServerError(err.message) },
        'Terjadi kesalahan yang tidak terduga',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async getAllFaq(req, res) {
    try {
      const result = await faqService.getAllFaq();

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(
        res,
        'success',
        result,
        'Data FAQ berhasil diambil',
        SUCCESS.OK
      );
    } catch (err) {
      return response(
        res,
        'fail',
        { err: new InternalServerError(err.message) },
        'Terjadi kesalahan yang tidak terduga',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async getFaqById(req, res) {
    try {
      const { id } = req.params;

      const result = await faqService.getFaqById(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(
        res,
        'success',
        result,
        'Data FAQ berhasil diambil',
        SUCCESS.OK
      );
    } catch (err) {
      return response(
        res,
        'fail',
        { err: new InternalServerError(err.message) },
        'Terjadi kesalahan yang tidak terduga',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async updateFaq(req, res) {
    try {
      const { id } = req.params;
      const payload = req.body;

      const validatePayload = isValidPayload(payload, updateFaqModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          validatePayload,
          'Validasi gagal',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await faqService.updateFaq(id, validatePayload.data);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(
        res,
        'success',
        result,
        'FAQ berhasil diperbarui',
        SUCCESS.OK
      );
    } catch (err) {
      return response(
        res,
        'fail',
        { err: new InternalServerError(err.message) },
        'Terjadi kesalahan yang tidak terduga',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async deleteFaq(req, res) {
    try {
      const { id } = req.params;

      const result = await faqService.deleteFaq(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(
        res,
        'success',
        result,
        'FAQ berhasil dihapus',
        SUCCESS.OK
      );
    } catch (err) {
      return response(
        res,
        'fail',
        { err: new InternalServerError(err.message) },
        'Terjadi kesalahan yang tidak terduga',
        ERROR.INTERNAL_ERROR
      );
    }
  }
}

module.exports = new FaqController();