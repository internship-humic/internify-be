const express = require('express');
const { lamaranMagangController } = require('../modules/lamaranMagang');
const multer = require('../middleware/multer');
const { multerErrorHandler, checkFileSizes } = require('../middleware/multer');
const { verifyJWT } = require('../middleware/verifyJWT');
const isAdmin = require('../middleware/isAdmin');
const verifyRecaptcha = require('../middleware/recaptcha');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LamaranMagang:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_lamaran_magang:
 *           type: integer
 *           example: 7
 *         nama_depan:
 *           type: string
 *           example: "Wowo"
 *         nama_belakang:
 *           type: string
 *           example: "Wewe"
 *         email:
 *           type: string
 *           example: "yntkts@example.com"
 *         kontak:
 *           type: string
 *           example: "08123456789"
 *         jurusan:
 *           type: string
 *           example: "Informatika"
 *         motivasi:
 *           type: string
 *           example: "I want to gain experience in back end development."
 *         relevant_skills:
 *           type: string
 *           example: "JavaScript, Node.js"
 *         cv_path:
 *           type: string
 *           example: "/uploads/cv.pdf"
 *         portofolio_path:
 *           type: string
 *           example: "/uploads/portofolio.pdf"
 *         posisi:
 *           type: string
 *           example: "Backend Developer"
 *         kelompok_peminatan:
 *           type: string
 *           example: "Software Engineering"
 *         status:
 *           type: string
 *           enum: [diproses, diterima, ditolak]
 *           example: "diproses"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-05-12T10:00:00Z"
 */

/**
 * @swagger
 * /lamaran-magang-api/add/{id_lowongan_magang}:
 *   post:
 *     summary: Create a new lamaran magang (internship application)
 *     tags: [Lamaran Magang]
 *     parameters:
 *       - in: path
 *         name: id_lowongan_magang
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID (string) of the lowongan magang (internship)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               g-recaptcha-response:
 *                 type: string
 *                 description: "This field requests the TOKEN GENERATED when the user completes the recaptcha, NOT THE SITE KEY. Refer to the reCAPTCHA v2 docs"
 *               nama_depan:
 *                 type: string
 *               nama_belakang:
 *                 type: string
 *                 nullable: true
 *                 description: Optional, can be left empty
 *               email:
 *                 type: string
 *               kontak:
 *                 type: string
 *               jurusan:
 *                 type: string
 *               motivasi:
 *                 type: string
 *               relevant_skills:
 *                 type: string
 *               cv:
 *                 type: string
 *                 format: binary
 *               portofolio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Lamaran magang created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internship application submitted successfully."
 *                 data:
 *                   $ref: '#/components/schemas/LamaranMagang'
 *       400:
 *         description: Invalid reCAPTCHA or unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "reCAPTCHA validation failed"
 *                 error:
 *                   type: array
 *                   example: ["invalid-input-response"]
 *       413:
 *         description: File size too large (max 5MB)
 *       500:
 *         description: Internal server error
 */
router.post(
  '/add/:id_lowongan_magang',
  multer.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'portofolio', maxCount: 1 },
  ]),
  checkFileSizes,
  multerErrorHandler,
  // verifyRecaptcha, // multer dulu baru verify gegara datanya mesti diparse sama multer
  lamaranMagangController.addLamaranMagang
);

/**
 * @swagger
 * /lamaran-magang-api/add-mobile/{id_lowongan_magang}:
 *   post:
 *     summary: Create a new lamaran magang (internship application) without recaptcha
 *     tags: [Lamaran Magang]
 *     parameters:
 *       - in: path
 *         name: id_lowongan_magang
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID (string) of the lowongan magang (internship)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama_depan:
 *                 type: string
 *               nama_belakang:
 *                 type: string
 *                 nullable: true
 *                 description: Optional, can be left empty
 *               email:
 *                 type: string
 *               kontak:
 *                 type: string
 *               jurusan:
 *                 type: string
 *               motivasi:
 *                 type: string
 *               relevant_skills:
 *                 type: string
 *               cv:
 *                 type: string
 *                 format: binary
 *               portofolio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Lamaran magang created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internship application submitted successfully."
 *                 data:
 *                   $ref: '#/components/schemas/LamaranMagang'
 *       404:
 *         description: lowongan_magang id not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internship vacancy not found"
 *                 error:
 *                   type: array
 *                   example: ["invalid-input-response"]
 *       413:
 *         description: File size too large (max 5MB)
 *       500:
 *         description: Internal server error
 */
router.post(
  '/add-mobile/:id_lowongan_magang',
  multer.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'portofolio', maxCount: 1 },
  ]),
  checkFileSizes,
  multerErrorHandler,
  lamaranMagangController.addLamaranMagang
);

