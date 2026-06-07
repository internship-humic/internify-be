const axios = require('axios');
const path = require('path');
const { deleteFileIfExists } = require('../helpers/utils/fileHelper');
const { response } = require('../helpers/utils/wrapper');
const { SUCCESS, ERROR } = require('../helpers/http-status/status_code');

const verifyRecaptcha = async (req, res, next) => {
  const recaptchaToken = req.body?.['g-recaptcha-response'] || req.query?.['g-recaptcha-response'];

  const cv = req.files.cv?.[0]?.filename;
  const pdf = req.files.portofolio?.[0]?.filename;
  const files = [cv, pdf];

  if (!recaptchaToken) {
    await deleteFiles(files);
    return response(res, "fail", { err: 'Recaptcha token is missing' }, "Recaptcha Verification Failed", ERROR.BAD_REQUEST);
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
    )
    if (!response.data.success) {
      await deleteFiles(files);
      return res.status(400).json({ message: 'Recaptcha verification failed' });
    }
    return next();
  } catch (error) {
    console.error('Recaptcha verification error:', error);
    res.status(500).json({ message: 'Recaptcha verification failed' });
  }
};

async function deleteFiles(files) {
  for (const file of files) {
    if (file) {
      const fileName = path.basename(`/uploads/${file}`);
      await deleteFileIfExists(fileName);
    }
  }
}

module.exports = verifyRecaptcha;
