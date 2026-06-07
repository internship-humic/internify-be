const prisma = require('../../../helpers/db/db_connection');
const { Prisma } = require('../../../generated/prisma')

class LamaranMagangRepository {
  async create(lamaranData) {
    return prisma.lamaranMagang.create({
      data: {
        ...lamaranData,
        created_at: new Date(),
        update_at: new Date(),
      },
    });
  }

  async findAll({ offset, limit, status, posisi, universitas, id_lowongan }) {
    const where = {};

    if (status) {
      where.status = status;
    }
    if (posisi) {
      where.lowongan_magang = { posisi: posisi };
    }
    if (universitas) {
      where.mahasiswa = { universitas: universitas };
    }
    if (id_lowongan) {
      where.id_lowongan_magang = id_lowongan;
    }

    const lamaranList = await prisma.lamaranMagang.findMany({
      skip: offset,
      take: limit,
      where,
      include: {
        mahasiswa: {
          select: { nama_depan: true, nama_belakang: true },
        },
        lowongan_magang: {
          select: { posisi: true, kelompok_peminatan: true },
        },
        batch_data: {
          select: {
            id: true,
            batch_number: true,
            is_active: true,
          }
        }
      },
    });

    return lamaranList;
  }

  async countAllLamaran({ status, posisi, universitas }) {

    const where = {};

    if (status) {
      where.status = status;
    }
    if (posisi) {
      where.lowongan_magang = { posisi: posisi };
    }
    if (universitas) {
      where.mahasiswa = { universitas: universitas };
    }

    return prisma.lamaranMagang.count(
      { where }
    );
  }

  async findById(id_lamaran_magang) {
    return prisma.lamaranMagang.findUnique({
      where: { id: parseInt(id_lamaran_magang) },
      include: {
        mahasiswa: {
          select: {
            nama_depan: true,
            nama_belakang: true,
            email: true,
            kontak: true,
            jurusan: true,
            cv_path: true,
            portofolio_path: true,
            motivasi: true,
            relevant_skills: true,
            universitas: true,
            negara: true,
          },
        },
        lowongan_magang: {
          select: {
            posisi: true,
          },
        },
        batch_data: {
          select: {
            id: true,
            batch_number: true,
            is_active: true,
          }
        }
      },
    });
  }

  async findByMahasiswaAndLowongan(id_mahasiswa, id_lowongan_magang) {
    return prisma.lamaranMagang.findFirst({
      where: {
        id_mahasiswa: parseInt(id_mahasiswa),
        id_lowongan_magang: id_lowongan_magang,
      },
    });
  }

  async findAnyLamaranByMahasiswa(id_mahasiswa) {
    return prisma.lamaranMagang.findFirst({
      where: {
        id_mahasiswa: parseInt(id_mahasiswa),
      },
      include: {
        lowongan_magang: {
          select: {
            posisi: true,
          },
        },
      },
    });
  }

  async findDetailById(idLamaran) {
    return prisma.lamaranMagang.findUnique({
      where: { id: parseInt(idLamaran) },
      include: {
        mahasiswa: true,
        lowongan_magang: true,
        batch_data: {
          select: {
            id: true,
            batch_number: true,
            is_active: true,
          }
        }
      },
    });
  }

  async updateStatus(id_lamaran_magang, status) {
    return prisma.lamaranMagang.update({
      where: { id: parseInt(id_lamaran_magang) },
      data: {
        status,
        update_at: new Date(),
      },
    });
  }

  async deleteById(id) {
    return prisma.lamaranMagang.delete({
      where: { id: parseInt(id) },
    });
  }

  async getStatistics({ query }) {
    let where = {};

    if (query && query.batch) {
      where.batch = parseInt(query.batch);
    }

    const [total, diterima, ditolak, diproses] = await Promise.all([
      prisma.lamaranMagang.count({ where }),
      prisma.lamaranMagang.count({ where: { ...where, status: 'diterima' } }),
      prisma.lamaranMagang.count({ where: { ...where, status: 'ditolak' } }),
      prisma.lamaranMagang.count({ where: { ...where, status: 'diproses' } }),
    ]);

    return { total, diterima, ditolak, diproses };
  }

  async getStatisticsByPosition({ query }) {
    let where = {};

    if (query && query.batch) {
      where.batch = parseInt(query.batch);
    }

    const data = await prisma.lamaranMagang.groupBy({
      by: ['id_lowongan_magang'],
      where,
      _count: {
        id: true,
      },
    });

    const positions = await Promise.all(
      data.map(async (item) => {
        const lowongan = await prisma.lowonganMagang.findUnique({
          where: { id: item.id_lowongan_magang },
          select: { posisi: true },
        });

        const [total, diterima, ditolak, diproses] = await Promise.all([
          prisma.lamaranMagang.count({
            where: { id_lowongan_magang: item.id_lowongan_magang },
          }),
          prisma.lamaranMagang.count({
            where: { id_lowongan_magang: item.id_lowongan_magang, status: 'diterima' },
          }),
          prisma.lamaranMagang.count({
            where: { id_lowongan_magang: item.id_lowongan_magang, status: 'ditolak' },
          }),
          prisma.lamaranMagang.count({
            where: { id_lowongan_magang: item.id_lowongan_magang, status: 'diproses' },
          }),
        ]);

        return {
          posisi: lowongan?.posisi || 'Tidak Diketahui',
          total,
          diterima,
          ditolak,
          diproses,
        };
      })
    );

    return positions;
  }

  async getStatisticsByCountry({ query }) {

    // Note : Menggunakan Raw Query karena Prisma ngga dukung join yang kompleks (lebih mudah juga :b)
    const whereClause = query.batch
      ? Prisma.sql`WHERE lm.batch = ${parseInt(query.batch)}`
      : Prisma.sql``;

    const data = await prisma.$queryRaw`
      SELECT 
        m.negara,
        COUNT(*) as total,
        SUM(lm.status = 'diterima') as diterima,
        SUM(lm.status = 'ditolak') as ditolak,
        SUM(lm.status = 'diproses') as diproses
    FROM lamaran_magang lm
    JOIN mahasiswa m ON lm.id_mahasiswa = m.id
    ${whereClause}
    GROUP BY m.negara
    ORDER BY total DESC
`;

    return data.map((item) => ({
      negara: item.negara,
      total: Number(item.total),
      diterima: Number(item.diterima),
      ditolak: Number(item.ditolak),
      diproses: Number(item.diproses),
    }));
  }

  async getStatisticsByUniversity({ query }) {
    const whereClause = query.batch
      ? Prisma.sql`WHERE lm.batch = ${parseInt(query.batch)}`
      : Prisma.sql``;

    const data = await prisma.$queryRaw`
      SELECT 
        m.universitas,
        COUNT(*) as total,
        SUM(lm.status = 'diterima') as diterima,
        SUM(lm.status = 'ditolak') as ditolak,
        SUM(lm.status = 'diproses') as diproses
    FROM lamaran_magang lm
    JOIN mahasiswa m ON lm.id_mahasiswa = m.id
    ${whereClause}
    GROUP BY m.universitas
    ORDER BY total DESC
`;

    return data.map((item) => ({
      universitas: item.universitas,
      total: Number(item.total),
      diterima: Number(item.diterima),
      ditolak: Number(item.ditolak),
      diproses: Number(item.diproses),
    }));
  }
}

module.exports = new LamaranMagangRepository();
