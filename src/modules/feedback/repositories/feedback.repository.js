const prisma = require('../../../helpers/db/db_connection');

class FeedbackRepository {
  async create(feedbackData) {
    return prisma.feedback.create({
      data: {
        ...feedbackData,
        created_at: new Date(),
      },
    });
  }

  async findAll() {
    return prisma.feedback.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findAllWithFilters({ batch, tahun }) {
    const where = {};

    if (batch) {
      where.batch = parseInt(batch);
    }

    if (tahun) {
      where.tahun = parseInt(tahun);
    }

    return prisma.feedback.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findById(id) {
    return prisma.feedback.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async updateById(id, feedbackData) {
    return prisma.feedback.update({
      where: { id: parseInt(id) },
      data: feedbackData,
    });
  }

  async deleteById(id) {
    return prisma.feedback.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new FeedbackRepository();
