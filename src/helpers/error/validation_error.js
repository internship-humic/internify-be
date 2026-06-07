class ValidationError extends Error {
  constructor(message, errors) {
    super(message || 'Validation Error');
    this.errors = errors
  }
}

module.exports = ValidationError;