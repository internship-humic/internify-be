const batchController = require('./controllers/batch.controller');
const batchService = require('./services/batch.service');
const batchRepository = require('./repositories/batch.repository');

module.exports = {
  batchController,
  batchService,
  batchRepository,
};
