const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');

const cleanupUploadedFiles = async (files) => {
  if (files?.cv?.filename) {
    await deleteFileIfExists(files.cv.filename);
  }
  if (files?.portofolio?.filename) {
    await deleteFileIfExists(files.portofolio.filename);
  }
};

module.exports = {
  cleanupUploadedFiles,
};