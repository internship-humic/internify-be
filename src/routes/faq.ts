import { Router, Request, Response, NextFunction } from 'express';
import { protect, restrictTo, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

// Map data faq dari DB ke format frontend
function mapToFrontend(faq: any) {
	return {
		id: faq.id,
		pertanyaan: faq.pertanyaan,
		jawaban: faq.jawaban,
		created_at: faq.createdAt
	};
}

/**
 * @swagger
 * /api/faq-api/get:
 *   get:
 *     summary: Ambil seluruh FAQ
 *     description: Mengembalikan daftar semua pertanyaan dan jawaban FAQ.
 *     tags: [FAQ]
 *     responses:
 *       200:
 *         description: Data FAQ berhasil diambil
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
		const faqs = await prisma.faq.findMany({
			orderBy: { createdAt: 'desc' }
		});
		res.status(200).json({
			status: true,
			data: faqs.map(mapToFrontend)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/faq-api/get/{id}:
 *   get:
 *     summary: Ambil detail FAQ berdasarkan ID
 *     description: Mengembalikan detail satu item FAQ.
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID FAQ
 *     responses:
 *       200:
 *         description: Detail FAQ berhasil diambil
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
 *         description: FAQ tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: FAQ tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/get/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const faq = await prisma.faq.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!faq) {
			const error: CustomError = new Error('FAQ tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		res.status(200).json({
			status: true,
			data: mapToFrontend(faq)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/faq-api/add:
 *   post:
 *     summary: Tambah FAQ baru
 *     description: Menambahkan item FAQ baru. Hanya dapat diakses oleh admin.
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
 *                 example: Apakah magang ini bisa remote?
 *               jawaban:
 *                 type: string
 *                 example: Ya, beberapa posisi mendukung skema remote.
 *     responses:
 *       201:
 *         description: FAQ berhasil ditambahkan
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
 *                   example: FAQ berhasil ditambahkan
 *       400:
 *         description: Validasi FAQ gagal
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 400
 *               message: Pertanyaan dan jawaban harus diisi
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/add', protect, restrictTo('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { pertanyaan, jawaban } = req.body;

		if (!pertanyaan || !jawaban) {
			const error: CustomError = new Error('Pertanyaan dan jawaban harus diisi');
			error.statusCode = 400;
			return next(error);
		}

		const faq = await prisma.faq.create({
			data: {
				pertanyaan,
				jawaban
			}
		});

		res.status(201).json({
			status: true,
			message: 'FAQ berhasil ditambahkan',
			data: mapToFrontend(faq)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/faq-api/update/{id}:
 *   patch:
 *     summary: Perbarui FAQ
 *     description: Memperbarui item FAQ berdasarkan ID. Hanya dapat diakses oleh admin.
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID FAQ
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pertanyaan:
 *                 type: string
 *               jawaban:
 *                 type: string
 *     responses:
 *       200:
 *         description: FAQ berhasil diperbarui
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
 *                   example: FAQ berhasil diupdate
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: FAQ tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: FAQ tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/update/:id', protect, restrictTo('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { pertanyaan, jawaban } = req.body;

		const existing = await prisma.faq.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!existing) {
			const error: CustomError = new Error('FAQ tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		const updated = await prisma.faq.update({
			where: { id: parseInt(id, 10) },
			data: {
				pertanyaan: pertanyaan ?? existing.pertanyaan,
				jawaban: jawaban ?? existing.jawaban
			}
		});

		res.status(200).json({
			status: true,
			message: 'FAQ berhasil diupdate',
			data: mapToFrontend(updated)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/faq-api/delete/{id}:
 *   delete:
 *     summary: Hapus FAQ
 *     description: Menghapus item FAQ berdasarkan ID. Hanya dapat diakses oleh admin.
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID FAQ
 *     responses:
 *       200:
 *         description: FAQ berhasil dihapus
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: FAQ berhasil dihapus
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: FAQ tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: FAQ tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/delete/:id', protect, restrictTo('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const existing = await prisma.faq.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!existing) {
			const error: CustomError = new Error('FAQ tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		await prisma.faq.delete({
			where: { id: parseInt(id, 10) }
		});

		res.status(200).json({
			status: true,
			message: 'FAQ berhasil dihapus'
		});
	} catch (error) {
		next(error);
	}
});

export default router;
