const wrapper = require('./wrapper');
const { ValidationError } = require('../error');

const isValidPayload = (payload, model) => {
  const { value, error } = model.validate(payload, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    let errors = {};
    error.details.forEach(element => {
      errors[element.path[0]] = element.message;
    });

    return wrapper.error(new ValidationError('Validation Error', errors));
  }

  return { err: null, data: value };
};

module.exports = {
  isValidPayload,
};
