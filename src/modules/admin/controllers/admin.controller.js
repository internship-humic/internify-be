const adminService = require('../services/admin.service');
const { response, data, error } = require('../../../helpers/utils/wrapper');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { ForbiddenError, BadRequestError, NotFoundError, InternalServerError } = require('../../../helpers/error');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { createAdminModel, updateAdminModel } = require('../models/admin.model');

class AdminController {
  async addAdmin(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, createAdminModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await adminService.createAdmin(validatePayload.data);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', data(), 'Admin berhasil dibuat', SUCCESS.CREATED);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getAdmins(req, res) {
    try {
      const result = await adminService.getAllAdmins();

      if (result.err) {
        return response(res, 'fail', result);
      }

      if (!result.data || result.data.length === 0) {
        return response(res, 'fail', error(new NotFoundError('Tidak ada admin ditemukan')));
      }

      return response(res, 'success', result, 'Admin berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getAdminById(req, res) {
    try {
      const { id } = req.params;

      const result = await adminService.getAdminById(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Admin berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async updateAdmin(req, res) {
    try {
      const { id } = req.params;

      const validatePayload = isValidPayload(req.body, updateAdminModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await adminService.updateAdmin(id, validatePayload.data);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', data(), 'Admin berhasil diperbarui', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;

      const result = await adminService.deleteAdmin(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', data(), 'Admin berhasil dihapus', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }
}

module.exports = new AdminController();
