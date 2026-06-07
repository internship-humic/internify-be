const { BadRequestError } = require('../error');

class ImageUploadHelper {
  uploadImage(file) {
    if (!file) {
      throw new BadRequestError('Please upload an image!');
    }
    return `/uploads/${file.filename}`;
  }

  uploadCV(file) {
    if (!file) {
      throw new BadRequestError('Please upload your CV');
    }
    return `/uploads/${file.filename}`;
  }

  uploadPortofolio(file) {
    if (!file) {
      throw new BadRequestError('Please upload your portfolio');
    }
    return `/uploads/${file.filename}`;
  }

  validateImage(file) {
    if (!file) {
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    return allowedTypes.includes(file.mimetype);
  }

  validatePDF(file) {
    if (!file) {
      return false;
    }

    const allowedTypes = ['application/pdf'];
    return allowedTypes.includes(file.mimetype);
  }

  validateDocument(file) {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(file.mimetype);
  }
}

module.exports = new ImageUploadHelper();
