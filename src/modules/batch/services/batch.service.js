const batchRepository = require('../repositories/batch.repository');
const { data, error } = require('../../../helpers/utils/wrapper');
const { NotFoundError, ConflictError } = require('../../../helpers/error');

class BatchService {
  async createBatch(batchData) {
    try {
      let batchNumber;

      if (batchData.batch_number) {
        const existingBatch = await batchRepository.findByBatchNumber(batchData.batch_number);
        if (existingBatch) {
          return error(new ConflictError('Nomor batch sudah digunakan'));
        }
        batchNumber = batchData.batch_number;
      } else {
        const latestBatch = await batchRepository.findLatestBatch();
        batchNumber = latestBatch ? latestBatch.batch_number + 1 : 1;
      }

      await batchRepository.deactivateAllBatches();

      const newBatchData = {
        ...batchData,
        batch_number: batchNumber,
        is_active: true,
      };

      const result = await batchRepository.create(newBatchData);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async getAllBatches() {
    try {
      const batchList = await batchRepository.findAll();
      return data(batchList);
    } catch (err) {
      return error(err);
    }
  }

  async switchBatch(batch_number) {
    try {
      const batch = await batchRepository.findByBatchNumber(batch_number);

      if (!batch) {
        return error(new NotFoundError('Batch tidak ditemukan'));
      }

      await batchRepository.deactivateAllBatches();

      const result = await batchRepository.updateById(batch.id, { is_active: true });
      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async getBatchById(id) {
    try {
      const batch = await batchRepository.findById(id);

      if (!batch) {
        return error(new NotFoundError('Batch tidak ditemukan'));
      }

      return data(batch);
    } catch (err) {
      return error(err);
    }
  }

  async updateBatch(id, batchData) {
    try {
      const checkResult = await this.getBatchById(id);
      if (checkResult.err) {
        return checkResult;
      }
      console.log(batchData, id);

      const existingBatch = checkResult.data;

      if (batchData.batch_number && batchData.batch_number !== existingBatch.batch_number) {
        const duplicateBatch = await batchRepository.findByBatchNumber(batchData.batch_number);
        if (duplicateBatch) {
          return error(new ConflictError('Nomor batch sudah digunakan'));
        }
      }

      if (batchData.is_active === true) {
        await batchRepository.deactivateAllBatches();
      }

      const result = await batchRepository.updateById(id, batchData);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async deleteBatch(id) {
    try {
      const checkResult = await this.getBatchById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const result = await batchRepository.deleteById(id);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }
}

module.exports = new BatchService();
