const express = require('express');
const { authController } = require('../modules/auth');
const { verifyJWT } = require('../middleware/verifyJWT');
const multer = require('../middleware/multer');
const { multerErrorHandler } = require('../middleware/multer');

const router = express.Router();

/**
 * @swagger
 * /auth-api/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth-api/me:
 *   get:
 *     summary: Get authenticated admin details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get admin details successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get admin successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nama_depan:
 *                       type: string
 *                       example: "John"
 *                     nama_belakang:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "admin@example.com"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *       401:
 *         description: Authorization header missing or invalid
 *       403:
 *         description: Invalid or expired token
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */
router.get("/me", verifyJWT, authController.me);

/**
 * @swagger
 * /auth-api/update-profile:
 *   patch:
 *     summary: Update authenticated user profile
 *     description: Update profile details (full name, email, password, professional bio). Admins can also upload a profile picture.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Jonathan Kristina"
 *               email:
 *                 type: string
 *                 example: "jonathan.kristina@example.com"
 *               password:
 *                 type: string
 *                 example: "newSecurePassword123"
 *               professional_bio:
 *                 type: string
 *                 example: "Experienced UI/UX Designer and Engineer"
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *                 description: Admin only. Optional profile picture upload.
 *     responses:
 *       200:
 *         description: Profile successfully updated
 *       400:
 *         description: Bad Request (Validation error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Interns uploading images)
 *       409:
 *         description: Conflict (Email already in use)
 *       500:
 *         description: Internal server error
 */
router.patch('/update-profile', verifyJWT, multer.single('profile_picture'), multerErrorHandler, authController.updateProfile);

module.exports = router; 