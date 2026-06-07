const {
  NotFoundError,
  InternalServerError,
  BadRequestError,
  ConflictError,
  ExpectationFailedError,
  ForbiddenError,
  GatewayTimeoutError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError
} = require('../error');
const { ERROR: httpError } = require('../http-status/status_code');

const response = (res, type, result, message = '', code = 200) => {
  let status = true;
  let data = result?.data ?? null;

  if (type === 'fail') {
    status = false;
    data = null;
    message = result.err instanceof ValidationError ? result.err.errors : result.err?.message || message;
    code = checkErrorCode(result.err);
  }

  res.status(code).json({
    status,
    data,
    message,
    code,
  });
};

const paginationResponse = (res, type, result, message = '', code = 200) => {
  let status = true;
  let data = result?.data ?? null;
  let meta = result?.meta ?? null;
  if (type === 'fail') {
    status = false;
    data = '';
    message = result.err instanceof ValidationError ? { errors: result.err.errors } : result.err?.message || message;
    code = checkErrorCode(result.err);
  }

  console.log(typeof message)

  res.status(code).json({
    status: status,
    data,
    meta,
    message,
    code,
  });
}

const checkErrorCode = (error) => {
  switch (error.constructor) {
    case BadRequestError:
      return httpError.BAD_REQUEST;
    case ConflictError:
      return httpError.CONFLICT;
    case ExpectationFailedError:
      return httpError.EXPECTATION_FAILED;
    case ForbiddenError:
      return httpError.FORBIDDEN;
    case GatewayTimeoutError:
      return httpError.GATEWAY_TIMEOUT;
    case InternalServerError:
      return httpError.INTERNAL_ERROR;
    case NotFoundError:
      return httpError.NOT_FOUND;
    case ServiceUnavailableError:
      return httpError.SERVICE_UNAVAILABLE;
    case UnauthorizedError:
      return httpError.UNAUTHORIZED;
    case ValidationError:
      return httpError.BAD_REQUEST;
    default:
      return httpError.INTERNAL_ERROR;
  }
};

const data = (data) => ({ err: null, data });

const paginationData = (data, meta) => ({ err: null, data, meta });

const error = (err) => ({ err, data: null });

module.exports = {
  data,
  paginationData,
  error,
  response,
  paginationResponse
};