import { Router, Request, Response, NextFunction } from 'express';
import { protect, restrictTo, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { upload } from '../middleware/upload';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

// Map data partnership dari DB ke format frontend
function mapToFrontend(partner: any) {
	return {
		id: partner.id,
		nama_partner: partner.namaPartner,
		image_path: partner.imagePath,
		createdAt: partner.createdAt
	};
}

/**
 * @route   GET /api/partnership-api/get
 * @desc    Dapetin semua data partnerships
 * @access  Public
 */
router.get('/get', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const partners = await prisma.partnership.findMany({
			orderBy: { createdAt: 'desc' }
		});
		res.status(200).json({
			status: true,
			data: partners.map(mapToFrontend)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   GET /api/partnership-api/get/:id
 * @desc    Dapetin detail satu partnership
 * @access  Public
 */
router.get('/get/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const partner = await prisma.partnership.findFirst({
			where: { id: parseInt(id, 10) }
		});

		if (!partner) {
			const error: CustomError = new Error('Partnership tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		res.status(200).json({
			status: true,
			data: [mapToFrontend(partner)] // Kadang list/detail di frontend minta dibungkus array
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   POST /api/partnership-api/add
 * @desc    Tambah partnership baru (khusus admin ya)
 * @access  Private (Admin)
 */
router.post('/add', protect, restrictTo('ADMIN'), upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { nama_partner } = req.body;
		if (!nama_partner) {
			const error: CustomError = new Error('Nama partnership harus diisi');
			error.statusCode = 400;
			return next(error);
		}

		if (!req.file) {
			const error: CustomError = new Error('Thumbnail/image harus diunggah');
			error.statusCode = 400;
			return next(error);
		}

		const imagePath = `/uploads/images/${req.file.filename}`;

		const partner = await prisma.partnership.create({
			data: {
				namaPartner: nama_partner,
				imagePath
			}
		});

		res.status(201).json({
			status: true,
			message: 'Partnership berhasil ditambahkan',
			data: mapToFrontend(partner)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   PATCH /api/partnership-api/update/:id
 * @desc    Update data partnership (khusus admin)
 * @access  Private (Admin)
 */
router.patch('/update/:id', protect, restrictTo('ADMIN'), upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { nama_partner } = req.body;

		const existing = await prisma.partnership.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!existing) {
			const error: CustomError = new Error('Partnership tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		let imagePath = existing.imagePath;
		if (req.file) {
			imagePath = `/uploads/images/${req.file.filename}`;
		}

		const updated = await prisma.partnership.update({
			where: { id: parseInt(id, 10) },
			data: {
				namaPartner: nama_partner ?? existing.namaPartner,
				imagePath
			}
		});

		res.status(200).json({
			status: true,
			message: 'Partnership berhasil diupdate',
			data: mapToFrontend(updated)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   DELETE /api/partnership-api/delete/:id
 * @desc    Hapus data partnership (khusus admin)
 * @access  Private (Admin)
 */
router.delete('/delete/:id', protect, restrictTo('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const existing = await prisma.partnership.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!existing) {
			const error: CustomError = new Error('Partnership tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		await prisma.partnership.delete({
			where: { id: parseInt(id, 10) }
		});

		res.status(200).json({
			status: true,
			message: 'Partnership berhasil dihapus'
		});
	} catch (error) {
		next(error);
	}
});

export default router;
