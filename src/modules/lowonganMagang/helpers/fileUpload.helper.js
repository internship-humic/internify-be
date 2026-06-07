class FileUploadHelper {
  uploadImage(file) {
    if (!file) {
      throw new Error('Please upload an image!');
    }

    const filePath = `/uploads/${file.filename}`;
    return filePath;
  }

  validateImage(file) {
    if (!file) {
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    return allowedTypes.includes(file.mimetype);
  }
}

module.exports = new FileUploadHelper();
