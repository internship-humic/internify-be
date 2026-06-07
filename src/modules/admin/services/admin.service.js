const bcrypt = require('bcrypt');
const adminRepository = require('../repositories/admin.repository');
const { data, error } = require('../../../helpers/utils/wrapper');
const { BadRequestError, NotFoundError } = require('../../../helpers/error');

class AdminService {
  async createAdmin(adminData) {
    try {
      const { nama_depan, nama_belakang, email, password, role } = adminData;

      const existingAdmin = await adminRepository.findByEmail(email);

      if (existingAdmin) {
        return error(new BadRequestError('Email sudah terdaftar'));
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newAdminData = {
        nama_depan,
        nama_belakang,
        email,
        password: hashedPassword,
        role,
        signature: `${nama_depan}-${Date.now()}`,
      };

      await adminRepository.create(newAdminData);
      return data();
    } catch (err) {
      return error(err);
    }
  }

  async getAllAdmins() {
    try {
      const admins = await adminRepository.findAll();
      if (!admins || admins.length === 0) {
        return error(new NotFoundError('Tidak ada admin ditemukan'));
      }
      return data(admins);
    } catch (err) {
      return error(err);
    }
  }

  async getAdminById(id) {
    try {
      const admin = await adminRepository.findById(id);
      if (!admin) {
        return error(new NotFoundError('Admin tidak ditemukan'));
      }
      return data(admin);
    } catch (err) {
      return error(err);
    }
  }

  async getAdminByEmail(email) {
    try {
      const admin = await adminRepository.findByEmail(email);
      return data(admin);
    } catch (err) {
      return error(err);
    }
  }

  async verifyPassword(plainPassword, hashedPassword) {
    try {
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      return data(isValid);
    } catch (err) {
      return error(err);
    }
  }

  async updateAdmin(id, adminData) {
    try {
      const adminResult = await this.getAdminById(id);
      if (adminResult.err) {
        return adminResult;
      }

      if (adminData.email) {
        const existingAdmin = await adminRepository.findByEmail(adminData.email);
        if (existingAdmin && existingAdmin.id !== id) {
          return error(new BadRequestError('Email sudah terdaftar'));
        }
      }

      await adminRepository.updateById(id, adminData);
      return data();
    } catch (err) {
      return error(err);
    }
  }

  async deleteAdmin(id) {
    try {
      const adminResult = await this.getAdminById(id);
      if (adminResult.err) {
        return adminResult;
      }

      await adminRepository.deleteById(id);
      return data();
    } catch (err) {
      return error(err);
    }
  }
}

module.exports = new AdminService();
