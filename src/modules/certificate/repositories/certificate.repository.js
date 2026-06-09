const prisma = require('../../../helpers/db/db_connection');

class CertificateRepository {
  async create(certificateData) {
    return prisma.certificate.create({
      data: certificateData,
      include: this.certificateDetailInclude(),
    });
  }

  async findById(id) {
    return prisma.certificate.findUnique({
      where: { id: parseInt(id) },
      include: this.certificateDetailInclude(),
    });
  }

  async findByUserAndProject(id_user, id_project) {
    return prisma.certificate.findUnique({
      where: {
        id_project_id_user: {
          id_project: parseInt(id_project),
          id_user: parseInt(id_user),
        },
      },
      include: this.certificateDetailInclude(),
    });
  }

  async findUserCertificates(id_user) {
    return prisma.certificate.findMany({
      where: { id_user: parseInt(id_user) },
      include: this.certificateDetailInclude(),
      orderBy: { issued_at: 'desc' },
    });
  }

  async findProjectCertificates(id_project) {
    return prisma.certificate.findMany({
      where: { id_project: parseInt(id_project) },
      include: this.certificateDetailInclude(),
      orderBy: { issued_at: 'desc' },
    });
  }

  async findAll() {
    return prisma.certificate.findMany({
      include: this.certificateDetailInclude(),
      orderBy: { issued_at: 'desc' },
    });
  }

  async findByCertificateNo(certificate_no) {
    return prisma.certificate.findUnique({
      where: { certificate_no },
      include: this.certificateDetailInclude(),
    });
  }

  async findByUuid(uuid) {
    return prisma.certificate.findUnique({
      where: { uuid },
      include: this.certificateDetailInclude(),
    });
  }

  async getProjectTasksAndSubmissions(id_project, id_user) {
    return prisma.project.findUnique({
      where: { id: parseInt(id_project) },
      select: {
        id: true,
        project_name: true,
        tasks: {
          select: {
            id: true,
            submissions: {
              where: { id_user: parseInt(id_user) },
              select: {
                id: true,
                submitted_at: true,
              },
            },
          },
        },
        members: {
          where: {
            id_user: parseInt(id_user),
            status: 'active',
          },
          select: {
            id: true,
          },
        },
      },
    });
  }

  certificateDetailInclude() {
    return {
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          project_name: true,
          description: true,
        },
      },
    };
  }
}

module.exports = new CertificateRepository();
