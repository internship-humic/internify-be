const faqRepository = require('../repositories/faq.repositories');
const { data, error } = require('../../../helpers/utils/wrapper');
const { NotFoundError, BadRequestError } = require('../../../helpers/error');

class FaqService {
  async createFaq(faqData) {
    try {
      const result = await faqRepository.create(faqData);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async getAllFaq() {
    try {
      const results = await faqRepository.findAll();
      return data(results);
    } catch (err) {
      return error(err);
    }
  }

  async getFaqById(id) {
    try {
      const result = await faqRepository.findById(id);

      if (!result) {
        return error(new NotFoundError('FAQ Tidak Ditemukan'));
      }

      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async updateFaq(id, faqData) {
    try {
      const checkResult = await this.getFaqById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const result = await faqRepository.updateById(id, faqData);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }

  async deleteFaq(id) {
    try {
      const checkResult = await this.getFaqById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const result = await faqRepository.deleteById(id);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }
}

module.exports = new FaqService();
