const bcrypt = require('bcrypt');
const adminService = require('../../admin/services/admin.service');
const { createToken } = require('../../../middleware/verifyJWT');
const { data, error } = require('../../../helpers/utils/wrapper');
const { UnauthorizedError, NotFoundError } = require('../../../helpers/error');

class AuthService {
  async login(email, password) {
    try {
      const result = await adminService.getAdminByEmail(email);
      if (result.err || !result.data) {
        return error(new UnauthorizedError('Email atau password tidak valid'));
      }

      const admin = result.data;

      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return error(new UnauthorizedError('Email atau password tidak valid'));
      }

      const token = createToken({
        id: admin.id.toString(),
        email: admin.email,
        role: admin.role,
        signature: admin.signature
      });

      return data({
        token,
        admin: {
          id: admin.id.toString(),
          nama_depan: admin.nama_depan,
          nama_belakang: admin.nama_belakang,
          email: admin.email,
          role: admin.role,
          signature: admin.signature,
        },
      });
    } catch (err) {
      return error(err);
    }
  }

  async getCurrentUser(userId) {
    try {
      const result = await adminService.getAdminById(userId);

      if (result.err) {
        return result;
      }

      const { password, ...adminWithoutPassword } = result.data;

      return data(adminWithoutPassword);
    } catch (err) {
      return error(new NotFoundError('Pengguna tidak ditemukan'));
    }
  }

  generateToken(payload) {
    try {
      const token = createToken(payload);
      return data(token);
    } catch (err) {
      return error(err);
    }
  }
}

module.exports = new AuthService();
