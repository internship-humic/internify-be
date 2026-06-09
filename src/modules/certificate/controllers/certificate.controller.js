const certificateService = require('../services/certificate.service');
const { response, error } = require('../../../helpers/utils/wrapper');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { InternalServerError } = require('../../../helpers/error');
const { isValidPayload } = require('../../../helpers/utils/validator');
const { claimCertificateModel } = require('../models/certificate.model');

const getActor = (req) => ({
  id: req.id,
  role: req.role,
  email: req.email,
});

class CertificateController {
  async claimCertificate(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, claimCertificateModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Data claim certificate tidak valid',
          ERROR.EXPECTATION_FAILED
        );
      }

      const actor = getActor(req);
      const result = await certificateService.claimCertificate(validatePayload.data, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Certificate claimed successfully', SUCCESS.CREATED);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async getMyCertificates(req, res) {
    try {
      const actor = getActor(req);
      const result = await certificateService.getMyCertificates(actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Certificates retrieved successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async getCertificateDetail(req, res) {
    try {
      const { id } = req.params;
      const actor = getActor(req);
      const result = await certificateService.getCertificateDetail(id, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Certificate details retrieved successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async getProjectCertificates(req, res) {
    try {
      const { id_project } = req.params;
      const actor = getActor(req);
      const result = await certificateService.getProjectCertificates(id_project, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Project certificates retrieved successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async getAllCertificates(req, res) {
    try {
      const actor = getActor(req);
      const result = await certificateService.getAllCertificates(actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'All certificates retrieved successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async verifyCertificate(req, res) {
    try {
      const certificate_no = req.query.certificate_no || req.params.certificate_no;
      const result = await certificateService.verifyCertificate(certificate_no);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Certificate validated successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async verifyCertificateByUuid(req, res) {
    try {
      const { uuid } = req.params;
      const result = await certificateService.verifyCertificateByUuid(uuid);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Certificate validated successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }
}

module.exports = new CertificateController();
