import { Router, Request, Response, NextFunction } from 'express';
import { protect, restrictTo, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { upload } from '../middleware/upload';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

// Map data research product dari DB ke format frontend
function mapToFrontend(product: any) {
	return {
		id: product.id,
		nama_project: product.namaProject,
		deskripsi: product.deskripsi,
		link_project: product.linkProject,
		image_path: product.imagePath,
		createdAt: product.createdAt
	};
}

/**
 * @route   GET /api/hasil-research-api/get
 * @desc    Dapetin semua hasil riset/products
 * @access  Public
 */
router.get('/get', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const products = await prisma.hasilResearch.findMany({
			orderBy: { createdAt: 'desc' }
		});
		res.status(200).json({
			status: true,
			data: products.map(mapToFrontend)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   GET /api/hasil-research-api/get/:id
 * @desc    Dapetin detail satu hasil riset/product
 * @access  Public
 */
router.get('/get/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const product = await prisma.hasilResearch.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!product) {
			const error: CustomError = new Error('Project tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		res.status(200).json({
			status: true,
			data: mapToFrontend(product)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   POST /api/hasil-research-api/add
 * @desc    Tambah hasil riset baru (khusus admin ya)
 * @access  Private (Admin)
 */
router.post('/add', protect, restrictTo('ADMIN'), upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { nama_project, deskripsi, link_project } = req.body;

		if (!nama_project || !deskripsi || !link_project) {
			const error: CustomError = new Error('Mohon lengkapi semua field yang wajib diisi');
			error.statusCode = 400;
			return next(error);
		}

		const imagePath = req.file ? `/uploads/images/${req.file.filename}` : '';

		const product = await prisma.hasilResearch.create({
			data: {
				namaProject: nama_project,
				deskripsi,
				linkProject: link_project,
				imagePath
			}
		});

		res.status(201).json({
			status: true,
			message: 'Research project berhasil ditambahkan',
			data: mapToFrontend(product)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   PATCH /api/hasil-research-api/update/:id
 * @desc    Update data hasil riset (khusus admin)
 * @access  Private (Admin)
 */
router.patch('/update/:id', protect, restrictTo('ADMIN'), upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { nama_project, deskripsi, link_project } = req.body;

		const existing = await prisma.hasilResearch.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!existing) {
			const error: CustomError = new Error('Project tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		let imagePath = existing.imagePath;
		if (req.file) {
			imagePath = `/uploads/images/${req.file.filename}`;
		}

		const updated = await prisma.hasilResearch.update({
			where: { id: parseInt(id, 10) },
			data: {
				namaProject: nama_project ?? existing.namaProject,
				deskripsi: deskripsi ?? existing.deskripsi,
				linkProject: link_project ?? existing.linkProject,
				imagePath
			}
		});

		res.status(200).json({
			status: true,
			message: 'Research project berhasil diupdate',
			data: mapToFrontend(updated)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   DELETE /api/hasil-research-api/delete/:id
 * @desc    Hapus data hasil riset (khusus admin)
 * @access  Private (Admin)
 */
router.delete('/delete/:id', protect, restrictTo('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const existing = await prisma.hasilResearch.findUnique({
			where: { id: parseInt(id, 10) }
		});

		if (!existing) {
			const error: CustomError = new Error('Project tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		await prisma.hasilResearch.delete({
			where: { id: parseInt(id, 10) }
		});

		res.status(200).json({
			status: true,
			message: 'Research project berhasil dihapus'
		});
	} catch (error) {
		next(error);
	}
});

export default router;
