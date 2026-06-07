const lamaranMagangService = require('../services/lamaranMagang.service');
const { response, error, paginationResponse } = require('../../../helpers/utils/wrapper');
const { InternalServerError } = require('../../../helpers/error');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { createLamaranMagangModel, updateLamaranStatusModel, getAllLamaranMagangModel, statisticModel } = require('../models/lamaranMagang.model');
const { cleanupUploadedFiles } = require('../helpers/cleanUpFiles');


class LamaranMagangController {
  async addLamaranMagang(req, res) {
    try {
      const { id_lowongan_magang } = req.params;
      const uploadedFiles = {
        cv: req.files?.cv?.[0],
        portofolio: req.files?.portofolio?.[0],
      };

      const payloadWithFiles = {
        ...req.body,
        cv: uploadedFiles.cv?.filename,
        portofolio: uploadedFiles.portofolio?.filename,
        id_lowongan_magang,
      };

      const validatePayload = isValidPayload(payloadWithFiles, createLamaranMagangModel);

      if (validatePayload.err) {
        await cleanupUploadedFiles(uploadedFiles);
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const { id_lowongan_magang: validatedLowonganId, cv, portofolio, ...mahasiswaFormData } = validatePayload.data;

      const result = await lamaranMagangService.createLamaranMagang(
        validatedLowonganId,
        mahasiswaFormData,
        uploadedFiles
      );

      if (result.err) {
        await cleanupUploadedFiles(uploadedFiles);
        return response(res, 'fail', result, 'Gagal mengajukan lamaran magang', ERROR.INTERNAL_ERROR);
      }

      return response(res, 'success', result, 'Lamaran magang berhasil diajukan', SUCCESS.CREATED);
    } catch (err) {

      await cleanupUploadedFiles({
        cv: req.files?.cv?.[0],
        portofolio: req.files?.portofolio?.[0],
      });

      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Terjadi kesalahan yang tidak terduga',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async getAllLamaranMagang(req, res) {
    try {
      const validatePayload = isValidPayload(req.query, getAllLamaranMagangModel);

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

      const result = await lamaranMagangService.getAllLamaranMagang(query);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return paginationResponse(res, 'success', result, 'Lamaran magang berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getLamaranByID(req, res) {
    try {
      const { id_lamaran_magang } = req.params;

      const result = await lamaranMagangService.getLamaranById(id_lamaran_magang);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Lamaran magang berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getDetailLamaranById(req, res) {
    try {
      const { id } = req.params;

      const result = await lamaranMagangService.getDetailLamaranById(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Detail lamaran magang berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async updateStatusLamaran(req, res) {
    try {
      const { id_lamaran_magang } = req.params;

      const validatePayload = isValidPayload(req.body, updateLamaranStatusModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const { status } = validatePayload.data;
      const result = await lamaranMagangService.updateLamaranStatus(id_lamaran_magang, status);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Status lamaran berhasil diperbarui', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async deleteLamaran(req, res) {
    try {
      const { id } = req.params;

      const result = await lamaranMagangService.deleteLamaran(id);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Lamaran magang berhasil dihapus', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async exportLamaranToExcel(req, res) {
    try {
      const result = await lamaranMagangService.exportToExcel();

      if (result.err) {
        return response(res, 'fail', result);
      }

      const workbook = result.data;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=lamaran_magang.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getDashboardStatistics(req, res) {
    try {
      const validateQuery = isValidPayload(req.query, statisticModel);

      if (validateQuery.err) {
        return response(
          res,
          'fail',
          { err: validateQuery.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const query = validateQuery.data
      const result = await lamaranMagangService.getDashboardStatistics(query);

      if (result.err) {
        return response(res, 'fail', result, 'Gagal mengambil statistik dashboard', ERROR.INTERNAL_ERROR);
      }

      return response(res, 'success', result, 'Statistik dashboard berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getStatisticsByPosition(req, res) {
    try {

      const validateQuery = isValidPayload(req.query, statisticModel);

      if (validateQuery.err) {
        return response(
          res,
          'fail',
          { err: validateQuery.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const query = validateQuery.data;
      const result = await lamaranMagangService.getStatisticsByPosition(query);

      if (result.err) {
        return response(res, 'fail', result, 'Gagal mengambil statistik berdasarkan posisi', ERROR.INTERNAL_ERROR);
      }

      return response(res, 'success', result, 'Statistik berdasarkan posisi berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getStatisticsByCountry(req, res) {
    try {
      const validateQuery = isValidPayload(req.query, statisticModel);

      if (validateQuery.err) {
        return response(
          res,
          'fail',
          { err: validateQuery.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const query = validateQuery.data;
      const result = await lamaranMagangService.getStatisticsByCountry(query);

      if (result.err) {
        return response(res, 'fail', result, 'Gagal mengambil statistik berdasarkan negara', ERROR.INTERNAL_ERROR);
      }

      return response(res, 'success', result, 'Statistik berdasarkan negara berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }

  async getStatisticsByUniversity(req, res) {
    try {
      const validateQuery = isValidPayload(req.query, statisticModel);

      if (validateQuery.err) {
        return response(
          res,
          'fail',
          { err: validateQuery.err, data: null },
          'Data tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }
      const query = validateQuery.data;
      const result = await lamaranMagangService.getStatisticsByUniversity(query);

      if (result.err) {
        return response(res, 'fail', result, 'Gagal mengambil statistik berdasarkan universitas', ERROR.INTERNAL_ERROR);
      }

      return response(res, 'success', result, 'Statistik berdasarkan universitas berhasil diambil', SUCCESS.OK);
    } catch (err) {
      return response(res, 'fail', error(new InternalServerError(err.message)), 'Terjadi kesalahan yang tidak terduga', ERROR.INTERNAL_ERROR);
    }
  }
}



module.exports = new LamaranMagangController();
