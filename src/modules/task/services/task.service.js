const fs = require('fs');
const path = require('path');
const taskRepository = require('../repositories/task.repository');
const { taskUploadDir } = require('../helpers/taskUpload.helper');
const { data, error } = require('../../../helpers/utils/wrapper');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../../helpers/error');

class TaskService {
  async createTask(idProject, payload, actor = {}) {
    try {
      if (!this.isPositiveInteger(idProject)) {
        return error(new BadRequestError('Project ID must be a valid number'));
      }

      if (!actor?.id || actor.role !== 'admin') {
        return error(new ForbiddenError('Access denied: only admin can create task'));
      }

      const project = await taskRepository.findProjectById(idProject);

      if (!project) {
        return error(new NotFoundError('Project not found'));
      }

      const deadlineAt = this.buildDeadlineAt(payload.deadline_date, payload.specific_time);

      const task = await taskRepository.createTask({
        id_project: parseInt(idProject),
        title: payload.title,
        description: payload.description,
        deadline_at: deadlineAt,
        submission_type: payload.submission_type,
      });

      return data(this.mapTask(task));
    } catch (err) {
      return error(err);
    }
  }

  async getTasksByProject(idProject, actor = {}) {
    try {
      if (!this.isPositiveInteger(idProject)) {
        return error(new BadRequestError('Project ID must be a valid number'));
      }

      const project = await taskRepository.findProjectById(idProject);

      if (!project) {
        return error(new NotFoundError('Project not found'));
      }

      const accessError = await this.validateProjectAccess(idProject, actor);

      if (accessError) {
        return error(accessError);
      }

      const tasks = await taskRepository.findTasksByProject(idProject);
      const totalMembers = project.members?.length || 0;

      const mappedTasks = tasks.map((task) => {
        if (actor.role === 'intern') {
          const mySubmission = task.submissions.find(
            (submission) => submission.id_user === parseInt(actor.id)
          ) || null;

          return {
            ...this.mapTask(task),
            display_status: this.getDisplayStatus(task.deadline_at, mySubmission),
            my_submission: mySubmission ? this.mapSubmission(mySubmission) : null,
          };
        }

        return {
          ...this.mapTask(task),
          total_members: totalMembers,
          total_submissions: task.submissions?.length || 0,
        };
      });

      return data(mappedTasks);
    } catch (err) {
      return error(err);
    }
  }

  async getTaskById(idTask, actor = {}) {
    try {
      if (!this.isPositiveInteger(idTask)) {
        return error(new BadRequestError('Task ID must be a valid number'));
      }

      const task = await taskRepository.findTaskById(idTask);

      if (!task) {
        return error(new NotFoundError('Task not found'));
      }

      const accessError = await this.validateProjectAccess(task.id_project, actor);

      if (accessError) {
        return error(accessError);
      }

      if (actor.role === 'admin') {
        return data(this.mapAdminTaskDetail(task));
      }

      const mySubmission = task.submissions.find(
        (submission) => submission.id_user === parseInt(actor.id)
      ) || null;

      return data(this.mapInternTaskDetail(task, mySubmission));
    } catch (err) {
      return error(err);
    }
  }

  async updateTask(idTask, payload, actor = {}) {
    try {
      if (!this.isPositiveInteger(idTask)) {
        return error(new BadRequestError('Task ID must be a valid number'));
      }

      if (!actor?.id || actor.role !== 'admin') {
        return error(new ForbiddenError('Access denied: only admin can update task'));
      }

      if (Object.keys(payload).length === 0) {
        return error(new BadRequestError('At least one field is required to update task'));
      }

      const existingTask = await taskRepository.findTaskById(idTask);

      if (!existingTask) {
        return error(new NotFoundError('Task not found'));
      }

      const submissionCount = await taskRepository.countSubmissionsByTask(idTask);

      if (
        payload.submission_type &&
        payload.submission_type !== existingTask.submission_type &&
        submissionCount > 0
      ) {
        return error(
          new ConflictError('Submission type cannot be changed because this task already has submissions')
        );
      }

      const updateData = {};

      if (payload.title !== undefined) updateData.title = payload.title;
      if (payload.description !== undefined) updateData.description = payload.description;
      if (payload.submission_type !== undefined) updateData.submission_type = payload.submission_type;

      if (payload.deadline_date !== undefined || payload.specific_time !== undefined) {
        updateData.deadline_at = this.buildDeadlineAtFromExisting(
          existingTask.deadline_at,
          payload.deadline_date,
          payload.specific_time
        );
      }

      const updatedTask = await taskRepository.updateTask(idTask, updateData);

      return data(this.mapTask(updatedTask));
    } catch (err) {
      return error(err);
    }
  }

