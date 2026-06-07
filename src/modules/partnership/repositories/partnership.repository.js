const prisma = require('../../../helpers/db/db_connection');

class PartnershipRepository {
  async create(partnershipData) {
    return prisma.partnership.create({
      data: partnershipData,
    });
  }

  async findAll() {
    return prisma.partnership.findMany();
  }

  async findById(id) {
    return prisma.partnership.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async updateById(id, partnershipData) {
    return prisma.partnership.update({
      where: { id: parseInt(id) },
      data: partnershipData,
    });
  }

  async deleteById(id) {
    return prisma.partnership.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new PartnershipRepository();
