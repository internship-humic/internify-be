const prisma = require('../../../helpers/db/db_connection');


class LowonganMagangRepository {
  async create(lowonganData) {
    return prisma.lowonganMagang.create({
      data: lowonganData,
    });
  }

  async findAll() {
    return prisma.lowonganMagang.findMany({
      include: {
        batch: {
          select: {
            id: true,
            batch_number: true,
            is_active: true,
          },
        },
      },
    });
  }

  async findById(id) {
    return prisma.lowonganMagang.findUnique({
      where: { id: id },
      include: {
        batch: {
          select: {
            id: true,
            batch_number: true,
            is_active: true,
          },
        },
      },
    });
  }

  async findByKelompokPeminatan(kelompok_peminatan) {
    return prisma.lowonganMagang.findMany({
      where: { kelompok_peminatan },
      include: {
        batch: {
          select: {
            id: true,
            batch_number: true,
            is_active: true,
          },
        },
      },
    });
  }

  async findAllKelompokPeminatan() {
    return prisma.lowonganMagang.findMany({
      select: {
        kelompok_peminatan: true,
      },
      distinct: ['kelompok_peminatan'],
    });
  }

  async updateById(id, lowonganData) {
    return prisma.lowonganMagang.update({
      where: { id: id },
      data: lowonganData,
    });
  }

  async deleteById(id) {
    return prisma.lowonganMagang.delete({
      where: { id: id },
    });
  }
}

module.exports = new LowonganMagangRepository();
