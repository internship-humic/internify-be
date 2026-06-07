const prisma = require('../../../helpers/db/db_connection');

class BatchRepository {
  async create(batchData) {
    return prisma.batch.create({
      data: batchData,
    });
  }

  async findAll() {
    return prisma.batch.findMany({
      orderBy: {
        batch_number: 'desc',
      },
    });
  }

  async findById(id) {
    return prisma.batch.findUnique({
      where: { id: id },
    });
  }

  async findByBatchNumber(batch_number) {
    return prisma.batch.findUnique({
      where: { batch_number: batch_number },
    });
  }

  async findActiveBatch() {
    return prisma.batch.findFirst({
      where: { is_active: true },
    });
  }

  async findLatestBatch() {
    return prisma.batch.findFirst({
      orderBy: {
        batch_number: 'desc',
      },
    });
  }

  async updateById(id, batchData) {
    return prisma.batch.update({
      where: { id: id },
      data: batchData,
    });
  }

  async deleteById(id) {
    return prisma.batch.delete({
      where: { id: id },
    });
  }

  async deactivateAllBatches() {
    return prisma.batch.updateMany({
      data: { is_active: false },
    });
  }

  async countBatches() {
    return prisma.batch.count();
  }

  async findByStatus(is_active) {
    return prisma.batch.findMany({
      where: { is_active: is_active },
      orderBy: {
        batch_number: 'desc',
      },
    });
  }

  async getBatchById(batchId) {
    if (!batchId) {
      return null;
    }

    return this.findById(parseInt(batchId));
  }
}

module.exports = new BatchRepository();
