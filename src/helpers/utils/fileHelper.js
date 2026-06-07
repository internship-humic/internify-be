const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

async function deleteFileIfExists(fileName) {
  try {
    const uploadDir = process.env.NODE_ENV === 'production'
      ? '/tmp/uploads'
      : path.join(__dirname, '..', '..', 'uploads');

    const fullPath = path.join(uploadDir, fileName);
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    console.log(`File dihapus: ${fullPath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`File tidak ditemukan: ${fileName}`);
    } else {
      console.error(`Gagal menghapus file (${fileName}):`, err.message);
    }
  }
}

function checkFileExists(filePath) {
  try {
    if (!filePath) return false;

    const uploadDir = process.env.NODE_ENV === 'production'
      ? '/tmp/uploads'
      : path.join(__dirname, '..', '..', 'uploads');

    const fileName = path.basename(filePath);
    const fullPath = path.join(uploadDir, fileName);

    return fsSync.existsSync(fullPath);
  } catch (err) {
    console.error(`Error checking file existence: ${err.message}`);
    return false;
  }
}

function validateImagePath(imagePath) {
  if (!imagePath) return null;

  const fileExists = checkFileExists(imagePath);
  return fileExists ? imagePath : null;
}

module.exports = {
  deleteFileIfExists,
  checkFileExists,
  validateImagePath
};