  async deleteTask(idTask, actor = {}) {
    try {
      if (!this.isPositiveInteger(idTask)) {
        return error(new BadRequestError('Task ID must be a valid number'));
      }

      if (!actor?.id || actor.role !== 'admin') {
        return error(new ForbiddenError('Access denied: only admin can delete task'));
      }

      const task = await taskRepository.findTaskById(idTask);

      if (!task) {
        return error(new NotFoundError('Task not found'));
      }

      const submissionCount = await taskRepository.countSubmissionsByTask(idTask);

      if (submissionCount > 0) {
        return error(new ConflictError('Task already has submissions and cannot be deleted'));
      }

      await taskRepository.deleteTask(idTask);

      return data(null);
    } catch (err) {
      return error(err);
    }
  }

  async submitTask(idTask, payload, file, actor = {}) {
    try {
      if (!this.isPositiveInteger(idTask)) {
        return error(new BadRequestError('Task ID must be a valid number'));
      }

      if (!actor?.id || actor.role !== 'intern') {
        return error(new ForbiddenError('Access denied: only intern can submit task'));
      }

      const task = await taskRepository.findTaskById(idTask);

      if (!task) {
        return error(new NotFoundError('Task not found'));
      }

      const membership = await taskRepository.checkActiveProjectMember(task.id_project, actor.id);

      if (!membership) {
        return error(new ForbiddenError('Access denied: you are not a member of this project'));
      }

      const submissionData = {
        id_task: parseInt(idTask),
        id_user: parseInt(actor.id),
      };

      if (task.submission_type === 'file_upload') {
        if (!file) {
          return error(new BadRequestError('Submission file is required for this task'));
        }

        if (payload.url_link) {
          return error(new BadRequestError('URL link is not allowed for file upload task'));
        }

        submissionData.file_path = `/uploads/task-submissions/${file.filename}`;
        submissionData.url_link = null;
      }

      if (task.submission_type === 'url_link') {
        if (file) {
          return error(new BadRequestError('File upload is not allowed for URL link task'));
        }

        if (!payload.url_link) {
          return error(new BadRequestError('URL link is required for this task'));
        }

        submissionData.file_path = null;
        submissionData.url_link = payload.url_link;
      }

      const existingSubmission = await taskRepository.findSubmissionByTaskAndUser(idTask, actor.id);

      let submission;

      if (existingSubmission) {
        this.deleteLocalSubmissionFile(existingSubmission.file_path);
        submission = await taskRepository.updateSubmission(existingSubmission.id, submissionData);
      } else {
        submission = await taskRepository.createSubmission(submissionData);
      }

      return data(this.mapSubmission(submission));
    } catch (err) {
      return error(err);
    }
  }

  async updateSubmission(idSubmission, payload, file, actor = {}) {
    try {
      if (!this.isPositiveInteger(idSubmission)) {
        return error(new BadRequestError('Submission ID must be a valid number'));
      }

      if (!actor?.id || actor.role !== 'intern') {
        return error(new ForbiddenError('Access denied: only intern can update submission'));
      }

      const submission = await taskRepository.findSubmissionById(idSubmission);

      if (!submission) {
        return error(new NotFoundError('Submission not found'));
      }

      if (submission.id_user !== parseInt(actor.id)) {
        return error(new ForbiddenError('Access denied: you can only update your own submission'));
      }

      const membership = await taskRepository.checkActiveProjectMember(
        submission.task.id_project,
        actor.id
      );

      if (!membership) {
        return error(new ForbiddenError('Access denied: you are not a member of this project'));
      }

      const updateData = {};

      if (submission.task.submission_type === 'file_upload') {
        if (!file) {
          return error(new BadRequestError('Submission file is required for this task'));
        }

        if (payload.url_link) {
          return error(new BadRequestError('URL link is not allowed for file upload task'));
        }

        updateData.file_path = `/uploads/task-submissions/${file.filename}`;
        updateData.url_link = null;
      }

      if (submission.task.submission_type === 'url_link') {
        if (file) {
          return error(new BadRequestError('File upload is not allowed for URL link task'));
        }

        if (!payload.url_link) {
          return error(new BadRequestError('URL link is required for this task'));
        }

        updateData.file_path = null;
        updateData.url_link = payload.url_link;
      }

      this.deleteLocalSubmissionFile(submission.file_path);

      const updatedSubmission = await taskRepository.updateSubmission(
        idSubmission,
        updateData
      );

      return data(this.mapSubmission(updatedSubmission));
    } catch (err) {
      return error(err);
    }
  }

