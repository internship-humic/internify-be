const joi = require('joi');

const createLowonganMagangModel = joi.object().keys({
  posisi: joi.string().max(255).required().messages({
    'string.base': 'Posisi harus berupa teks.',
    'string.empty': 'Posisi tidak boleh kosong.',
    'string.max': 'Posisi maksimal {#limit} karakter.',
    'any.required': 'Posisi wajib diisi.',
  }),

  kelompok_peminatan: joi.string().max(255).required().messages({
    'string.base': 'Kelompok peminatan harus berupa teks.',
    'string.empty': 'Kelompok peminatan tidak boleh kosong.',
    'string.max': 'Kelompok peminatan maksimal {#limit} karakter.',
    'any.required': 'Kelompok peminatan wajib diisi.',
  }),

  jobdesk: joi.string().required().messages({
    'string.base': 'Jobdesk harus berupa teks.',
    'string.empty': 'Jobdesk tidak boleh kosong.',
    'any.required': 'Jobdesk wajib diisi.',
  }),

  lokasi: joi.string().max(255).required().messages({
    'string.base': 'Lokasi harus berupa teks.',
    'string.empty': 'Lokasi tidak boleh kosong.',
    'string.max': 'Lokasi maksimal {#limit} karakter.',
    'any.required': 'Lokasi wajib diisi.',
  }),

  kualifikasi: joi.string().required().messages({
    'string.base': 'Kualifikasi harus berupa teks.',
    'string.empty': 'Kualifikasi tidak boleh kosong.',
    'any.required': 'Kualifikasi wajib diisi.',
  }),

  benefit: joi.string().required().messages({
    'string.base': 'Benefit harus berupa teks.',
    'string.empty': 'Benefit tidak boleh kosong.',
    'any.required': 'Benefit wajib diisi.',
  }),

  durasi_awal: joi.date().required().messages({
    'date.base': 'Durasi awal harus berupa tanggal yang valid.',
    'any.required': 'Durasi awal wajib diisi.',
  }),

  durasi_akhir: joi.date().min(joi.ref('durasi_awal')).required().messages({
    'date.base': 'Durasi akhir harus berupa tanggal yang valid.',
    'date.min': 'Durasi akhir harus setelah atau sama dengan durasi awal.',
    'any.required': 'Durasi akhir wajib diisi.',
  }),

  paid: joi.string().valid('paid', 'unpaid').required().messages({
    'string.empty': 'Status paid tidak boleh kosong.',
    'string.base': 'Status paid harus berupa teks.',
    'any.only': 'Status paid hanya boleh "paid" atau "unpaid".',
    'any.required': 'Status paid wajib diisi.',
  }),

  batch: joi.number().integer().min(1).optional().messages({
    'number.base': 'Batch harus berupa angka.',
    'number.integer': 'Batch harus berupa bilangan bulat.',
    'number.min': 'Batch minimal {#limit}.',
  }),

  image_path: joi.string().optional().allow('', null).messages({
    'string.base': 'Path gambar harus berupa teks.',
  }),
});

const updateLowonganMagangModel = joi.object().keys({
  posisi: joi.string().max(255).optional().messages({
    'string.base': 'Posisi harus berupa teks.',
    'string.max': 'Posisi maksimal {#limit} karakter.',
  }),

  kelompok_peminatan: joi.string().max(255).optional().messages({
    'string.base': 'Kelompok peminatan harus berupa teks.',
    'string.max': 'Kelompok peminatan maksimal {#limit} karakter.',
  }),

  jobdesk: joi.string().optional().messages({
    'string.base': 'Jobdesk harus berupa teks.',
  }),

  lokasi: joi.string().max(255).optional().messages({
    'string.base': 'Lokasi harus berupa teks.',
    'string.max': 'Lokasi maksimal {#limit} karakter.',
  }),

  kualifikasi: joi.string().optional().messages({
    'string.base': 'Kualifikasi harus berupa teks.',
  }),

  benefit: joi.string().optional().messages({
    'string.base': 'Benefit harus berupa teks.',
  }),

  durasi_awal: joi.date().optional().messages({
    'date.base': 'Durasi awal harus berupa tanggal yang valid.',
  }),

  durasi_akhir: joi.date().min(joi.ref('durasi_awal')).optional().messages({
    'date.base': 'Durasi akhir harus berupa tanggal yang valid.',
    'date.min': 'Durasi akhir harus setelah atau sama dengan durasi awal.',
  }),

  paid: joi.string().valid('paid', 'unpaid').optional().messages({
    'string.base': 'Status paid harus berupa teks.',
    'any.only': 'Status paid hanya boleh "paid" atau "unpaid".',
  }),

  batch: joi.number().integer().min(1).optional().messages({
    'number.base': 'Batch harus berupa angka.',
    'number.integer': 'Batch harus berupa bilangan bulat.',
    'number.min': 'Batch minimal {#limit}.',
  }),

  image_path: joi.string().optional().allow('', null).messages({
    'string.base': 'Path gambar harus berupa teks.',
  }),
});

module.exports = {
  createLowonganMagangModel,
  updateLowonganMagangModel,
};
