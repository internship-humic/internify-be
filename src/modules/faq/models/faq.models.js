const joi = require('joi');

const createFaqModel = joi.object({
  pertanyaan: joi.string().required().messages({
    'string.base': 'Pertanyaan harus berupa teks.',
    'any.required': 'Pertanyaan wajib diisi.',
  }),
  jawaban: joi.string().required().messages({
    'string.base': 'Jawaban harus berupa teks.',
    'any.required': 'Jawaban wajib diisi.',
  }),
});

const updateFaqModel = joi.object({
  pertanyaan: joi.string().messages({
    'string.base': 'Pertanyaan harus berupa teks.',
  }),
  jawaban: joi.string().messages({
    'string.base': 'Jawaban harus berupa teks.',
  }),
});

module.exports = {
  createFaqModel,
  updateFaqModel,
};