  async deleteSubmission(idSubmission, actor = {}) {
    try {
      if (!this.isPositiveInteger(idSubmission)) {
        return error(new BadRequestError('Submission ID must be a valid number'));
      }

      if (!actor?.id || actor.role !== 'intern') {
        return error(new ForbiddenError('Access denied: only intern can delete submission'));
      }

      const submission = await taskRepository.findSubmissionById(idSubmission);

      if (!submission) {
        return error(new NotFoundError('Submission not found'));
      }

      if (submission.id_user !== parseInt(actor.id)) {
        return error(new ForbiddenError('Access denied: you can only delete your own submission'));
      }

      const membership = await taskRepository.checkActiveProjectMember(
        submission.task.id_project,
        actor.id
      );

      if (!membership) {
        return error(new ForbiddenError('Access denied: you are not a member of this project'));
      }

      await taskRepository.deleteSubmission(idSubmission);

      this.deleteLocalSubmissionFile(submission.file_path);

      return data(null);
    } catch (err) {
      return error(err);
    }
  }

  async validateProjectAccess(idProject, actor = {}) {
    if (!actor?.id || !actor?.role) {
      return new ForbiddenError('Access denied: authentication data is missing');
    }

    if (actor.role === 'admin') {
      return null;
    }

    if (actor.role === 'intern') {
      const membership = await taskRepository.checkActiveProjectMember(idProject, actor.id);

      if (!membership) {
        return new ForbiddenError('Access denied: you are not a member of this project');
      }

      return null;
    }

    return new ForbiddenError('Access denied: invalid role');
  }

  buildDeadlineAt(deadlineDate, specificTime) {
    const dateOnly = this.formatDateOnly(new Date(deadlineDate));
    return new Date(`${dateOnly}T${specificTime}:00`);
  }

  buildDeadlineAtFromExisting(existingDeadlineAt, deadlineDate, specificTime) {
    const currentDate = this.formatDateOnly(new Date(existingDeadlineAt));
    const currentTime = this.formatTimeOnly(new Date(existingDeadlineAt));

    const nextDate = deadlineDate !== undefined
      ? this.formatDateOnly(new Date(deadlineDate))
      : currentDate;

    const nextTime = specificTime !== undefined
      ? specificTime
      : currentTime;

    return new Date(`${nextDate}T${nextTime}:00`);
  }

  formatDateOnly(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  formatTimeOnly(date) {
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  getDisplayStatus(deadlineAt, submission) {
    const now = new Date();
    const deadline = new Date(deadlineAt);

    if (deadline < now) {
      return 'overdue';
    }

    if (submission) {
      return 'done';
    }

    return 'pending';
  }

  mapTask(task) {
    if (!task) return null;

    return {
      id: task.id,
      id_project: task.id_project,
      title: task.title,
      description: task.description,
      deadline_at: task.deadline_at,
      submission_type: task.submission_type,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }

  mapSubmission(submission) {
    if (!submission) return null;

    return {
      id: submission.id,
      id_task: submission.id_task,
      id_user: submission.id_user,
      file_path: submission.file_path,
      url_link: submission.url_link,
      submitted_at: submission.submitted_at,
      updated_at: submission.updated_at,
    };
  }

  mapInternTaskDetail(task, submission) {
    return {
      ...this.mapTask(task),
      project: {
        id: task.project?.id,
        project_name: task.project?.project_name,
        project_icon: task.project?.project_icon,
      },
      display_status: this.getDisplayStatus(task.deadline_at, submission),
      my_submission: submission ? this.mapSubmission(submission) : null,
    };
  }

  mapAdminTaskDetail(task) {
    const members = task.project?.members || [];
    const submissions = task.submissions || [];

    const mappedSubmissions = members.map((member) => {
      const user = member.user;
      const submission = submissions.find(
        (item) => item.id_user === user.id
      ) || null;

      const displayStatus = this.getDisplayStatus(task.deadline_at, submission);

      return {
        id_user: user.id,
        full_name: user.full_name,
        email: user.email,
        profile_picture: null,
        professional_bio: user.professional_bio || null,
        submitted_at: submission?.submitted_at || null,
        display_status: displayStatus,
        submission: submission ? this.mapSubmission(submission) : null,
      };
    });

    const totalDone = mappedSubmissions.filter((item) => item.display_status === 'done').length;
    const totalPending = mappedSubmissions.filter((item) => item.display_status === 'pending').length;
    const totalOverdue = mappedSubmissions.filter((item) => item.display_status === 'overdue').length;

    return {
      ...this.mapTask(task),
      project: {
        id: task.project?.id,
        project_name: task.project?.project_name,
        project_icon: task.project?.project_icon,
      },
      submission_summary: {
        total_members: members.length,
        total_submitted: submissions.length,
        total_done: totalDone,
        total_pending: totalPending,
        total_overdue: totalOverdue,
      },
      submissions: mappedSubmissions,
    };
  }

  deleteLocalSubmissionFile(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return;
    }

    if (!filePath.startsWith('/uploads/task-submissions/')) {
      return;
    }

    if (!taskUploadDir || typeof taskUploadDir !== 'string') {
      return;
    }

    const filename = path.basename(filePath);
    const absolutePath = path.join(taskUploadDir, filename);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  isPositiveInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
  }
}

module.exports = new TaskService();
