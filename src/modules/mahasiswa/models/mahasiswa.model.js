const joi = require('joi');

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

const createMahasiswaModel = joi.object().keys({
  nama_depan: joi.string().max(255).required().messages({
    'string.base': 'Nama depan harus berupa teks.',
    'string.empty': 'Nama depan tidak boleh kosong.',
    'string.max': 'Nama depan maksimal {#limit} karakter.',
    'any.required': 'Nama depan wajib diisi.',
  }),

  nama_belakang: joi.string().max(255).optional().allow('', null).messages({
    'string.base': 'Nama belakang harus berupa teks.',
    'string.max': 'Nama belakang maksimal {#limit} karakter.',
  }),

  email: joi.string().email({ tlds: { allow: false } }).max(255).required().messages({
    'string.base': 'Email harus berupa teks.',
    'string.empty': 'Email tidak boleh kosong.',
    'string.email': 'Format email tidak valid.',
    'string.max': 'Email maksimal {#limit} karakter.',
    'any.required': 'Email wajib diisi.',
  }),

  kontak: joi.string().pattern(phoneRegex).max(255).required().messages({
    'string.base': 'Kontak harus berupa teks.',
    'string.empty': 'Kontak tidak boleh kosong.',
    'string.pattern.base': 'Format nomor kontak tidak valid. Gunakan format Indonesia (08xx atau +628xx).',
    'string.max': 'Kontak maksimal {#limit} karakter.',
    'any.required': 'Kontak wajib diisi.',
  }),

  jurusan: joi.string().max(255).required().messages({
    'string.base': 'Jurusan harus berupa teks.',
    'string.empty': 'Jurusan tidak boleh kosong.',
    'string.max': 'Jurusan maksimal {#limit} karakter.',
    'any.required': 'Jurusan wajib diisi.',
  }),

  universitas: joi.string().max(255).required().messages({
    'string.base': 'Universitas harus berupa teks.',
    'string.empty': 'Universitas tidak boleh kosong.',
    'string.max': 'Universitas maksimal {#limit} karakter.',
    'any.required': 'Universitas wajib diisi.',
  }),

  negara: joi.string().max(255).required().messages({
    'string.base': 'Negara harus berupa teks.',
    'string.empty': 'Negara tidak boleh kosong.',
    'string.max': 'Negara maksimal {#limit} karakter.',
    'any.required': 'Negara wajib diisi.',
  }),

  role: joi.string().valid('student').default('student').messages({
    'string.base': 'Role harus berupa teks.',
    'any.only': 'Role hanya boleh "student".',
  }),

  cv_path: joi.string().required().messages({
    'string.base': 'Path CV harus berupa teks.',
    'string.empty': 'Path CV tidak boleh kosong.',
    'any.required': 'CV wajib diupload.',
  }),

  portofolio_path: joi.string().required().messages({
    'string.base': 'Path portofolio harus berupa teks.',
    'string.empty': 'Path portofolio tidak boleh kosong.',
    'any.required': 'Portofolio wajib diupload.',
  }),

  motivasi: joi.string().required().messages({
    'string.base': 'Motivasi harus berupa teks.',
    'string.empty': 'Motivasi tidak boleh kosong.',
    'any.required': 'Motivasi wajib diisi.',
  }),

  relevant_skills: joi.string().max(255).required().messages({
    'string.base': 'Keahlian yang relevan harus berupa teks.',
    'string.empty': 'Keahlian yang relevan tidak boleh kosong.',
    'string.max': 'Keahlian yang relevan maksimal {#limit} karakter.',
    'any.required': 'Keahlian yang relevan wajib diisi.',
  }),
});

const updateMahasiswaModel = joi.object().keys({
  nama_depan: joi.string().max(255).optional().messages({
    'string.base': 'Nama depan harus berupa teks.',
    'string.max': 'Nama depan maksimal {#limit} karakter.',
  }),

  nama_belakang: joi.string().max(255).optional().allow('', null).messages({
    'string.base': 'Nama belakang harus berupa teks.',
    'string.max': 'Nama belakang maksimal {#limit} karakter.',
  }),

  email: joi.string().email({ tlds: { allow: false } }).max(255).optional().messages({
    'string.base': 'Email harus berupa teks.',
    'string.email': 'Format email tidak valid.',
    'string.max': 'Email maksimal {#limit} karakter.',
  }),

  kontak: joi.string().pattern(phoneRegex).max(255).optional().messages({
    'string.base': 'Kontak harus berupa teks.',
    'string.pattern.base': 'Format nomor kontak tidak valid. Gunakan format Indonesia (08xx atau +628xx).',
    'string.max': 'Kontak maksimal {#limit} karakter.',
  }),

  jurusan: joi.string().max(255).optional().messages({
    'string.base': 'Jurusan harus berupa teks.',
    'string.max': 'Jurusan maksimal {#limit} karakter.',
  }),

  universitas: joi.string().max(255).optional().messages({
    'string.base': 'Universitas harus berupa teks.',
    'string.max': 'Universitas maksimal {#limit} karakter.',
  }),

  negara: joi.string().max(255).optional().messages({
    'string.base': 'Negara harus berupa teks.',
    'string.max': 'Negara maksimal {#limit} karakter.',
  }),

  cv_path: joi.string().optional().messages({
    'string.base': 'Path CV harus berupa teks.',
  }),

  portofolio_path: joi.string().optional().messages({
    'string.base': 'Path portofolio harus berupa teks.',
  }),

  motivasi: joi.string().optional().messages({
    'string.base': 'Motivasi harus berupa teks.',
  }),

  relevant_skills: joi.string().max(255).optional().messages({
    'string.base': 'Keahlian yang relevan harus berupa teks.',
    'string.max': 'Keahlian yang relevan maksimal {#limit} karakter.',
  }),
});

const getAllMahasiswaModel = joi.object().keys({
  page: joi.number().integer().min(1).default(1).messages({
    'number.base': 'Halaman harus berupa angka.',
    'number.integer': 'Halaman harus berupa angka bulat.',
    'number.min': 'Halaman minimal adalah {#limit}.',
  }),
  limit: joi.number().integer().min(1).default(10).messages({
    'number.base': 'Limit harus berupa angka.',
    'number.integer': 'Limit harus berupa angka bulat.',
    'number.min': 'Limit minimal adalah {#limit}.',
  }),
});

module.exports = {
  createMahasiswaModel,
  updateMahasiswaModel,
  getAllMahasiswaModel
};
