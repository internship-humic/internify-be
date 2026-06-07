const express = require('express');
const { feedbackController } = require('../modules/feedback');
const { verifyJWT } = require('../middleware/verifyJWT');
const isAdmin = require('../middleware/isAdmin');
const multer = require('../middleware/multer');
const { multerErrorHandler } = require('../middleware/multer');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nama:
 *           type: string
 *           example: "John Doe"
 *         universitas:
 *           type: string
 *           example: "Universitas Indonesia"
 *         pesan:
 *           type: string
 *           example: "Great internship experience!"
 *         batch:
 *           type: integer
 *           example: 3
 *         posisi:
 *           type: string
 *           example: "Back End Developer"
 *         tahun:
 *           type: integer
 *           example: 2025
 *         image_path:
 *           type: string
 *           example: "/uploads/feedback_image.png"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:00:00Z"
 */

/**
 * @swagger
 * /feedback-api/add:
 *   post:
 *     summary: Add a new feedback
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 description: Name of the person giving feedback
 *                 example: "John Doe"
 *               universitas:
 *                 type: string
 *                 description: University name
 *                 example: "Universitas Indonesia"
 *               pesan:
 *                 type: string
 *                 description: Feedback message
 *                 example: "Great experience during the internship"
 *               batch:
 *                 type: integer
 *                 description: Batch number
 *                 example: 3
 *               posisi:
 *                 type: string
 *                 description: Internship position
 *                 example: "Back End Developer"
 *               tahun:
 *                 type: integer
 *                 description: Year
 *                 example: 2025
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional feedback image
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       413:
 *         description: File size too large (max 5MB)
 *       417:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/add', multer.single('image'), multerErrorHandler, feedbackController.addFeedback);

/**
 * @swagger
 * /feedback-api/get:
 *   get:
 *     summary: Get all feedback with optional filters
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: batch
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter feedback by batch number
 *         example: 3
 *       - in: query
 *         name: tahun
 *         schema:
 *           type: integer
 *           minimum: 2000
 *           maximum: 2100
 *         description: Filter feedback by year
 *         example: 2025
 *     responses:
 *       200:
 *         description: Successfully retrieved feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Berhasil mengambil semua feedback"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feedback'
 *       417:
 *         description: Query parameter validation error
 *       500:
 *         description: Internal server error
 */
router.get('/get', feedbackController.getAllFeedback);

/**
 * @swagger
 * /feedback-api/get/{id}:
 *   get:
 *     summary: Get feedback by ID
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Successfully retrieved feedback
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
router.get('/get/:id', verifyJWT, isAdmin, feedbackController.getFeedbackById);

/**
 * @swagger
 * /feedback-api/update/{id}:
 *   patch:
 *     summary: Update feedback by ID
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Feedback ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 example: "John Doe"
 *               universitas:
 *                 type: string
 *                 example: "Universitas Indonesia"
 *               pesan:
 *                 type: string
 *                 example: "Updated feedback message"
 *               batch:
 *                 type: integer
 *                 example: 3
 *               posisi:
 *                 type: string
 *                 example: "Back End Developer"
 *               tahun:
 *                 type: integer
 *                 example: 2025
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional new image
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       404:
 *         description: Feedback not found
 *       413:
 *         description: File size too large (max 5MB)
 *       417:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.patch('/update/:id', verifyJWT, isAdmin, multer.single('image'), multerErrorHandler, feedbackController.updateFeedback);

/**
 * @swagger
 * /feedback-api/delete/{id}:
 *   delete:
 *     summary: Delete feedback by ID
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', verifyJWT, isAdmin, feedbackController.deleteFeedback);

module.exports = router;
