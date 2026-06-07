const express = require('express');
const { batchController } = require('../modules/batch');
const { verifyJWT } = require('../middleware/verifyJWT');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Batch:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         batch_number:
 *           type: integer
 *           example: 1
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-01T00:00:00.000Z"
 *     BatchCreate:
 *       type: object
 *       properties:
 *         batch_number:
 *           type: integer
 *           description: Opsional - Nomor batch akan di-generate otomatis (batch terakhir + 1) jika tidak disediakan
 *           example: 1
 *         is_active:
 *           type: boolean
 *           description: Opsional - Batch baru akan otomatis aktif dan menonaktifkan batch sebelumnya
 *           example: true
 *     BatchUpdate:
 *       type: object
 *       properties:
 *         batch_number:
 *           type: integer
 *           example: 2
 *         is_active:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * tags:
 *   name: Batch
 *   description: API untuk mengelola batch magang
 */

/**
 * @swagger
 * /batch-api/add:
 *   post:
 *     summary: Membuat batch baru (auto-increment + auto-deactivate batch sebelumnya)
 *     description: Membuat batch baru dengan nomor batch otomatis (batch terakhir + 1), mengaktifkan batch baru, dan menonaktifkan semua batch sebelumnya
 *     tags: [Batch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchCreate'
 *           examples:
 *             auto:
 *               summary: Auto-generate batch (recommended)
 *               value: {}
 *             manual:
 *               summary: Manual batch number (optional)
 *               value:
 *                 batch_number: 5
 *     responses:
 *       201:
 *         description: Batch berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Batch berhasil dibuat"
 *                 data:
 *                   $ref: '#/components/schemas/Batch'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Batch berhasil dibuat"
 *                   data:
 *                     id: 1
 *                     batch_number: 6
 *                     is_active: true
 *                     created_at: "2025-11-17T00:00:00.000Z"
 *                     updated_at: "2025-11-17T00:00:00.000Z"
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki akses (bukan admin)
 *       409:
 *         description: Nomor batch sudah digunakan (jika manual)
 */
router.post('/add', verifyJWT, isAdmin, batchController.createBatch);

/**
 * @swagger
 * /batch-api/:
 *   get:
 *     summary: Mengambil semua batch
 *     description: Mendapatkan daftar semua batch yang tersedia, diurutkan berdasarkan nomor batch (descending)
 *     tags: [Batch]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil semua batch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Berhasil mengambil semua batch"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Batch'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Berhasil mengambil semua batch"
 *                   data:
 *                     - id: 3
 *                       batch_number: 3
 *                       is_active: true
 *                       created_at: "2025-11-17T00:00:00.000Z"
 *                       updated_at: "2025-11-17T00:00:00.000Z"
 *                     - id: 2
 *                       batch_number: 2
 *                       is_active: false
 *                       created_at: "2025-11-16T00:00:00.000Z"
 *                       updated_at: "2025-11-17T00:00:00.000Z"
 *                     - id: 1
 *                       batch_number: 1
 *                       is_active: false
 *                       created_at: "2025-11-15T00:00:00.000Z"
 *                       updated_at: "2025-11-16T00:00:00.000Z"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki akses (bukan admin)
 */
router.get('/', verifyJWT, isAdmin, batchController.getAllBatches);

/**
 * @swagger
 * /batch-api/{id}:
 *   put:
 *     summary: Memperbarui batch
 *     description: Memperbarui data batch. Jika is_active diset true, semua batch lain akan otomatis dinonaktifkan
 *     tags: [Batch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID batch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchUpdate'
 *           examples:
 *             activate:
 *               summary: Aktifkan batch
 *               value:
 *                 is_active: true
 *             deactivate:
 *               summary: Nonaktifkan batch
 *               value:
 *                 is_active: false
 *             update_number:
 *               summary: Update nomor batch
 *               value:
 *                 batch_number: 3
 *     responses:
 *       200:
 *         description: Batch berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Batch berhasil diperbarui"
 *                 data:
 *                   $ref: '#/components/schemas/Batch'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki akses (bukan admin)
 *       404:
 *         description: Batch tidak ditemukan
 *       409:
 *         description: Nomor batch sudah digunakan
 */
router.put('/:id', verifyJWT, isAdmin, batchController.updateBatch);

/**
 * @swagger
 * /batch-api/{id}:
 *   delete:
 *     summary: Menghapus batch
 *     tags: [Batch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID batch
 *     responses:
 *       200:
 *         description: Batch berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Batch berhasil dihapus"
 *                 data:
 *                   $ref: '#/components/schemas/Batch'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki akses (bukan admin)
 *       404:
 *         description: Batch tidak ditemukan
 */
router.delete('/:id', verifyJWT, isAdmin, batchController.deleteBatch);

/**
 * @swagger
 * /batch-api/switch/{batch_number}:
 *   patch:
 *     summary: Mengaktifkan batch yang sudah ada (switch batch)
 *     description: Menonaktifkan semua batch dan mengaktifkan batch dengan nomor yang ditentukan
 *     tags: [Batch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batch_number
 *         schema:
 *           type: integer
 *         required: true
 *         description: Nomor batch yang akan diaktifkan
 *         example: 3
 *     responses:
 *       200:
 *         description: Batch berhasil diaktifkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Batch berhasil diaktifkan"
 *                 data:
 *                   $ref: '#/components/schemas/Batch'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Batch berhasil diaktifkan"
 *                   data:
 *                     id: 3
 *                     batch_number: 3
 *                     is_active: true
 *                     created_at: "2025-11-17T00:00:00.000Z"
 *                     updated_at: "2025-11-17T00:00:00.000Z"
 *       400:
 *         description: Nomor batch tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki akses (bukan admin)
 *       404:
 *         description: Batch tidak ditemukan
 */
router.patch('/switch/:batch_number', verifyJWT, isAdmin, batchController.switchBatch);

module.exports = router;
