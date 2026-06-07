joi = require('joi');

const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

const createHasilResearchModel = joi.object().keys({
  nama_project: joi.string().max(255).required().messages({
    'string.base': 'Nama project harus berupa teks.',
    'string.empty': 'Nama project tidak boleh kosong.',
    'string.max': 'Nama project maksimal {#limit} karakter.',
    'any.required': 'Nama project wajib diisi.',
  }),

  deskripsi: joi.string().required().messages({
    'string.base': 'Deskripsi harus berupa teks.',
    'string.empty': 'Deskripsi tidak boleh kosong.',
    'any.required': 'Deskripsi wajib diisi.',
  }),

  link_project: joi.string().pattern(urlRegex).optional().allow('', null).messages({
    'string.base': 'Link project harus berupa teks.',
    'string.pattern.base': 'Format URL tidak valid.',
  }),

  image_path: joi.string().optional().allow('', null).messages({
    'string.base': 'Path gambar harus berupa teks.',
  }),
});

const updateHasilResearchModel = joi.object().keys({
  nama_project: joi.string().max(255).optional().messages({
    'string.base': 'Nama project harus berupa teks.',
    'string.max': 'Nama project maksimal {#limit} karakter.',
  }),

  deskripsi: joi.string().optional().messages({
    'string.base': 'Deskripsi harus berupa teks.',
  }),

  link_project: joi.string().pattern(urlRegex).optional().allow('', null).messages({
    'string.base': 'Link project harus berupa teks.',
    'string.pattern.base': 'Format URL tidak valid.',
  }),

  image_path: joi.string().optional().allow('', null).messages({
    'string.base': 'Path gambar harus berupa teks.',
  }),
});

module.exports = {
  createHasilResearchModel,
  updateHasilResearchModel,
};
