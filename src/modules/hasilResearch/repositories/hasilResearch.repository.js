const prisma = require('../../../helpers/db/db_connection');

class HasilResearchRepository {
  async create(researchData) {
    return prisma.hasilResearch.create({
      data: researchData,
    });
  }

  async findAll() {
    return prisma.hasilResearch.findMany();
  }

  async findById(id) {
    return prisma.hasilResearch.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async updateById(id, researchData) {
    return prisma.hasilResearch.update({
      where: { id: parseInt(id) },
      data: researchData,
    });
  }

  async deleteById(id) {
    return prisma.hasilResearch.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new HasilResearchRepository();
