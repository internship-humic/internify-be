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
 * @swagger
 * /api/hasil-research-api/get:
 *   get:
 *     summary: Ambil semua hasil research
 *     description: Mengembalikan daftar seluruh project hasil research.
 *     tags: [Hasil Research]
 *     responses:
 *       200:
 *         description: Data hasil research berhasil diambil
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
 * @swagger
 * /api/hasil-research-api/get/{id}:
 *   get:
 *     summary: Ambil detail hasil research berdasarkan ID
 *     description: Mengembalikan detail satu project hasil research.
 *     tags: [Hasil Research]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID hasil research
 *     responses:
 *       200:
 *         description: Detail hasil research berhasil diambil
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
 *         description: Project tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Project tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * @swagger
 * /api/hasil-research-api/add:
 *   post:
 *     summary: Tambah hasil research baru
 *     description: Menambahkan data project hasil research baru. Hanya dapat diakses oleh admin.
 *     tags: [Hasil Research]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nama_project
 *               - deskripsi
 *               - link_project
 *             properties:
 *               nama_project:
 *                 type: string
 *                 example: Sistem Monitoring Tanaman IoT
 *               deskripsi:
 *                 type: string
 *                 example: Project monitoring kelembapan tanah berbasis IoT.
 *               link_project:
 *                 type: string
 *                 example: https://example.com/project/monitoring-tanaman
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Hasil research berhasil ditambahkan
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
 *                   example: Research project berhasil ditambahkan
 *       400:
 *         description: Validasi input hasil research gagal
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 400
 *               message: Mohon lengkapi semua field yang wajib diisi
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
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
 * @swagger
 * /api/hasil-research-api/update/{id}:
 *   patch:
 *     summary: Perbarui hasil research
 *     description: Memperbarui data hasil research berdasarkan ID. Hanya dapat diakses oleh admin.
 *     tags: [Hasil Research]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID hasil research
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama_project:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *               link_project:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Hasil research berhasil diperbarui
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
 *                   example: Research project berhasil diupdate
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Project tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Project tidak ditemukan
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
 * @swagger
 * /api/hasil-research-api/delete/{id}:
 *   delete:
 *     summary: Hapus hasil research
 *     description: Menghapus data hasil research berdasarkan ID. Hanya dapat diakses oleh admin.
 *     tags: [Hasil Research]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID hasil research
 *     responses:
 *       200:
 *         description: Hasil research berhasil dihapus
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: Research project berhasil dihapus
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Project tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Project tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
