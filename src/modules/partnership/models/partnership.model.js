const joi = require('joi');

const createPartnershipModel = joi.object().keys({
  nama_partner: joi.string().max(255).required().messages({
    'string.base': 'Nama partner harus berupa teks.',
    'string.empty': 'Nama partner tidak boleh kosong.',
    'string.max': 'Nama partner maksimal {#limit} karakter.',
    'any.required': 'Nama partner wajib diisi.',
  }),

  image_path: joi.string().optional().allow('', null).messages({
    'string.base': 'Path gambar harus berupa teks.',
  }),
});

const updatePartnershipModel = joi.object().keys({
  nama_partner: joi.string().max(255).optional().messages({
    'string.base': 'Nama partner harus berupa teks.',
    'string.max': 'Nama partner maksimal {#limit} karakter.',
  }),

  image_path: joi.string().optional().allow('', null).messages({
    'string.base': 'Path gambar harus berupa teks.',
  }),
});

module.exports = {
  createPartnershipModel,
  updatePartnershipModel,
};
