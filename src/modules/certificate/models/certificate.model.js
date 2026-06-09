const joi = require('joi');

const claimCertificateModel = joi.object().keys({
  id_project: joi.number().integer().required().messages({
    'number.base': 'Project ID harus berupa angka.',
    'number.integer': 'Project ID harus berupa bilangan bulat.',
    'any.required': 'Project ID wajib diisi.',
  }),
});

module.exports = {
  claimCertificateModel,
};
