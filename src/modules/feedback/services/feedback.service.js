const path = require('path');
const feedbackRepository = require('../repositories/feedback.repository');
const imageUploadHelper = require('../../../helpers/utils/imageUpload.helper');
const { deleteFileIfExists } = require('../../../helpers/utils/fileHelper');
const { data, error } = require('../../../helpers/utils/wrapper');
const { NotFoundError } = require('../../../helpers/error');

class FeedbackService {
  async createFeedback(feedbackData, imageFile) {
    try {
      const imagePath = imageUploadHelper.uploadImage(imageFile);

      const newFeedbackData = {
        ...feedbackData,
        image_path: imagePath,
      };

      const result = await feedbackRepository.create(newFeedbackData);
      return data(result);
    } catch (err) {
      if (imageFile?.filename) {
        try {
          await deleteFileIfExists(imageFile.filename);
        } catch (cleanupErr) {
          console.error('Failed to cleanup file:', cleanupErr);
        }
      }
      return error(err);
    }
  }

  async getAllFeedback(query = {}) {
    try {
      const feedbackList = await feedbackRepository.findAllWithFilters(query);

      if (feedbackList.length === 0) {
        return data([]);
      }

      return data(feedbackList);
    } catch (err) {
      return error(err);
    }
  }

  async getFeedbackById(id) {
    try {
      const feedback = await feedbackRepository.findById(id);

      if (!feedback) {
        return error(new NotFoundError('Feedback tidak ditemukan'));
      }

      return data(feedback);
    } catch (err) {
      return error(err);
    }
  }

  async updateFeedback(id, feedbackData, imageFile) {
    let oldImagePath = null;
    let newImageUploaded = false;

    try {
      const checkResult = await this.getFeedbackById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const existingFeedback = checkResult.data;

      if (imageFile) {
        oldImagePath = existingFeedback.image_path;

        feedbackData.image_path = imageUploadHelper.uploadImage(imageFile);
        newImageUploaded = true;

        if (oldImagePath) {
          const oldFileName = path.basename(oldImagePath);
          await deleteFileIfExists(oldFileName);
        }
      }

      const result = await feedbackRepository.updateById(id, feedbackData);
      return data(result);
    } catch (err) {
      if (newImageUploaded && imageFile?.filename) {
        try {
          await deleteFileIfExists(imageFile.filename);
        } catch (cleanupErr) {
          console.error('Failed to cleanup new file:', cleanupErr);
        }
      }
      return error(err);
    }
  }

  async deleteFeedback(id) {
    try {
      const checkResult = await this.getFeedbackById(id);
      if (checkResult.err) {
        return checkResult;
      }

      const feedback = checkResult.data;

      if (feedback.image_path) {
        const fileName = path.basename(feedback.image_path);
        await deleteFileIfExists(fileName);
      }

      const result = await feedbackRepository.deleteById(id);
      return data(result);
    } catch (err) {
      return error(err);
    }
  }
}

module.exports = new FeedbackService();
