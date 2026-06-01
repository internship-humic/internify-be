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
 * @route   GET /api/feedback-api/get
 * @desc    Dapetin semua feedback dari mahasiswa
 * @access  Public
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
 * @route   GET /api/feedback-api/get/:id
 * @desc    Dapetin detail satu feedback
 * @access  Public
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
 * @route   POST /api/feedback-api/add
 * @desc    Tambah feedback baru (bisa admin / student)
 * @access  Private (Admin/Student)
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
 * @route   PATCH /api/feedback-api/update/:id
 * @desc    Update data feedback (bisa admin / student)
 * @access  Private (Admin/Student)
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
 * @route   DELETE /api/feedback-api/delete/:id
 * @desc    Hapus feedback (khusus admin)
 * @access  Private (Admin)
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
