import { Router, Request, Response, NextFunction } from 'express';
import { protect, restrictTo, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { upload } from '../middleware/upload';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

// Map data feedback dari DB ke format frontend
function mapToFrontend(feedback: any) {
	return {
		id: feedback.id,
		nama: feedback.nama,
		universitas: feedback.universitas,
		posisi: feedback.posisi,
		batch: feedback.batch,
		tahun: feedback.tahun,
		pesan: feedback.pesan,
		image_path: feedback.imagePath,
		createdAt: feedback.createdAt
	};
}

/**
 * @swagger
 * /api/feedback-api/get:
 *   get:
 *     summary: Ambil semua feedback
 *     description: Mengembalikan daftar seluruh feedback/testimoni peserta.
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: Data feedback berhasil diambil
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/get', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const feedbacks = await prisma.feedback.findMany({
			orderBy: { createdAt: 'desc' }
		});
		res.status(200).json({
			status: true,
			data: feedbacks.map(mapToFrontend)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/feedback-api/get/{id}:
 *   get:
 *     summary: Ambil detail feedback berdasarkan ID
 *     description: Mengembalikan detail satu feedback/testimoni.
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID feedback
 *     responses:
 *       200:
 *         description: Detail feedback berhasil diambil
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
 *       404:
 *         description: Feedback tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Feedback tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/get/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const feedback = await prisma.feedback.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!feedback) {
			const error: CustomError = new Error('Feedback tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		res.status(200).json({
			status: true,
			data: mapToFrontend(feedback)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/feedback-api/add:
 *   post:
 *     summary: Tambah feedback baru
 *     description: Menambahkan feedback/testimoni baru. Dapat diakses user yang sudah login.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nama
 *               - universitas
 *               - posisi
 *               - batch
 *               - tahun
 *               - pesan
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Alya Putri
 *               universitas:
 *                 type: string
 *                 example: Telkom University
 *               posisi:
 *                 type: string
 *                 example: Frontend Developer Intern
 *               batch:
 *                 type: integer
 *                 example: 3
 *               tahun:
 *                 type: integer
 *                 example: 2026
 *               pesan:
 *                 type: string
 *                 example: Pengalaman magang sangat membantu perkembangan skill saya.
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Feedback berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Feedback berhasil ditambahkan
 *       400:
 *         description: Validasi input feedback gagal
 *         content:
 *           application/json:
 *             examples:
 *               field_wajib:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: Mohon lengkapi semua field yang wajib diisi
 *               angka_tidak_valid:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: Batch dan tahun harus berupa angka
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Terjadi kesalahan server (termasuk validasi file upload)
 *         content:
 *           application/json:
 *             examples:
 *               file_bukan_gambar:
 *                 value:
 *                   status: error
 *                   statusCode: 500
 *                   message: File upload harus berupa gambar!
 *               internal:
 *                 value:
 *                   status: error
 *                   statusCode: 500
 *                   message: Internal Server Error
 */
router.post('/add', protect, upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { nama, universitas, posisi, batch, tahun, pesan } = req.body;

		if (!nama || !universitas || !posisi || !batch || !tahun || !pesan) {
			const error: CustomError = new Error('Mohon lengkapi semua field yang wajib diisi');
			error.statusCode = 400;
			return next(error);
		}

		const parsedBatch = parseInt(batch, 10);
		const parsedTahun = parseInt(tahun, 10);

		if (isNaN(parsedBatch) || isNaN(parsedTahun)) {
			const error: CustomError = new Error('Batch dan tahun harus berupa angka');
			error.statusCode = 400;
			return next(error);
		}

		const imagePath = req.file ? `/uploads/images/${req.file.filename}` : '';

		const feedback = await prisma.feedback.create({
			data: {
				nama,
				universitas,
				posisi,
				batch: parsedBatch,
				tahun: parsedTahun,
				pesan,
				imagePath
			}
		});

		res.status(201).json({
			status: true,
			message: 'Feedback berhasil ditambahkan',
			data: mapToFrontend(feedback)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/feedback-api/update/{id}:
 *   patch:
 *     summary: Perbarui feedback
 *     description: Memperbarui data feedback berdasarkan ID. Dapat diakses user yang sudah login.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID feedback
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *               universitas:
 *                 type: string
 *               posisi:
 *                 type: string
 *               batch:
 *                 type: integer
 *               tahun:
 *                 type: integer
 *               pesan:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Feedback berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Feedback berhasil diupdate
 *       400:
 *         description: Validasi data feedback gagal
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 400
 *               message: Batch dan tahun harus berupa angka
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Feedback tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Feedback tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server (termasuk validasi file upload)
 *         content:
 *           application/json:
 *             examples:
 *               file_bukan_gambar:
 *                 value:
 *                   status: error
 *                   statusCode: 500
 *                   message: File upload harus berupa gambar!
 *               internal:
 *                 value:
 *                   status: error
 *                   statusCode: 500
 *                   message: Internal Server Error
 */
router.patch('/update/:id', protect, upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { nama, universitas, posisi, batch, tahun, pesan } = req.body;

		const existing = await prisma.feedback.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!existing) {
			const error: CustomError = new Error('Feedback tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		let imagePath = existing.imagePath;
		if (req.file) {
			imagePath = `/uploads/images/${req.file.filename}`;
		}

		const parsedBatch = batch ? parseInt(batch, 10) : undefined;
		const parsedTahun = tahun ? parseInt(tahun, 10) : undefined;

		if ((batch && isNaN(parsedBatch as number)) || (tahun && isNaN(parsedTahun as number))) {
			const error: CustomError = new Error('Batch dan tahun harus berupa angka');
			error.statusCode = 400;
			return next(error);
		}

		const updated = await prisma.feedback.update({
			where: { id: parseInt(id, 10) },
			data: {
				nama: nama ?? existing.nama,
				universitas: universitas ?? existing.universitas,
				posisi: posisi ?? existing.posisi,
				batch: parsedBatch ?? existing.batch,
				tahun: parsedTahun ?? existing.tahun,
				pesan: pesan ?? existing.pesan,
				imagePath
			}
		});

		res.status(200).json({
			status: true,
			message: 'Feedback berhasil diupdate',
			data: mapToFrontend(updated)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/feedback-api/delete/{id}:
 *   delete:
 *     summary: Hapus feedback
 *     description: Menghapus data feedback berdasarkan ID. Hanya dapat diakses oleh admin.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID feedback
 *     responses:
 *       200:
 *         description: Feedback berhasil dihapus
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: Feedback berhasil dihapus
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Feedback tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Feedback tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/delete/:id', protect, restrictTo('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const existing = await prisma.feedback.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!existing) {
			const error: CustomError = new Error('Feedback tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		await prisma.feedback.delete({
			where: { id: parseInt(id, 10) }
		});

		res.status(200).json({
			status: true,
			message: 'Feedback berhasil dihapus'
		});
	} catch (error) {
		next(error);
	}
});

export default router;
