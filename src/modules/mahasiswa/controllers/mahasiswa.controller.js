const mahasiswaService = require('../services/mahasiswa.service');
const { response, error, paginationResponse } = require('../../../helpers/utils/wrapper');
const { InternalServerError } = require('../../../helpers/error');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { createMahasiswaModel, updateMahasiswaModel, getAllMahasiswaModel } = require('../models/mahasiswa.model');

class MahasiswaController {
  async createMahasiswa(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, createMahasiswaModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await mahasiswaService.createMahasiswa(validatePayload.data);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Mahasiswa berhasil dibuat', SUCCESS.CREATED);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getAllMahasiswa(req, res) {
    try {
      const validatePayload = isValidPayload(req.query, getAllMahasiswaModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const query = validatePayload.data;
      const result = await mahasiswaService.getAllMahasiswa({ query });

      if (result.err) {
        return response(res, 'fail', result);
      }

      return paginationResponse(res, 'success', result, 'Data mahasiswa berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getMahasiswaById(req, res) {
    try {
      const { id } = req.params;

      const result = await mahasiswaService.getMahasiswaById(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Mahasiswa berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async updateMahasiswa(req, res) {
    try {
      const { id } = req.params;

      const validatePayload = isValidPayload(req.body, updateMahasiswaModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const result = await mahasiswaService.updateMahasiswa(id, validatePayload.data);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Mahasiswa berhasil diperbarui', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async deleteMahasiswa(req, res) {
    try {
      const { id } = req.params;

      const result = await mahasiswaService.deleteMahasiswa(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Mahasiswa berhasil dihapus', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async deleteAllMahasiswa(req, res) {
    try {
      const result = await mahasiswaService.deleteAllMahasiswa();

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Semua mahasiswa berhasil dihapus', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }
}

module.exports = new MahasiswaController();
