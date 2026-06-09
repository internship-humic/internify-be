const multer = require('multer');
const path = require('path');
const fs = require('fs');

const baseUploadDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : path.join(__dirname, '../../uploads');

const taskUploadDir = path.join(baseUploadDir, 'task-submissions');

if (!fs.existsSync(taskUploadDir)) {
  fs.mkdirSync(taskUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, taskUploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const allowedMimeTypes = [
  'application/pdf',
  // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // 'application/zip',
  // 'application/x-zip-compressed',
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  // const errMsg = 'Only PDF, DOCX, or ZIP files are allowed';
  const errMsg = 'Only PDF files are allowed';
  req.fileValidationError = errMsg;
  cb(new Error(errMsg), false);
};

const taskUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, //2MB
  },
});

const taskUploadErrorHandler = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        status: false,
        data: null,
        message: 'File size is too large. Maximum size is 2MB',
        code: 413,
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: false,
        data: null,
        message: {
          [err.field]: `Field '${err.field}' cannot have more than 1 file.`,
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
      message: err.message || 'Error while uploading file',
      code: 400,
    });
  }

  next();
};

module.exports = {
  taskUpload,
  taskUploadErrorHandler,
};
