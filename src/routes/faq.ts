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
 * @route   GET /api/faq-api/get
 * @desc    Dapetin semua list FAQ
 * @access  Public
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
 * @route   GET /api/faq-api/get/:id
 * @desc    Dapetin detail satu FAQ
 * @access  Public
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
 * @route   POST /api/faq-api/add
 * @desc    Tambah FAQ baru (khusus admin ya)
 * @access  Private (Admin)
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
 * @route   PATCH /api/faq-api/update/:id
 * @desc    Update data FAQ (khusus admin)
 * @access  Private (Admin)
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
 * @route   DELETE /api/faq-api/delete/:id
 * @desc    Hapus data FAQ (khusus admin)
 * @access  Private (Admin)
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
