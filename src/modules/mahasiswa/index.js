const mahasiswaController = require('./controllers/mahasiswa.controller');
const mahasiswaService = require('./services/mahasiswa.service');
const mahasiswaRepository = require('./repositories/mahasiswa.repository');

module.exports = {
  mahasiswaController,
  mahasiswaService,
  mahasiswaRepository
};
