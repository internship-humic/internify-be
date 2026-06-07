const joi = require('joi');

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

const createLamaranMagangModel = joi.object().keys({
  id_lowongan_magang: joi.string().uuid().required().messages({
    'string.base': 'ID lowongan magang harus berupa teks.',
    'string.empty': 'ID lowongan magang tidak boleh kosong.',
    'string.guid': 'Format ID lowongan magang tidak valid.',
    'any.required': 'ID lowongan magang wajib diisi.',
  }),

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

  cv: joi.string().required().messages({
    'string.base': 'Path CV harus berupa teks.',
    'string.empty': 'Path CV tidak boleh kosong.',
    'any.required': 'CV wajib diupload.',
  }),

  portofolio: joi.string().required().messages({
    'string.base': 'Path portofolio harus berupa teks.',
    'string.empty': 'Path portofolio tidak boleh kosong.',
    'any.required': 'Portofolio wajib diupload.',
  }),

  status: joi.string().valid('diterima', 'diproses', 'ditolak').default('pending').messages({
    'string.base': 'Status harus berupa teks.',
    'any.only': 'Status hanya boleh "diterima", "diproses", atau "ditolak".',
  }),
});

const updateLamaranStatusModel = joi.object().keys({
  status: joi.string().valid('diterima', 'diproses', 'ditolak').required().messages({
    'string.base': 'Status harus berupa teks.',
    'string.empty': 'Status tidak boleh kosong.',
    'any.only': 'Status hanya boleh "diterima", "diproses", atau "ditolak".',
    'any.required': 'Status wajib diisi.',
  }),
});

const updateLamaranMagangModel = joi.object().keys({
  id_lowongan_magang: joi.string().uuid().optional().messages({
    'string.base': 'ID lowongan magang harus berupa teks.',
    'string.guid': 'Format ID lowongan magang tidak valid.',
  }),

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

  motivasi: joi.string().optional().messages({
    'string.base': 'Motivasi harus berupa teks.',
  }),

  relevant_skills: joi.string().max(255).optional().messages({
    'string.base': 'Keahlian yang relevan harus berupa teks.',
    'string.max': 'Keahlian yang relevan maksimal {#limit} karakter.',
  }),

  cv_path: joi.string().optional().messages({
    'string.base': 'Path CV harus berupa teks.',
  }),

  portofolio_path: joi.string().optional().messages({
    'string.base': 'Path portofolio harus berupa teks.',
  }),

  status: joi.string().valid('diterima', 'diproses', 'ditolak').optional().messages({
    'string.base': 'Status harus berupa teks.',
    'any.only': 'Status hanya boleh "diterima", "diproses", atau "ditolak".',
  }),
});

const getAllLamaranMagangModel = joi.object().keys({
  page: joi.number().integer().min(0).optional().messages({
    'number.base': 'page harus berupa angka.',
  }),
  limit: joi.number().integer().min(1).optional().messages({
    'number.base': 'Limit harus berupa angka.',
  }),
  posisi: joi.string().max(255).optional().messages({
    'string.base': 'Posisi harus berupa teks.',
    'string.max': 'Posisi maksimal {#limit} karakter.',
  }),
  status: joi.string().valid('diterima', 'diproses', 'ditolak').optional().messages({
    'string.base': 'Status harus berupa teks.',
    'any.only': 'Status hanya boleh "diterima", "diproses", atau "ditolak".',
  }),
  universitas: joi.string().max(255).optional().messages({
    'string.base': 'Universitas harus berupa teks.',
    'string.max': 'Universitas maksimal {#limit} karakter.',
  }),
  id_lowongan: joi.string().uuid().optional().messages({
    'string.base': 'ID lowongan magang harus berupa teks.',
    'string.guid': 'Format ID lowongan magang tidak valid.',
  }),
});

const statisticModel = joi.object().keys({
  batch: joi.number().integer().min(1).optional().messages({
    'number.base': 'Batch harus berupa angka.',
    'number.min': 'Batch minimal adalah {#limit}.',
  }),
});

module.exports = {
  createLamaranMagangModel,
  updateLamaranStatusModel,
  updateLamaranMagangModel,
  getAllLamaranMagangModel,
  statisticModel,
};
