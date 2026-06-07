const prisma = require('../../../helpers/db/db_connection');

class AdminRepository {
  async create(adminData) {
    return prisma.admin.create({
      data: adminData
    });
  }

  async findAll() {
    return prisma.admin.findMany();
  }

  async findByEmail(email) {
    return prisma.admin.findUnique({
      where: { email }
    });
  }

  async findById(id) {
    return prisma.admin.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async updateById(id, adminData) {
    return prisma.admin.update({
      where: { id: parseInt(id) },
      data: adminData
    });
  }

  async deleteById(id) {
    return prisma.admin.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new AdminRepository();
