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

  async findProjectsByIntern(internId) {
    return prisma.project.findMany({
      where: {
        members: {
          some: {
            id_user: parseInt(internId),
            status: "active",
          },
        },
      },
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

  async findTasksByIntern(internId) {
    return prisma.task.findMany({
      where: {
        project: {
          members: {
            some: {
              id_user: parseInt(internId),
              status: "active",
            },
          },
        },
      },
      orderBy: {
        deadline_at: "asc",
      },
      include: {
        project: {
          select: {
            id: true,
            project_name: true,
            project_icon: true,
          },
        },
        submissions: {
          where: {
            id_user: parseInt(internId),
          },
          select: {
            id: true,
            file_path: true,
            url_link: true,
            submitted_at: true,
            updated_at: true,
          },
        },
      },
    });
  }

  async findProjectsByMentor(adminId) {
    return prisma.project.findMany({
      where: {
        id_admin: parseInt(adminId),
      },
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

  async findActiveInternsWithProjects() {
    return prisma.user.findMany({
      where: {
        role: "intern",
        is_active: true,
      },
      include: {
        project_members: {
          where: {
            status: "active",
          },
          include: {
            project: {
              select: {
                id: true,
                project_name: true,
              },
            },
          },
        },
        lamaran_magang: {
          include: {
            lowongan_magang: {
              select: {
                posisi: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async assignMember(id_project, id_user) {
    return prisma.projectMember.create({
      data: {
        id_project: parseInt(id_project),
        id_user: parseInt(id_user),
        status: "active",
      },
    });
  }

  async findUserByIdAndActive(id) {
    return prisma.user.findFirst({
      where: {
        id: parseInt(id),
        is_active: true,
      },
    });
  }

  async findMembership(idProject, idUser) {
    return prisma.projectMember.findFirst({
      where: {
        id_project: parseInt(idProject),
        id_user: parseInt(idUser),
      },
    });
  }

  async updateMembershipStatus(id, status) {
    return prisma.projectMember.update({
      where: { id: parseInt(id) },
      data: { status },
    });
  }

  async findActiveMembershipsByUserIds(userIds) {
    return prisma.projectMember.findMany({
      where: {
        id_user: {
          in: userIds.map((id) => parseInt(id)),
        },
        status: "active",
      },
      include: {
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
          },
        },
      },
    });
  }
}

module.exports = new ProjectRepository();
