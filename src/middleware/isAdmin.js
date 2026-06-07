const { UnauthorizedError } = require('../helpers/error')
const { response } = require('../helpers/utils/wrapper');
const { ERROR } = require('../helpers/http-status/status_code');

module.exports = function isAdmin(req, res, next) {
  if (req.role && req.role === 'admin') {
    return next();
  }

  return response(res, 'fail', new UnauthorizedError('Akses ditolak: Hanya admin yang dapat mengakses ini'), 'Akses ditolak: Hanya admin yang dapat mengakses ini', ERROR.UNAUTHORIZED);
}