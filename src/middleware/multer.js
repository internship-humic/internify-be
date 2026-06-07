const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { response } = require('../helpers/utils/wrapper')

const uploadDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const errMsg = 'Can only upload images (jpeg, jpg, png) or PDF files';
    req.fileValidationError = errMsg;
    cb(new Error(errMsg), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// middleware untuk ngechek ukuran file 
const checkFileSizes = (req, res, next) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const errors = {};
  const filesToDelete = [];

  const allFiles = [];
  // ini untuk 1 file
  if (req.file) allFiles.push(req.file);

  // ini untuk multiple files
  if (req.files) {
    if (Array.isArray(req.files)) {
      allFiles.push(...req.files);
    } else {
      Object.values(req.files).flat().forEach(file => allFiles.push(file));
    }
  }

  allFiles.forEach(file => {
    if (file.size > maxSize) {
      errors[file.fieldname] = `Ukuran file ${file.fieldname} terlalu besar. Maksimal 5MB`;
    }
    filesToDelete.push(file.path);
  });

  // ini untuk jika ada error maka file yang terupload dihapus
  if (Object.keys(errors).length > 0) {
    filesToDelete.forEach(filePath => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    return res.status(413).json({
      status: false,
      data: null,
      message: errors,
      code: 413,
    });
  }

  next();
};


// middleware untuk error multer
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: false,
        data: null,
        message: {
          [err.field]: `Field '${err.field}' tidak boleh memiliki lebih dari 1 file.`,
        },
        code: 400,
      });
    }

    return res.status(400).json({
      status: false,
      data: null,
      message: err.message,
      code: 400,
    });
  }

  if (err) {
    return res.status(400).json({
      status: false,
      data: null,
      message: err.message || 'Error saat upload file',
      code: 400,
    });
  }

  next();
};

module.exports = upload;
module.exports.multerErrorHandler = multerErrorHandler;
module.exports.checkFileSizes = checkFileSizes;
