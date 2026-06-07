const prisma = require('../../../helpers/db/db_connection');

class FaqRepository {
  async create(data) {
    return prisma.faq.create({
      data: data,
    });
  }

  async findAll() {
    return prisma.faq.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findById(id) {
    return prisma.faq.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async updateById(id, data) {
    return prisma.faq.update({
      where: { id: parseInt(id) },
      data: data,
    });
  }

  async deleteById(id) {
    return prisma.faq.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new FaqRepository();
