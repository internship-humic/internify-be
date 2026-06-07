const joi = require('joi');

const loginModel = joi.object().keys({
  email: joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.base': 'Email harus berupa teks.',
    'string.empty': 'Email tidak boleh kosong.',
    'string.email': 'Format email tidak valid.',
    'any.required': 'Email wajib diisi.',
  }),

  password: joi.string().required().messages({
    'string.base': 'Password harus berupa teks.',
    'string.empty': 'Password tidak boleh kosong.',
    'string.min': 'Password minimal {#limit} karakter.',
    'any.required': 'Password wajib diisi.',
  }),
});

const registerModel = joi.object().keys({
  email: joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.base': 'Email harus berupa teks.',
    'string.empty': 'Email tidak boleh kosong.',
    'string.email': 'Format email tidak valid.',
    'any.required': 'Email wajib diisi.',
  }),

  password: joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.base': 'Password harus berupa teks.',
      'string.empty': 'Password tidak boleh kosong.',
      'string.min': 'Password minimal {#limit} karakter.',
      'string.pattern.base': 'Password harus mengandung huruf besar, huruf kecil, dan angka.',
      'any.required': 'Password wajib diisi.',
    }),
});

const forgotPasswordModel = joi.object().keys({
  email: joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.base': 'Email harus berupa teks.',
    'string.empty': 'Email tidak boleh kosong.',
    'string.email': 'Format email tidak valid.',
    'any.required': 'Email wajib diisi.',
  }),
});

const resetPasswordModel = joi.object().keys({
  token: joi.string().required().messages({
    'string.base': 'Token harus berupa teks.',
    'string.empty': 'Token tidak boleh kosong.',
    'any.required': 'Token wajib diisi.',
  }),

  password: joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.base': 'Password harus berupa teks.',
      'string.empty': 'Password tidak boleh kosong.',
      'string.min': 'Password minimal {#limit} karakter.',
      'string.pattern.base': 'Password harus mengandung huruf besar, huruf kecil, dan angka.',
      'any.required': 'Password wajib diisi.',
    }),
});

module.exports = {
  loginModel,
  registerModel,
  forgotPasswordModel,
  resetPasswordModel,
};
