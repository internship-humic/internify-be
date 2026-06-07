const prisma = require('../../../helpers/db/db_connection');

class MahasiswaRepository {
  async create(mahasiswaData) {
    return prisma.mahasiswa.create({
      data: mahasiswaData,
    });
  }

  async findAll({ offset, limit }) {
    return prisma.mahasiswa.findMany({
      skip: offset,
      take: limit,
    });
  }

  async findById(id) {
    return prisma.mahasiswa.findUnique({
      where: { id: parseInt(id) },
      include: {
        lamaran_magang: {
          include: {
            lowongan_magang: {
              select: {
                posisi: true,
                kelompok_peminatan: true,
                durasi_awal: true,
                durasi_akhir: true,
              },
            },
          },
        },
      },
    });
  }

  async findByEmail(email) {
    return prisma.mahasiswa.findUnique({
      where: { email },
    });
  }

  async updateById(id, mahasiswaData) {
    return prisma.mahasiswa.update({
      where: { id: parseInt(id) },
      data: mahasiswaData,
    });
  }

  async deleteById(id) {
    return prisma.mahasiswa.delete({
      where: { id: parseInt(id) },
    });
  }

  async deleteAll() {
    return prisma.mahasiswa.deleteMany();
  }

  async countAllMahasiswa() {
    return prisma.mahasiswa.count();
  }
}

module.exports = new MahasiswaRepository();
