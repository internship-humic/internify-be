const fs = require('fs');
const taskService = require('../services/task.service');
const { response, error } = require('../../../helpers/utils/wrapper');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { InternalServerError } = require('../../../helpers/error');
const { isValidPayload } = require('../../../helpers/utils/validator');
const {
  createTaskModel,
  updateTaskModel,
  submitTaskModel,
  updateSubmissionModel,
} = require('../models/task.model');

const getActor = (req) => ({
  id: req.id,
  role: req.role,
  email: req.email,
});

const cleanupUploadedFile = (file) => {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

class TaskController {
  async createTask(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, createTaskModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Invalid task data',
          ERROR.EXPECTATION_FAILED
        );
      }

      const actor = getActor(req);
      const result = await taskService.createTask(
        req.params.id_project,
        validatePayload.data,
        actor
      );

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Task created successfully', SUCCESS.CREATED);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async getTasksByProject(req, res) {
    try {
      const actor = getActor(req);
      const result = await taskService.getTasksByProject(req.params.id_project, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Tasks retrieved successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async getTaskById(req, res) {
    try {
      const actor = getActor(req);
      const result = await taskService.getTaskById(req.params.id, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Task detail retrieved successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async updateTask(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, updateTaskModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Invalid task data',
          ERROR.EXPECTATION_FAILED
        );
      }

      const actor = getActor(req);
      const result = await taskService.updateTask(req.params.id, validatePayload.data, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Task updated successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async deleteTask(req, res) {
    try {
      const actor = getActor(req);
      const result = await taskService.deleteTask(req.params.id, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Task deleted successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async submitTask(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, submitTaskModel);

      if (validatePayload.err) {
        cleanupUploadedFile(req.file);

        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Invalid submission data',
          ERROR.EXPECTATION_FAILED
        );
      }

      const actor = getActor(req);
      const result = await taskService.submitTask(
        req.params.id,
        validatePayload.data,
        req.file,
        actor
      );

      if (result.err) {
        cleanupUploadedFile(req.file);
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Task submitted successfully', SUCCESS.OK);
    } catch (err) {
      cleanupUploadedFile(req.file);

      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async updateSubmission(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, updateSubmissionModel);

      if (validatePayload.err) {
        cleanupUploadedFile(req.file);

        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Invalid submission data',
          ERROR.EXPECTATION_FAILED
        );
      }

      const actor = getActor(req);
      const result = await taskService.updateSubmission(
        req.params.id,
        validatePayload.data,
        req.file,
        actor
      );

      if (result.err) {
        cleanupUploadedFile(req.file);
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Submission updated successfully', SUCCESS.OK);
    } catch (err) {
      cleanupUploadedFile(req.file);

      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }

  async deleteSubmission(req, res) {
    try {
      const actor = getActor(req);
      const result = await taskService.deleteSubmission(req.params.id, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Submission deleted successfully', SUCCESS.OK);
    } catch (err) {
      return response(
        res,
        'fail',
        error(new InternalServerError(err.message)),
        'Unexpected error occurred',
        ERROR.INTERNAL_ERROR
      );
    }
  }
}

module.exports = new TaskController();
