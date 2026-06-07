const prisma = require("../../../helpers/db/db_connection");

class ProjectRepository {
  async findAdminById(id) {
    return prisma.admin.findUnique({
      where: {
        id: parseInt(id),
      },
    });
  }

  async findUsersByEmails(emails) {
    return prisma.user.findMany({
      where: {
        email: {
          in: emails,
        },
        is_active: true,
      },
      include: {
        lamaran_magang: {
          include: {
            lowongan_magang: {
              select: {
                posisi: true,
                kelompok_peminatan: true,
              },
            },
          },
        },
      },
    });
  }

  async createWithMembers(projectData, userIds = []) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: projectData,
      });

      if (userIds.length > 0) {
        await tx.projectMember.createMany({
          data: userIds.map((id_user) => ({
            id_project: project.id,
            id_user,
            status: "active",
          })),
          skipDuplicates: true,
        });
      }

      return tx.project.findUnique({
        where: {
          id: project.id,
        },
        include: this.projectDetailInclude(),
      });
    });
  }

  async findAll({ status, actor }) {
    const where = {};

    if (status) {
      where.status = status;
    }

    if (actor?.role === "intern") {
      where.members = {
        some: {
          id_user: parseInt(actor.id),
          status: "active",
        },
      };
    }

    return prisma.project.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      include: {
        admin: {
          select: {
            id: true,
            nama_depan: true,
            nama_belakang: true,
            email: true,
            profile_picture: true,
            professional_bio: true,
          },
        },
        members: {
          where: {
            status: "active",
          },
          select: {
            id: true,
          },
        },
        tasks: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findById(id) {
    return prisma.project.findUnique({
      where: {
        id: parseInt(id),
      },
      include: this.projectDetailInclude(),
    });
  }

  async updateById(id, projectData) {
    return prisma.project.update({
      where: {
        id: parseInt(id),
      },
      data: projectData,
      include: this.projectDetailInclude(),
    });
  }

  async archiveById(id) {
    return prisma.project.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: "archived",
      },
      include: this.projectDetailInclude(),
    });
  }

  async checkActiveMember(idProject, idUser) {
    return prisma.projectMember.findFirst({
      where: {
        id_project: parseInt(idProject),
        id_user: parseInt(idUser),
        status: "active",
      },
    });
  }

  projectDetailInclude() {
    return {
      admin: {
        select: {
          id: true,
          nama_depan: true,
          nama_belakang: true,
          email: true,
          profile_picture: true,
          professional_bio: true,
        },
      },
      members: {
        where: {
          status: "active",
        },
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              professional_bio: true,
              is_active: true,
              lamaran_magang: {
                select: {
                  id: true,
                  lowongan_magang: {
                    select: {
                      posisi: true,
                      kelompok_peminatan: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          description: true,
          deadline_at: true,
          submission_type: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: {
          deadline_at: "asc",
        },
      },
    };
  }
}

module.exports = new ProjectRepository();
