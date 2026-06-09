const joi = require('joi');

const PROJECT_ICON_VALUES = [
  'code',
  'chart',
  'cloud',
  'mobile',
  'gear',
  'users',
  'clipboard',
  'speedometer',
  'lightbulb',
  'shield',
];

const PROJECT_STATUS_VALUES = [
  'active',
  'completed',
  'archived',
];

const createProjectModel = joi.object().keys({
  project_icon: joi.string().valid(...PROJECT_ICON_VALUES).required().messages({
    'string.base': 'Project icon must be a string.',
    'string.empty': 'Project icon cannot be empty.',
    'any.only': `Project icon must be one of: ${PROJECT_ICON_VALUES.join(', ')}.`,
    'any.required': 'Project icon is required.',
  }),

  project_name: joi.string().max(255).required().messages({
    'string.base': 'Project name must be a string.',
    'string.empty': 'Project name cannot be empty.',
    'string.max': 'Project name must not exceed {#limit} characters.',
    'any.required': 'Project name is required.',
  }),

  description: joi.string().optional().allow('', null).messages({
    'string.base': 'Project description must be a string.',
  }),

  start_date: joi.date().required().messages({
    'date.base': 'Start date must be a valid date.',
    'any.required': 'Start date is required.',
  }),

  end_date: joi.date().min(joi.ref('start_date')).required().messages({
    'date.base': 'End date must be a valid date.',
    'date.min': 'End date must be greater than or equal to start date.',
    'any.required': 'End date is required.',
  }),

  member_emails: joi.array().items(
    joi.string().email({ tlds: { allow: false } }).messages({
      'string.email': 'Member email format is invalid.',
    })
  ).optional().default([]).messages({
    'array.base': 'Member emails must be an array.',
  }),
});

const updateProjectModel = joi.object().keys({
  project_icon: joi.string().valid(...PROJECT_ICON_VALUES).optional().messages({
    'string.base': 'Project icon must be a string.',
    'any.only': `Project icon must be one of: ${PROJECT_ICON_VALUES.join(', ')}.`,
  }),

  project_name: joi.string().max(255).optional().messages({
    'string.base': 'Project name must be a string.',
    'string.max': 'Project name must not exceed {#limit} characters.',
  }),

  description: joi.string().optional().allow('', null).messages({
    'string.base': 'Project description must be a string.',
  }),

  start_date: joi.date().optional().messages({
    'date.base': 'Start date must be a valid date.',
  }),

  end_date: joi.date().optional().messages({
    'date.base': 'End date must be a valid date.',
  }),

  status: joi.string().valid(...PROJECT_STATUS_VALUES).optional().messages({
    'string.base': 'Project status must be a string.',
    'any.only': `Project status must be one of: ${PROJECT_STATUS_VALUES.join(', ')}.`,
  }),
});

const getAllProjectsModel = joi.object().keys({
  status: joi.string().valid(...PROJECT_STATUS_VALUES).optional().messages({
    'string.base': 'Project status must be a string.',
    'any.only': `Project status must be one of: ${PROJECT_STATUS_VALUES.join(', ')}.`,
  }),
});

module.exports = {
  createProjectModel,
  updateProjectModel,
  getAllProjectsModel,
};
