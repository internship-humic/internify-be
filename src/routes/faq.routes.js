const express = require('express');
const { faqController } = require('../modules/faq');
const { verifyJWT } = require('../middleware/verifyJWT');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FAQ:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         pertanyaan:
 *           type: string
 *           example: "Bagaimana cara mendaftar magang?"
 *         jawaban:
 *           type: string
 *           example: "Anda dapat mendaftar melalui halaman lowongan magang yang tersedia."
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-11-10T10:00:00Z"
 */

/**
 * @swagger
 * /faq-api/get:
 *   get:
 *     summary: Get all FAQ
 *     tags: [FAQ]
 *     responses:
 *       200:
 *         description: Successfully retrieved all FAQ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FAQ'
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       404:
 *         description: No FAQ found
 *       500:
 *         description: Internal server error
 */
router.get('/get', faqController.getAllFaq);

/**
 * @swagger
 * /faq-api/get/{id}:
 *   get:
 *     summary: Get FAQ by ID
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The FAQ ID
 *     responses:
 *       200:
 *         description: Successfully retrieved FAQ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FAQ'
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Internal server error
 */
router.get('/get/:id', faqController.getFaqById);

/**
 * @swagger
 * /faq-api/add:
 *   post:
 *     summary: Create a new FAQ
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pertanyaan
 *               - jawaban
 *             properties:
 *               pertanyaan:
 *                 type: string
 *                 example: "Bagaimana cara mendaftar magang?"
 *               jawaban:
 *                 type: string
 *                 example: "Anda dapat mendaftar melalui halaman lowongan magang yang tersedia."
 *     responses:
 *       200:
 *         description: FAQ created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FAQ'
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       417:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/add', verifyJWT, isAdmin, faqController.addFaq);

/**
 * @swagger
 * /faq-api/update/{id}:
 *   patch:
 *     summary: Update an existing FAQ
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The FAQ ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pertanyaan:
 *                 type: string
 *                 example: "Bagaimana cara mendaftar magang?"
 *               jawaban:
 *                 type: string
 *                 example: "Anda dapat mendaftar melalui halaman lowongan magang yang tersedia."
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FAQ'
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       404:
 *         description: FAQ not found
 *       417:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.patch('/update/:id', verifyJWT, isAdmin, faqController.updateFaq);

/**
 * @swagger
 * /faq-api/delete/{id}:
 *   delete:
 *     summary: Delete an FAQ
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The FAQ ID
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "FAQ berhasil dihapus"
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 code:
 *                   type: integer
 *                   example: 200
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', verifyJWT, isAdmin, faqController.deleteFaq);

module.exports = router;
