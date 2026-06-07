const mahasiswaRepository = require('../repositories/mahasiswa.repository');
const { data, error } = require('../../../helpers/utils/wrapper');
const { BadRequestError, NotFoundError } = require('../../../helpers/error');
const { paginationData } = require("../../../helpers/utils/wrapper");

class MahasiswaService {
  async createMahasiswa(mahasiswaData) {
    try {
      const existingMahasiswa = await mahasiswaRepository.findByEmail(mahasiswaData.email);

      if (existingMahasiswa) {
        return error(new BadRequestError('Email Sudah Terdaftar'));
      }

      if (!mahasiswaData.role) {
        mahasiswaData.role = 'student';
      }

      const result = await mahasiswaRepository.create(mahasiswaData);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async getAllMahasiswa({ page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;

      const mahasiswa = await mahasiswaRepository.findAll({ offset, limit });

      if (!mahasiswa || mahasiswa.length === 0) {
        return error(new NotFoundError('Tidak ada mahasiswa ditemukan'));
      }

      const total = await mahasiswaRepository.countAllMahasiswa();
      const totalPages = Math.ceil(total / limit);
      const meta = { page: Number(page), limit: Number(limit), total, totalPages };
      return paginationData(mahasiswa, meta);
    } catch (err) {
      return error(err);
    }
  }

  async getMahasiswaById(id) {
    try {
      const mahasiswa = await mahasiswaRepository.findById(id);

      if (!mahasiswa) {
        return error(new NotFoundError('Mahasiswa Tidak Ditemukan'));
      }

      return data(mahasiswa);
    } catch (err) {
      return error(err);
    }
  }

  async getMahasiswaByEmail(email) {
    try {
      const mahasiswa = await mahasiswaRepository.findByEmail(email);

      if (!mahasiswa) {
        return error(new NotFoundError('Mahasiswa Tidak Ditemukan'));
      }

      return data(mahasiswa);
    } catch (err) {
      return error(err);
    }
  }

  async updateMahasiswa(id, mahasiswaData) {
    try {
      const checkResult = await this.getMahasiswaById(id);
      if (checkResult.err) {
        return checkResult;
      }

      if (mahasiswaData.email) {
        const existingMahasiswa = await mahasiswaRepository.findByEmail(mahasiswaData.email);

        if (existingMahasiswa && existingMahasiswa.id !== id) {
          return error(new BadRequestError('Email Sudah Terdaftar'));
        }
      }

      const result = await mahasiswaRepository.updateById(id, mahasiswaData);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async deleteMahasiswa(id) {
    try {
      const checkResult = await this.getMahasiswaById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const result = await mahasiswaRepository.deleteById(id);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async deleteAllMahasiswa() {
    try {
      const result = await mahasiswaRepository.deleteAll();
      return data(result);
    } catch (err) {
      return error(err);
    }
  }
}

module.exports = new MahasiswaService();
