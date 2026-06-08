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

const updateProfileModel = joi.object().keys({
  full_name: joi.string().max(255).optional().messages({
    'string.base': 'Nama lengkap harus berupa teks.',
    'string.max': 'Nama lengkap tidak boleh lebih dari 255 karakter.'
  }),
  email: joi.string().email({ tlds: { allow: false } }).optional().messages({
    'string.base': 'Email harus berupa teks.',
    'string.email': 'Format email tidak valid.'
  }),
  password: joi.string().min(8).optional().messages({
    'string.base': 'Password harus berupa teks.',
    'string.min': 'Password minimal {#limit} karakter.'
  }),
  professional_bio: joi.string().allow('', null).optional().messages({
    'string.base': 'Bio harus berupa teks.'
  })
});

module.exports = {
  loginModel,
  registerModel,
  forgotPasswordModel,
  resetPasswordModel,
  updateProfileModel,
};
