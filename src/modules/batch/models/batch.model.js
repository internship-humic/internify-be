const joi = require('joi');

const createBatchModel = joi.object().keys({
  batch_number: joi.number().integer().positive().messages({
    'number.base': 'Nomor batch harus berupa angka.',
    'number.integer': 'Nomor batch harus berupa bilangan bulat.',
    'number.positive': 'Nomor batch harus berupa angka positif.',
  }),

  is_active: joi.boolean().default(true).messages({
    'boolean.base': 'Status aktif harus berupa boolean.',
  }),
});

const updateBatchModel = joi.object().keys({
  batch_number: joi.number().integer().positive().messages({
    'number.base': 'Nomor batch harus berupa angka.',
    'number.integer': 'Nomor batch harus berupa bilangan bulat.',
    'number.positive': 'Nomor batch harus berupa angka positif.',
  }),

  is_active: joi.boolean().messages({
    'boolean.base': 'Status aktif harus berupa boolean.',
  }),
});

module.exports = {
  createBatchModel,
  updateBatchModel,
};
