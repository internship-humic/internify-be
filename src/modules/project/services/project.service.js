const projectRepository = require("../repositories/project.repository");
const { data, error } = require("../../../helpers/utils/wrapper");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../../../helpers/error");

class ProjectService {
  async createProject(projectPayload, actor) {
    try {
      if (!actor?.id) {
        return error(new BadRequestError("Admin ID is required"));
      }

      if (actor.role !== "admin") {
        return error(
          new ForbiddenError("Access denied: only admin can create project"),
        );
      }

      const { member_emails, ...projectData } = projectPayload;

      const admin = await projectRepository.findAdminById(actor.id);

      if (!admin) {
        return error(new NotFoundError("Admin not found"));
      }

      const normalizedEmails = this.normalizeEmails(member_emails || []);

      if (normalizedEmails.length > 8) {
        return error(
          new BadRequestError(
            "Project member limit exceeded. Maximum member is 8",
          ),
        );
      }

      const users =
        normalizedEmails.length > 0
          ? await projectRepository.findUsersByEmails(normalizedEmails)
          : [];

      if (normalizedEmails.length > 0) {
        const foundEmails = users.map((user) => user.email.toLowerCase());
        const missingEmails = normalizedEmails.filter(
          (email) => !foundEmails.includes(email),
        );

        if (missingEmails.length > 0) {
          return error(
            new NotFoundError(
              `User with these emails not found: ${missingEmails.join(", ")}`,
            ),
          );
        }
      }

      const newProjectData = {
        id_admin: parseInt(actor.id),
        project_icon: projectData.project_icon,
        project_name: projectData.project_name,
        description: projectData.description || "",
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        max_members: 8,
        status: "active",
      };

      const userIds = users.map((user) => user.id);
      const project = await projectRepository.createWithMembers(
        newProjectData,
        userIds,
      );

      return data(this.mapProjectDetail(project));
    } catch (err) {
      return error(err);
    }
  }

  async getAllProjects(query = {}, actor = {}) {
    try {
      const projects = await projectRepository.findAll({
        status: query.status,
        actor,
      });

      const mappedProjects = projects.map((project) => ({
        id: project.id,
        project_icon: project.project_icon,
        project_name: project.project_name,
        description: project.description,
        start_date: project.start_date,
        end_date: project.end_date,
        max_members: project.max_members,
        status: project.status,
        admin: this.mapAdmin(project.admin),
        total_members: project.members?.length || 0,
        total_tasks: project.tasks?.length || 0,
        created_at: project.created_at,
        updated_at: project.updated_at,
      }));

      return data(mappedProjects);
    } catch (err) {
      return error(err);
    }
  }

  async getProjectById(id, actor = {}) {
    try {
      const project = await projectRepository.findById(id);

      if (!project) {
        return error(new NotFoundError("Project not found"));
      }

      const accessError = await this.validateProjectAccess(project.id, actor);
      if (accessError) {
        return error(accessError);
      }

      return data(this.mapProjectDetail(project));
    } catch (err) {
      return error(err);
    }
  }

  async updateProject(id, updatePayload, actor = {}) {
    try {
      if (!actor?.id) {
        return error(new BadRequestError("Admin ID is required"));
      }

      if (actor.role !== "admin") {
        return error(
          new ForbiddenError("Access denied: only admin can update project"),
        );
      }

      const existingProject = await projectRepository.findById(id);

      if (!existingProject) {
        return error(new NotFoundError("Project not found"));
      }

      if (Object.keys(updatePayload).length === 0) {
        return error(
          new BadRequestError(
            "At least one field is required to update project",
          ),
        );
      }

      const updateData = { ...updatePayload };

      if (updateData.start_date || updateData.end_date) {
        const startDate = updateData.start_date || existingProject.start_date;
        const endDate = updateData.end_date || existingProject.end_date;

        if (new Date(endDate) < new Date(startDate)) {
          return error(
            new BadRequestError(
              "End date must be greater than or equal to start date",
            ),
          );
        }
      }

      if (updateData.description === null) {
        updateData.description = "";
      }

      const updatedProject = await projectRepository.updateById(id, updateData);

      return data(this.mapProjectDetail(updatedProject));
    } catch (err) {
      return error(err);
    }
  }

  async archiveProject(id, actor = {}) {
    try {
      if (!actor?.id) {
        return error(new BadRequestError("Admin ID is required"));
      }

      if (actor.role !== "admin") {
        return error(
          new ForbiddenError("Access denied: only admin can archive project"),
        );
      }

      const existingProject = await projectRepository.findById(id);

      if (!existingProject) {
        return error(new NotFoundError("Project not found"));
      }

      if (existingProject.status === "archived") {
        return data(this.mapProjectDetail(existingProject));
      }

      const archivedProject = await projectRepository.archiveById(id);

      return data(this.mapProjectDetail(archivedProject));
    } catch (err) {
      return error(err);
    }
  }

  async validateProjectAccess(idProject, actor = {}) {
    if (!actor?.id || !actor?.role) {
      return new ForbiddenError(
        "Access denied: authentication data is missing",
      );
    }

    if (actor.role === "admin") {
      return null;
    }

    if (actor.role === "intern") {
      const membership = await projectRepository.checkActiveMember(
        idProject,
        actor.id,
      );

      if (!membership) {
        return new ForbiddenError(
          "Access denied: you are not a member of this project",
        );
      }

      return null;
    }

    return new ForbiddenError("Access denied: invalid role");
  }

  normalizeEmails(emails = []) {
    return [
      ...new Set(
        emails.filter(Boolean).map((email) => email.trim().toLowerCase()),
      ),
    ];
  }

  mapProjectDetail(project) {
    if (!project) return null;

    return {
      id: project.id,
      project_icon: project.project_icon,
      project_name: project.project_name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      max_members: project.max_members,
      status: project.status,
      admin: this.mapAdmin(project.admin),
      members:
        project.members?.map((member) => this.mapProjectMember(member)) || [],
      tasks: project.tasks || [],
      total_members: project.members?.length || 0,
      total_tasks: project.tasks?.length || 0,
      created_at: project.created_at,
      updated_at: project.updated_at,
    };
  }

  mapAdmin(admin) {
    if (!admin) return null;

    return {
      id: admin.id,
      full_name: `${admin.nama_depan}${admin.nama_belakang ? ` ${admin.nama_belakang}` : ""}`,
      email: admin.email,
      profile_picture: admin.profile_picture || null,
      professional_bio: admin.professional_bio || null,
    };
  }

  mapProjectMember(member) {
    if (!member) return null;

    const user = member.user;
    const lowongan = user?.lamaran_magang?.lowongan_magang;

    return {
      id: member.id,
      id_user: member.id_user,
      status: member.status,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        professional_bio: user.professional_bio || null,
        position: lowongan?.posisi || null,
        kelompok_peminatan: lowongan?.kelompok_peminatan || null,
      },
      created_at: member.created_at,
      updated_at: member.updated_at,
    };
  }
}

module.exports = new ProjectService();
