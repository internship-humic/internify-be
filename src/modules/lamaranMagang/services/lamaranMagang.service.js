const lamaranMagangRepository = require('../repositories/lamaranMagang.repository');
const mahasiswaRepository = require('../../mahasiswa/repositories/mahasiswa.repository');
const lowonganMagangRepository = require('../../lowonganMagang/repositories/lowonganMagang.repository');
const batchRepository = require('../../batch/repositories/batch.repository');
const imageUploadHelper = require('../../../helpers/utils/imageUpload.helper');
const { sendConfirmationEmail, sendStatusEmail } = require('../helpers/email.helper');
const ExcelJS = require('exceljs');
const path = require('path');
const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
const { data, error, paginationData } = require('../../../helpers/utils/wrapper');
const { NotFoundError, ConflictError } = require('../../../helpers/error');

class LamaranMagangService {
  async createLamaranMagang(id_lowongan_magang, mahasiswaFormData, uploadedFiles) {
    try {
      const lowonganMagang = await lowonganMagangRepository.findById(id_lowongan_magang);

      if (!lowonganMagang) {
        return error(new NotFoundError('Lowongan Magang Tidak Ditemukan'));
      }

      const batchId = lowonganMagang.batch?.id || null;

      const existingMahasiswa = await mahasiswaRepository.findByEmail(mahasiswaFormData.email);

      if (existingMahasiswa) {

        const existingLamaran = await lamaranMagangRepository.findAnyLamaranByMahasiswa(
          existingMahasiswa.id
        );

        if (existingLamaran) {
          const posisiYangSudahDilamar = existingLamaran.lowongan_magang?.posisi || 'posisi tertentu';
          return error(new ConflictError(
            `Anda sudah pernah melamar untuk posisi ${posisiYangSudahDilamar}. Setiap pengguna hanya dapat melamar satu posisi.`
          ));
        }

        const lamaranData = {
          id_mahasiswa: existingMahasiswa.id,
          id_lowongan_magang,
          batch: batchId,
          status: 'diproses',
        };

        await lamaranMagangRepository.create(lamaranData);

        return data({
          id_mahasiswa: existingMahasiswa.id,
          id_lowongan_magang,
          batch: batchId,
          status: 'diproses',
        });
      }

      const cv_path = imageUploadHelper.uploadCV(uploadedFiles.cv);
      const portofolio_path = imageUploadHelper.uploadPortofolio(uploadedFiles.portofolio);

      const namaBelakangFinal = mahasiswaFormData.nama_belakang?.trim() || null;

      const mahasiswaData = {
        nama_depan: mahasiswaFormData.nama_depan,
        nama_belakang: namaBelakangFinal,
        email: mahasiswaFormData.email,
        kontak: mahasiswaFormData.kontak,
        jurusan: mahasiswaFormData.jurusan,
        universitas: mahasiswaFormData.universitas,
        negara: mahasiswaFormData.negara,
        motivasi: mahasiswaFormData.motivasi,
        relevant_skills: mahasiswaFormData.relevant_skills,
        role: 'student',
        cv_path,
        portofolio_path,
      };

      const createdMahasiswa = await mahasiswaRepository.create(mahasiswaData);
      const id_mahasiswa = createdMahasiswa.id;

      const lamaranData = {
        id_mahasiswa,
        id_lowongan_magang,
        batch: batchId,
        status: 'diproses',
      };

      await lamaranMagangRepository.create(lamaranData);

      await sendConfirmationEmail(mahasiswaData, lowonganMagang);

      return data({
        id_mahasiswa,
        id_lowongan_magang,
        batch: batchId,
        status: 'diproses',
      });
    } catch (err) {
      return error(err);
    }
  }

  async getAllLamaranMagang(query = {}) {
    try {
      const { page = 1, limit = 10, posisi, status, universitas, id_lowongan } = query;
      const offset = (page - 1) * limit;
      const lamaranList = await lamaranMagangRepository.findAll({ offset, limit, status, posisi, universitas, id_lowongan });
      const total = await lamaranMagangRepository.countAllLamaran({ status, posisi, universitas, id_lowongan });

      const totalPages = Math.ceil(total / limit);
      const meta = { page: Number(page), limit: Number(limit), total, totalPages };
      return paginationData(lamaranList, meta);
    } catch (err) {
      return error(err);
    }
  }

  async getLamaranById(id_lamaran_magang) {
    try {
      const lamaran = await lamaranMagangRepository.findById(id_lamaran_magang);

      if (!lamaran) {
        return error(new NotFoundError('Lamaran Magang Tidak Ditemukan'));
      }

      return data(lamaran);
    } catch (err) {
      return error(err);
    }
  }

  async getDetailLamaranById(id_lamaran) {
    try {
      const lamaran = await lamaranMagangRepository.findDetailById(id_lamaran);

      if (!lamaran) {
        return error(new NotFoundError('Lamaran Magang Tidak Ditemukan'));
      }

      return data(lamaran);
    } catch (err) {
      return error(err);
    }
  }

