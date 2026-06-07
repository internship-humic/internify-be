const joi = require('joi');

const createAdminModel = joi.object().keys({
  nama_depan: joi.string().max(255).required().messages({
    'string.base': 'Nama depan harus berupa teks.',
    'string.empty': 'Nama depan tidak boleh kosong.',
    'string.max': 'Nama depan maksimal {#limit} karakter.',
    'any.required': 'Nama depan wajib diisi.',
  }),

  nama_belakang: joi.string().max(255).required().messages({
    'string.base': 'Nama belakang harus berupa teks.',
    'string.empty': 'Nama belakang tidak boleh kosong.',
    'string.max': 'Nama belakang maksimal {#limit} karakter.',
    'any.required': 'Nama belakang wajib diisi.',
  }),

  email: joi.string().email({ tlds: { allow: false } }).max(255).required().messages({
    'string.base': 'Email harus berupa teks.',
    'string.empty': 'Email tidak boleh kosong.',
    'string.email': 'Format email tidak valid.',
    'string.max': 'Email maksimal {#limit} karakter.',
    'any.required': 'Email wajib diisi.',
  }),

  password: joi.string().min(8).required().messages({
    'string.base': 'Password harus berupa teks.',
    'string.empty': 'Password tidak boleh kosong.',
    'string.min': 'Password minimal {#limit} karakter.',
    'any.required': 'Password wajib diisi.',
  }),

  role: joi.string().valid('admin').default('admin').messages({
    'string.base': 'Role harus berupa teks.',
    'any.only': 'Role hanya boleh "admin".',
  }),

  signature: joi.string().optional().allow('', null).messages({
    'string.base': 'Signature harus berupa teks.',
  }),
});

const updateAdminModel = joi.object().keys({
  nama_depan: joi.string().max(255).optional().messages({
    'string.base': 'Nama depan harus berupa teks.',
    'string.empty': 'Nama depan tidak boleh kosong.',
    'string.max': 'Nama depan maksimal {#limit} karakter.',
  }),

  nama_belakang: joi.string().max(255).optional().messages({
    'string.base': 'Nama belakang harus berupa teks.',
    'string.empty': 'Nama belakang tidak boleh kosong.',
    'string.max': 'Nama belakang maksimal {#limit} karakter.',
  }),

  email: joi.string().email({ tlds: { allow: false } }).max(255).optional().messages({
    'string.base': 'Email harus berupa teks.',
    'string.email': 'Format email tidak valid.',
    'string.max': 'Email maksimal {#limit} karakter.',
  }),

  password: joi.string().min(8).optional().messages({
    'string.base': 'Password harus berupa teks.',
    'string.min': 'Password minimal {#limit} karakter.',
  }),

  signature: joi.string().optional().allow('', null).messages({
    'string.base': 'Signature harus berupa teks.',
  }),
});

module.exports = {
  createAdminModel,
  updateAdminModel,
};
