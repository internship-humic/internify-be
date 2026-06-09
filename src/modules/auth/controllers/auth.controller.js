const authService = require('../services/auth.service');
const { response, data, error } = require('../../../helpers/utils/wrapper');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { BadRequestError, UnauthorizedError, InternalServerError } = require('../../../helpers/error');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { loginModel, updateProfileModel } = require('../models/auth.model');
const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');


class AuthController {
  async login(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, loginModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const { email, password } = validatePayload.data;
      const result = await authService.login(email, password);

      if (result.err) {
        return response(res, 'fail', result);
      }
      console.log(result.data.token)
      res.cookie("token", result.data.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response(res, 'success', result, 'Login berhasil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async me(req, res) {
    try {
      const id = req.id;

      if (!id) {
        return response(res, 'fail', error(new UnauthorizedError('Tidak diotorisasi: ID pengguna tidak ditemukan')));
      }

      const result = await authService.getCurrentUser(id, req.role);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Pengguna berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async logout(req, res) {
    try {
      return response(res, 'success', data(), 'Logout berhasil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async updateProfile(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, updateProfileModel);

      if (validatePayload.err) {
        if (req.file?.filename) {
          await deleteFileIfExists(req.file.filename).catch(() => { });
        }
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const id = req.id;
      const role = req.role;

      if (!id || !role) {
        if (req.file?.filename) {
          await deleteFileIfExists(req.file.filename).catch(() => { });
        }
        return response(res, 'fail', error(new UnauthorizedError('Tidak diotorisasi: ID pengguna tidak ditemukan')));
      }

      const result = await authService.updateProfile(id, role, validatePayload.data, req.file);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Profil berhasil diperbarui', SUCCESS.OK);
    } catch (err) {
      if (req.file?.filename) {
        await deleteFileIfExists(req.file.filename).catch(() => { });
      }
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }
}

module.exports = new AuthController();