  async updateLamaranStatus(id_lamaran_magang, status) {
    try {
      const checkResult = await this.getDetailLamaranById(id_lamaran_magang);

      if (checkResult.err) {
        return checkResult;
      }

      const result = await lamaranMagangRepository.updateStatus(id_lamaran_magang, status);

      await sendStatusEmail(checkResult.data, status);

      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async deleteLamaran(id) {
    try {
      const checkResult = await this.getDetailLamaranById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const lamaran = checkResult.data;

      if (lamaran.cv_path) {
        const cvFileName = path.basename(lamaran.cv_path);
        await deleteFileIfExists(cvFileName);
      }

      if (lamaran.portofolio_path) {
        const portofolioFileName = path.basename(lamaran.portofolio_path);
        await deleteFileIfExists(portofolioFileName);
      }

      const result = await lamaranMagangRepository.deleteById(id);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async exportToExcel() {
    try {
      const lamaranList = await lamaranMagangRepository.findAll({});

      if (!lamaranList || lamaranList.length === 0) {
        return error(new NotFoundError("Tidak ada data lamaran untuk diekspor"));
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Lamaran Magang');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nama Depan', key: 'nama_depan', width: 20 },
        { header: 'Nama Belakang', key: 'nama_belakang', width: 20 },
        { header: 'Posisi', key: 'posisi', width: 25 },
        { header: 'Kelompok Peminatan', key: 'kelompok_peminatan', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Tanggal Dibuat', key: 'created_at', width: 20 },
      ];

      lamaranList.forEach((lamaran) => {
        worksheet.addRow({
          id: lamaran.id,
          nama_depan: lamaran.mahasiswa?.nama_depan || '',
          nama_belakang: lamaran.mahasiswa?.nama_belakang || '',
          posisi: lamaran.lowongan_magang?.posisi || '',
          kelompok_peminatan: lamaran.lowongan_magang?.kelompok_peminatan || '',
          status: lamaran.status,
          created_at: lamaran.created_at,
        });
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };

      return data(workbook);
    } catch (err) {
      return error(err);
    }
  }

  async getDashboardStatistics(query) {
    try {
      const batch = await batchRepository.getBatchById(query.batch);
      const batchDisplay = batch ? batch.batch_number : 'Data Seluruh Batch';
      const stats = await lamaranMagangRepository.getStatistics({ query });

      const acceptanceRate = stats.total > 0 ? ((stats.diterima / stats.total) * 100).toFixed(1) : 0;
      const rejectionRate = stats.total > 0 ? ((stats.ditolak / stats.total) * 100).toFixed(1) : 0;
      const pendingRate = stats.total > 0 ? ((stats.diproses / stats.total) * 100).toFixed(1) : 0;

      if (stats.total === 0) {
        return error(new NotFoundError(`Tidak ada data lamaran ditemukan pada batch ${batchDisplay}`));
      }

      return data({
        total_pendaftar: stats.total,
        total_diterima: stats.diterima,
        total_ditolak: stats.ditolak,
        sedang_diproses: stats.diproses,
        presentase_diterima: `${acceptanceRate}%`,
        presentase_ditolak: `${rejectionRate}%`,
        presentase_diproses: `${pendingRate}%`,
        batch: batchDisplay,
      });
    } catch (err) {
      return error(err);
    }
  }

  async getStatisticsByPosition(query) {
    try {
      const batch = await batchRepository.getBatchById(query.batch);
      const batchDisplay = batch ? batch.batch_number : 'semua batch';
      const positions = await lamaranMagangRepository.getStatisticsByPosition({ query });

      if (positions.length === 0) {
        return error(new NotFoundError(`Tidak ada data lamaran ditemukan pada batch ${batchDisplay}`));
      }

      return data(positions);
    } catch (err) {
      return error(err);
    }
  }

  async getStatisticsByCountry(query) {
    try {
      const batch = await batchRepository.getBatchById(query.batch);
      const batchDisplay = batch ? batch.batch_number : 'semua batch';
      const countries = await lamaranMagangRepository.getStatisticsByCountry({ query });
      if (countries.length === 0) {
        return error(new NotFoundError(`Tidak ada data lamaran ditemukan pada batch ${batchDisplay}`));
      }

      return data(countries);
    } catch (err) {
      return error(err);
    }
  }

  async getStatisticsByUniversity(query) {
    try {
      const batch = await batchRepository.getBatchById(query.batch);
      const batchDisplay = batch ? batch.batch_number : 'semua batch';
      const universities = await lamaranMagangRepository.getStatisticsByUniversity({ query });
      if (universities.length === 0) {
        return error(new NotFoundError(`Tidak ada data lamaran ditemukan pada batch ${batchDisplay}`));
      }
      return data(universities);
    } catch (err) {
      return error(err);
    }
  }
}



module.exports = new LamaranMagangService();