/**
 * @swagger
 * /lamaran-magang-api/get:
 *   get:
 *     summary: Get all lamaran magang
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page (default 10)
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [diproses, diterima, ditolak]
 *         description: Filter by application status
 *         example: diterima
 *       - in: query
 *         name: posisi
 *         schema:
 *           type: string
 *         description: Filter by internship position
 *         example: Backend Developer
 *       - in: query
 *         name: universitas
 *         schema:
 *           type: string
 *         description: Filter by university name
 *         example: Universitas Indonesia
 *     responses:
 *       200:
 *         description: Successfully retrieved all lamaran magang
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LamaranMagang'
 *       404:
 *         description: No lamaran magang found
 *       417:
 *         description: Validation error in query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/get', verifyJWT, isAdmin, lamaranMagangController.getAllLamaranMagang);

/**
 * @swagger
 * /lamaran-magang-api/get/{id_lamaran_magang}:
 *   get:
 *     summary: Get lamaran magang by ID
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_lamaran_magang
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lamaran magang (internship)
 *     responses:
 *       200:
 *         description: Successfully retrieved lamaran magang
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LamaranMagang'
 *       404:
 *         description: No lamaran magang found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/get/:id_lamaran_magang',
  verifyJWT,
  lamaranMagangController.getLamaranByID
);

/**
 * @swagger
 * /lamaran-magang-api/update/{id_lamaran_magang}:
 *   patch:
 *     summary: Update the status of a lamaran magang
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_lamaran_magang
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lamaran magang
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "diterima"
 *     responses:
 *       200:
 *         description: Status lamaran magang updated successfully
 *       404:
 *         description: Unauthorized or lamaran magang not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/update/:id_lamaran_magang',
  verifyJWT,
  isAdmin,
  lamaranMagangController.updateStatusLamaran
);

/**
 * @swagger
 * /lamaran-magang-api/export:
 *   get:
 *     summary: Export all internship applications to Excel
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel file generated successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access."
 *       500:
 *         description: Error generating Excel file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error generating Excel file"
 */
router.get('/export', verifyJWT, isAdmin, lamaranMagangController.exportLamaranToExcel);

/**
 * @swagger
 * /lamaran-magang-api/delete/{id}:
 *   delete:
 *     summary: Delete a specific lamaran magang by ID (including CV and portfolio files)
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lamaran magang to delete
 *     responses:
 *       200:
 *         description: Lamaran magang deleted successfully
 *       403:
 *         description: "Access denied: Only admins can access this route"
 *       404:
 *         description: Lamaran magang not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', verifyJWT, isAdmin, lamaranMagangController.deleteLamaran);

/**
 * @swagger
 * /lamaran-magang-api/delete:
 *   delete:
 *     summary: Delete all internship applications, students, and their files
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All student data, applications, and files were successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All student data, applications, and files were successfully deleted.
 *       500:
 *         description: Failed to delete all data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to delete all data.
 *                 error:
 *                   type: string
 */
// router.delete("/delete", verifyJWT, lamaranMagangController.deleteAllLamaranMagang); // Method doesn't exist

/**
 * @swagger
 * /lamaran-magang-api/statistics/dashboard:
 *   get:
 *     summary: Get dashboard statistics (total applicants, accepted, rejected, pending)
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     total_pendaftar:
 *                       type: integer
 *                       example: 400
 *                     total_diterima:
 *                       type: integer
 *                       example: 150
 *                     total_ditolak:
 *                       type: integer
 *                       example: 250
 *                     sedang_diproses:
 *                       type: integer
 *                       example: 400
 *                     acceptance_rate:
 *                       type: string
 *                       example: "43.7%"
 *                     rejection_rate:
 *                       type: string
 *                       example: "31.3%"
 *                     pending_rate:
 *                       type: string
 *                       example: "25.0%"
 *                 message:
 *                   type: string
 *                   example: "Statistik dashboard berhasil diambil"
 *       500:
 *         description: Internal server error
 */
router.get('/statistics/dashboard', verifyJWT, isAdmin, lamaranMagangController.getDashboardStatistics);

/**
 * @swagger
 * /lamaran-magang-api/statistics/position:
 *   get:
 *     summary: Get statistics grouped by position
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Position statistics retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       posisi:
 *                         type: string
 *                         example: "Backend Developer"
 *                       total:
 *                         type: integer
 *                         example: 150
 *                       diterima:
 *                         type: integer
 *                         example: 50
 *                       ditolak:
 *                         type: integer
 *                         example: 100
 *       500:
 *         description: Internal server error
 */
router.get('/statistics/position', verifyJWT, isAdmin, lamaranMagangController.getStatisticsByPosition);

/**
 * @swagger
 * /lamaran-magang-api/statistics/country:
 *   get:
 *     summary: Get statistics grouped by country
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: batch
 *         schema:
 *           type: integer
 *         description: Filter by batch number
 *         example: 1
 *     responses:
 *       200:
 *         description: Country statistics retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       negara:
 *                         type: string
 *                         example: "Indonesia"
 *                       total:
 *                         type: integer
 *                         example: 200
 *                       diterima:
 *                         type: integer
 *                         example: 80
 *                       ditolak:
 *                         type: integer
 *                         example: 70
 *                       diproses:
 *                         type: integer
 *                         example: 50
 *       500:
 *         description: Internal server error
 */
router.get('/statistics/country', verifyJWT, isAdmin, lamaranMagangController.getStatisticsByCountry);

/**
 * @swagger
 * /lamaran-magang-api/statistics/university:
 *   get:
 *     summary: Get statistics grouped by university
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: batch
 *         schema:
 *           type: integer
 *         description: Filter by batch number
 *         example: 1
 *     responses:
 *       200:
 *         description: University statistics retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       universitas:
 *                         type: string
 *                         example: "Universitas Indonesia"
 *                       total:
 *                         type: integer
 *                         example: 150
 *                       diterima:
 *                         type: integer
 *                         example: 60
 *                       ditolak:
 *                         type: integer
 *                         example: 50
 *                       diproses:
 *                         type: integer
 *                         example: 40
 *                 message:
 *                   type: string
 *                   example: "Statistik per universitas berhasil diambil"
 *       404:
 *         description: No data found for the specified batch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Tidak ada data lamaran ditemukan pada batch 1"
 *       500:
 *         description: Internal server error
 */
router.get('/statistics/university', verifyJWT, isAdmin, lamaranMagangController.getStatisticsByUniversity);



module.exports = router;