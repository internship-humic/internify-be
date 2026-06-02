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
 * @swagger
 * /api/partnership-api/get:
 *   get:
 *     summary: Ambil seluruh data partnership
 *     description: Mengembalikan daftar seluruh mitra partnership.
 *     tags: [Partnership]
 *     responses:
 *       200:
 *         description: Data partnership berhasil diambil
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
 * @swagger
 * /api/partnership-api/get/{id}:
 *   get:
 *     summary: Ambil detail partnership berdasarkan ID
 *     description: Mengembalikan detail satu data partnership.
 *     tags: [Partnership]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID partnership
 *     responses:
 *       200:
 *         description: Detail partnership berhasil diambil
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
 *       404:
 *         description: Partnership tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Partnership tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * @swagger
 * /api/partnership-api/add:
 *   post:
 *     summary: Tambah partnership baru
 *     description: Menambahkan data partnership baru. Hanya dapat diakses oleh admin.
 *     tags: [Partnership]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nama_partner
 *               - image
 *             properties:
 *               nama_partner:
 *                 type: string
 *                 example: PT Teknologi Nusantara
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Partnership berhasil ditambahkan
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
 *                   example: Partnership berhasil ditambahkan
 *       400:
 *         description: Validasi input partnership gagal
 *         content:
 *           application/json:
 *             examples:
 *               nama_wajib:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: Nama partnership harus diisi
 *               image_wajib:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: Thumbnail/image harus diunggah
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
 * @swagger
 * /api/partnership-api/update/{id}:
 *   patch:
 *     summary: Perbarui data partnership
 *     description: Memperbarui data partnership berdasarkan ID. Hanya dapat diakses oleh admin.
 *     tags: [Partnership]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID partnership
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama_partner:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Partnership berhasil diperbarui
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
 *                   example: Partnership berhasil diupdate
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Partnership tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Partnership tidak ditemukan
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
 * @swagger
 * /api/partnership-api/delete/{id}:
 *   delete:
 *     summary: Hapus partnership
 *     description: Menghapus data partnership berdasarkan ID. Hanya dapat diakses oleh admin.
 *     tags: [Partnership]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID partnership
 *     responses:
 *       200:
 *         description: Partnership berhasil dihapus
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: Partnership berhasil dihapus
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Partnership tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Partnership tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
