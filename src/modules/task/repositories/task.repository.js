const prisma = require('../../../helpers/db/db_connection');

class TaskRepository {
  async findProjectById(idProject) {
    return prisma.project.findUnique({
      where: {
        id: parseInt(idProject),
      },
      include: {
        members: {
          where: {
            status: 'active',
          },
          select: {
            id: true,
            id_user: true,
          },
        },
      },
    });
  }

  async createTask(taskData) {
    return prisma.task.create({
      data: taskData,
    });
  }

  async findTasksByProject(idProject) {
    return prisma.task.findMany({
      where: {
        id_project: parseInt(idProject),
      },
      orderBy: {
        deadline_at: 'asc',
      },
      include: {
        submissions: {
          select: {
            id: true,
            id_task: true,
            id_user: true,
            file_path: true,
            url_link: true,
            submitted_at: true,
            updated_at: true,
          },
        },
      },
    });
  }

  async findTaskById(idTask) {
    return prisma.task.findUnique({
      where: {
        id: parseInt(idTask),
      },
      include: {
        project: {
          select: {
            id: true,
            project_name: true,
            project_icon: true,
            members: {
              where: {
                status: 'active',
              },
              include: {
                user: {
                  select: {
                    id: true,
                    full_name: true,
                    email: true,
                    professional_bio: true,
                  },
                },
              },
            },
          },
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                email: true,
                professional_bio: true,
              },
            },
          },
        },
      },
    });
  }

  async updateTask(idTask, taskData) {
    return prisma.task.update({
      where: {
        id: parseInt(idTask),
      },
      data: taskData,
    });
  }

  async deleteTask(idTask) {
    return prisma.task.delete({
      where: {
        id: parseInt(idTask),
      },
    });
  }

  async countSubmissionsByTask(idTask) {
    return prisma.taskSubmission.count({
      where: {
        id_task: parseInt(idTask),
      },
    });
  }

  async checkActiveProjectMember(idProject, idUser) {
    return prisma.projectMember.findFirst({
      where: {
        id_project: parseInt(idProject),
        id_user: parseInt(idUser),
        status: 'active',
      },
    });
  }

  async findSubmissionByTaskAndUser(idTask, idUser) {
    return prisma.taskSubmission.findUnique({
      where: {
        id_task_id_user: {
          id_task: parseInt(idTask),
          id_user: parseInt(idUser),
        },
      },
    });
  }

  async createSubmission(submissionData) {
    return prisma.taskSubmission.create({
      data: submissionData,
    });
  }

  async updateSubmission(idSubmission, submissionData) {
    return prisma.taskSubmission.update({
      where: {
        id: parseInt(idSubmission),
      },
      data: submissionData,
    });
  }
}

module.exports = new TaskRepository();
