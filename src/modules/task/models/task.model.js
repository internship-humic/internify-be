const joi = require('joi');

const SUBMISSION_TYPE_VALUES = ['file_upload', 'url_link'];

const createTaskModel = joi.object().keys({
  title: joi.string().max(255).required().messages({
    'string.base': 'Task title must be a string.',
    'string.empty': 'Task title cannot be empty.',
    'string.max': 'Task title must not exceed {#limit} characters.',
    'any.required': 'Task title is required.',
  }),

  description: joi.string().required().messages({
    'string.base': 'Task description must be a string.',
    'string.empty': 'Task description cannot be empty.',
    'any.required': 'Task description is required.',
  }),

  deadline_date: joi.date().required().messages({
    'date.base': 'Deadline date must be a valid date.',
    'any.required': 'Deadline date is required.',
  }),

  specific_time: joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required().messages({
    'string.base': 'Specific time must be a string.',
    'string.empty': 'Specific time cannot be empty.',
    'string.pattern.base': 'Specific time must use HH:mm format.',
    'any.required': 'Specific time is required.',
  }),

  submission_type: joi.string().valid(...SUBMISSION_TYPE_VALUES).required().messages({
    'string.base': 'Submission type must be a string.',
    'any.only': `Submission type must be one of: ${SUBMISSION_TYPE_VALUES.join(', ')}.`,
    'any.required': 'Submission type is required.',
  }),
});

const updateTaskModel = joi.object().keys({
  title: joi.string().max(255).optional().messages({
    'string.base': 'Task title must be a string.',
    'string.max': 'Task title must not exceed {#limit} characters.',
  }),

  description: joi.string().optional().messages({
    'string.base': 'Task description must be a string.',
  }),

  deadline_date: joi.date().optional().messages({
    'date.base': 'Deadline date must be a valid date.',
  }),

  specific_time: joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).optional().messages({
    'string.base': 'Specific time must be a string.',
    'string.pattern.base': 'Specific time must use HH:mm format.',
  }),

  submission_type: joi.string().valid(...SUBMISSION_TYPE_VALUES).optional().messages({
    'string.base': 'Submission type must be a string.',
    'any.only': `Submission type must be one of: ${SUBMISSION_TYPE_VALUES.join(', ')}.`,
  }),
});

const submitTaskModel = joi.object().keys({
  url_link: joi.string().uri().optional().messages({
    'string.base': 'URL link must be a string.',
    'string.uri': 'URL link must be a valid URL.',
  }),
});

module.exports = {
  createTaskModel,
  updateTaskModel,
  submitTaskModel,
};
