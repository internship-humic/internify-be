const lowonganMagangService = require('../services/lowonganMagang.service');
const { response, error } = require('../../../helpers/utils/wrapper');
const { BadRequestError, ForbiddenError, InternalServerError } = require('../../../helpers/error');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { createLowonganMagangModel, updateLowonganMagangModel } = require('../models/lowonganMagang.model');
const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');

class LowonganMagangController {
  async addLowonganMagang(req, res) {
    try {
      const image_path = req.file;

      const validatePayload = isValidPayload(req.body, createLowonganMagangModel);

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

      const result = await lowonganMagangService.createLowonganMagang(validatePayload.data, image_path);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Lowongan magang berhasil dibuat', SUCCESS.CREATED);
    } catch (err) {
      if (req.file?.filename) {
        await deleteFileIfExists(req.file.filename);
      }
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getAllLowonganMagang(req, res) {
    try {
      const result = await lowonganMagangService.getAllLowonganMagang();

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Berhasil mengambil semua lowongan magang', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)),
        'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getLowonganMagangById(req, res) {
    try {
      const { id } = req.params;

      const result = await lowonganMagangService.getLowonganMagangById(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Berhasil mengambil lowongan magang berdasarkan ID', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getLowonganByKelompokPeminatan(req, res) {
    try {
      const { kelompok_peminatan } = req.params;

      const result = await lowonganMagangService.getLowonganByKelompokPeminatan(kelompok_peminatan);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Berhasil mengambil lowongan magang berdasarkan kelompok peminatan', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getAllKelompokPeminatan(req, res) {
    try {
      const result = await lowonganMagangService.getAllKelompokPeminatan();

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Berhasil mengambil semua kelompok peminatan', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async updateLowonganMagang(req, res) {
    try {
      const { id } = req.params;
      const image_path = req.file;

      const validatePayload = isValidPayload(req.body, updateLowonganMagangModel);

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

      const result = await lowonganMagangService.updateLowonganMagang(id, validatePayload.data, image_path);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Lowongan magang berhasil diperbarui', SUCCESS.OK);
    } catch (err) {
      if (req.file?.filename) {
        await deleteFileIfExists(req.file.filename);
      }
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async deleteLowonganMagangById(req, res) {
    try {
      const { id } = req.params;

      const result = await lowonganMagangService.deleteLowonganMagang(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Lowongan magang berhasil dihapus', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }
}

module.exports = new LowonganMagangController();
