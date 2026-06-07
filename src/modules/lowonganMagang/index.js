const lowonganMagangController = require('./controllers/lowonganMagang.controller');
const lowonganMagangService = require('./services/lowonganMagang.service');
const lowonganMagangRepository = require('./repositories/lowonganMagang.repository');
const statusHelper = require('./helpers/status.helper');

module.exports = {
  lowonganMagangController,
  lowonganMagangService,
  lowonganMagangRepository,
  statusHelper
};
