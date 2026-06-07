const projectService = require('../services/project.service');
const { response, error } = require('../../../helpers/utils/wrapper');
const { SUCCESS, ERROR } = require('../../../helpers/http-status/status_code');
const { InternalServerError } = require('../../../helpers/error');
const { isValidPayload } = require('../../../helpers/utils/validator');
const {
  createProjectModel,
  updateProjectModel,
  getAllProjectsModel,
} = require('../models/project.model');

const getActor = (req) => ({
  id: req.id,
  role: req.role,
  email: req.email,
});

class ProjectController {
  async createProject(req, res) {
    try {
      const validatePayload = isValidPayload(req.body, createProjectModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Invalid project data',
          ERROR.EXPECTATION_FAILED
        );
      }

      const actor = getActor(req);
      const result = await projectService.createProject(validatePayload.data, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Project created successfully', SUCCESS.CREATED);
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

  async getAllProjects(req, res) {
    try {
      const validatePayload = isValidPayload(req.query, getAllProjectsModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Invalid query data',
          ERROR.EXPECTATION_FAILED
        );
      }

      const actor = getActor(req);
      const result = await projectService.getAllProjects(validatePayload.data, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Projects retrieved successfully', SUCCESS.OK);
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

  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const actor = getActor(req);

      const result = await projectService.getProjectById(id, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Project detail retrieved successfully', SUCCESS.OK);
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

  async updateProject(req, res) {
    try {
      const { id } = req.params;

      const validatePayload = isValidPayload(req.body, updateProjectModel);

      if (validatePayload.err) {
        return response(
          res,
          'fail',
          { err: validatePayload.err, data: null },
          'Invalid project data',
          ERROR.EXPECTATION_FAILED
        );
      }

      const actor = getActor(req);
      const result = await projectService.updateProject(id, validatePayload.data, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Project updated successfully', SUCCESS.OK);
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

  async archiveProject(req, res) {
    try {
      const { id } = req.params;
      const actor = getActor(req);

      const result = await projectService.archiveProject(id, actor);

      if (result.err) {
        return response(res, 'fail', result);
      }

      return response(res, 'success', result, 'Project archived successfully', SUCCESS.OK);
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

module.exports = new ProjectController();
