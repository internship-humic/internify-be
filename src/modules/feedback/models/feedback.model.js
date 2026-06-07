const joi = require('joi');

const createFeedbackModel = joi.object().keys({
  nama: joi.string().max(255).required().messages({
    'string.base': 'Nama harus berupa teks.',
    'string.empty': 'Nama tidak boleh kosong.',
    'string.max': 'Nama maksimal {#limit} karakter.',
    'any.required': 'Nama wajib diisi.',
  }),

  universitas: joi.string().max(255).required().messages({
    'string.base': 'Universitas harus berupa teks.',
    'string.empty': 'Universitas tidak boleh kosong.',
    'string.max': 'Universitas maksimal {#limit} karakter.',
    'any.required': 'Universitas wajib diisi.',
  }),

  pesan: joi.string().required().messages({
    'string.base': 'Pesan harus berupa teks.',
    'string.empty': 'Pesan tidak boleh kosong.',
    'any.required': 'Pesan wajib diisi.',
  }),

  batch: joi.number().integer().min(1).required().messages({
    'number.base': 'Batch harus berupa angka.',
    'number.integer': 'Batch harus berupa bilangan bulat.',
    'number.min': 'Batch minimal {#limit}.',
    'any.required': 'Batch wajib diisi.',
  }),

  posisi: joi.string().max(255).required().messages({
    'string.base': 'Posisi harus berupa teks.',
    'string.empty': 'Posisi tidak boleh kosong.',
    'string.max': 'Posisi maksimal {#limit} karakter.',
    'any.required': 'Posisi wajib diisi.',
  }),

  tahun: joi.number().integer().min(2000).max(2100).required().messages({
    'number.base': 'Tahun harus berupa angka.',
    'number.integer': 'Tahun harus berupa bilangan bulat.',
    'number.min': 'Tahun minimal {#limit}.',
    'number.max': 'Tahun maksimal {#limit}.',
    'any.required': 'Tahun wajib diisi.',
  }),

  image_path: joi.string().optional().allow('', null).messages({
    'string.base': 'Path gambar harus berupa teks.',
  }),
});

const updateFeedbackModel = joi.object().keys({
  nama: joi.string().max(255).optional().messages({
    'string.base': 'Nama harus berupa teks.',
    'string.max': 'Nama maksimal {#limit} karakter.',
  }),

  universitas: joi.string().max(255).optional().messages({
    'string.base': 'Universitas harus berupa teks.',
    'string.max': 'Universitas maksimal {#limit} karakter.',
  }),

  pesan: joi.string().optional().messages({
    'string.base': 'Pesan harus berupa teks.',
  }),

  batch: joi.number().integer().min(1).optional().messages({
    'number.base': 'Batch harus berupa angka.',
    'number.integer': 'Batch harus berupa bilangan bulat.',
    'number.min': 'Batch minimal {#limit}.',
  }),

  posisi: joi.string().max(255).optional().messages({
    'string.base': 'Posisi harus berupa teks.',
    'string.max': 'Posisi maksimal {#limit} karakter.',
  }),

  tahun: joi.number().integer().min(2000).max(2100).optional().messages({
    'number.base': 'Tahun harus berupa angka.',
    'number.integer': 'Tahun harus berupa bilangan bulat.',
    'number.min': 'Tahun minimal {#limit}.',
    'number.max': 'Tahun maksimal {#limit}.',
  }),

  image_path: joi.string().optional().allow('', null).messages({
    'string.base': 'Path gambar harus berupa teks.',
  }),
});

const getAllFeedbackModel = joi.object().keys({
  batch: joi.number().integer().min(1).optional().messages({
    'number.base': 'Batch harus berupa angka.',
    'number.integer': 'Batch harus berupa bilangan bulat.',
    'number.min': 'Batch minimal {#limit}.',
  }),

  tahun: joi.number().integer().min(2000).max(2100).optional().messages({
    'number.base': 'Tahun harus berupa angka.',
    'number.integer': 'Tahun harus berupa bilangan bulat.',
    'number.min': 'Tahun minimal {#limit}.',
    'number.max': 'Tahun maksimal {#limit}.',
  }),
});

module.exports = {
  createFeedbackModel,
  updateFeedbackModel,
  getAllFeedbackModel,
};
