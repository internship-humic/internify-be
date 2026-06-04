import { Router, Request, Response, NextFunction } from 'express';
import { protect, restrictTo, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { upload } from '../middleware/upload';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

// Nyari batch yg aktif, kalo ga ada ya kita bikinin yg baru
async function getOrCreateActiveBatch() {
	let batch = await prisma.batch.findFirst({
		where: { isActive: true }
	});
	if (!batch) {
		batch = await prisma.batch.create({
			data: {
				batchNumber: 1,
				isActive: true
			}
		});
	}
	return batch;
}

function mapToFrontend(lowongan: any) {
	return {
		id: lowongan.id,
		id_batch: lowongan.idBatch,
		posisi: lowongan.posisi,
		kelompok_peminatan: lowongan.kelompokPeminatan,
		image_path: lowongan.imagePath,
		jobdesk: lowongan.jobdesk,
		lokasi: lowongan.lokasi,
		kualifikasi: lowongan.kualifikasi,
		benefit: lowongan.benefit,
		durasi_awal: lowongan.durasiAwal,
		durasi_akhir: lowongan.durasiAkhir,
		status_lowongan: lowongan.statusLowongan,
		paid: lowongan.paid,
		createdAt: lowongan.createdAt
	};
}

/**
 * @swagger
 * /api/lowongan-magang-api/get:
 *   get:
 *     summary: Ambil seluruh lowongan magang
 *     description: Mengembalikan daftar semua lowongan magang yang tersedia.
 *     tags: [Lowongan Magang]
 *     responses:
 *       200:
 *         description: Daftar lowongan berhasil diambil
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
 *                       id:
 *                         type: string
 *                         example: lowongan-frontend
 *                       posisi:
 *                         type: string
 *                         example: Frontend Developer Intern
 *                       kelompok_peminatan:
 *                         type: string
 *                         example: Web Engineering
 *                       status_lowongan:
 *                         type: string
 *                         example: DIBUKA
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/get', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const lowongans = await prisma.lowonganMagang.findMany({
			orderBy: { createdAt: 'desc' }
		});
		res.status(200).json({
			status: true,
			data: lowongans.map(mapToFrontend)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/lowongan-magang-api/get/kelompok-all:
 *   get:
 *     summary: Ambil semua kelompok peminatan unik
 *     description: Mengembalikan daftar kategori peminatan tanpa duplikasi.
 *     tags: [Lowongan Magang]
 *     responses:
 *       200:
 *         description: Daftar kelompok peminatan berhasil diambil
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
 *                     type: string
 *                   example: ["Web Engineering", "Design & Creative"]
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/get/kelompok-all', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await prisma.lowonganMagang.findMany({
			select: { kelompokPeminatan: true },
			distinct: ['kelompokPeminatan']
		});
		const categories = result.map((r) => r.kelompokPeminatan);
		res.status(200).json({
			status: true,
			data: categories
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/lowongan-magang-api/get/id/{id}:
 *   get:
 *     summary: Ambil detail lowongan berdasarkan ID
 *     description: Mengembalikan detail satu lowongan magang berdasarkan parameter `id`.
 *     tags: [Lowongan Magang]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lowongan
 *     responses:
 *       200:
 *         description: Detail lowongan berhasil diambil
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
 *                     id:
 *                       type: string
 *                       example: lowongan-frontend
 *                     posisi:
 *                       type: string
 *                       example: Frontend Developer Intern
 *                     kelompok_peminatan:
 *                       type: string
 *                       example: Web Engineering
 *       404:
 *         description: Lowongan tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Lowongan tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/get/id/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const lowongan = await prisma.lowonganMagang.findUnique({
			where: { id }
		});
		if (!lowongan) {
			const error: CustomError = new Error('Lowongan tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}
		res.status(200).json({
			status: true,
			data: mapToFrontend(lowongan)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/lowongan-magang-api/add:
 *   post:
 *     summary: Tambah lowongan magang baru
 *     description: Membuat lowongan magang baru. Hanya dapat diakses oleh admin.
 *     tags: [Lowongan Magang]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - posisi
 *               - kelompok_peminatan
 *               - lokasi
 *               - jobdesk
 *               - durasi_awal
 *               - durasi_akhir
 *               - paid
 *             properties:
 *               posisi:
 *                 type: string
 *                 example: Frontend Developer Intern
 *               kelompok_peminatan:
 *                 type: string
 *                 example: Web Engineering
 *               lokasi:
 *                 type: string
 *                 example: Remote
 *               jobdesk:
 *                 type: string
 *                 example: Mengembangkan antarmuka responsif menggunakan React.
 *               kualifikasi:
 *                 type: string
 *                 example: Memahami React JS, ES6 JavaScript, HTML, CSS.
 *               benefit:
 *                 type: string
 *                 example: Sertifikat magang resmi, jam kerja fleksibel.
 *               durasi_awal:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-01
 *               durasi_akhir:
 *                 type: string
 *                 format: date
 *                 example: 2026-09-01
 *               paid:
 *                 type: string
 *                 enum: [PAID, UNPAID]
 *                 example: PAID
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Lowongan berhasil ditambahkan
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
 *                   example: Internship lowongan berhasil ditambahkan
 *                 data:
 *                   type: object
 *       400:
 *         description: Validasi input lowongan gagal
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
		const {
			posisi,
			kelompok_peminatan,
			lokasi,
			jobdesk,
			kualifikasi,
			benefit,
			durasi_awal,
			durasi_akhir,
			paid
		} = req.body;

		if (!posisi || !kelompok_peminatan || !lokasi || !jobdesk || !durasi_awal || !durasi_akhir || !paid) {
			const error: CustomError = new Error('Mohon lengkapi semua field yang wajib diisi');
			error.statusCode = 400;
			return next(error);
		}

		const batch = await getOrCreateActiveBatch();

		const imagePath = req.file ? `/uploads/images/${req.file.filename}` : '';

		const id = `lowongan-${Date.now()}`;

		const lowongan = await prisma.lowonganMagang.create({
			data: {
				id,
				idBatch: batch.id,
				posisi,
				kelompokPeminatan: kelompok_peminatan,
				imagePath,
				jobdesk,
				lokasi,
				kualifikasi: kualifikasi || '',
				benefit: benefit || '',
				durasiAwal: new Date(durasi_awal),
				durasiAkhir: new Date(durasi_akhir),
				statusLowongan: 'DIBUKA',
				paid: paid.toUpperCase() === 'PAID' ? 'PAID' : 'UNPAID'
			}
		});

		res.status(201).json({
			status: true,
			message: 'Internship lowongan berhasil ditambahkan',
			data: mapToFrontend(lowongan)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/lowongan-magang-api/update/{id}:
 *   patch:
 *     summary: Perbarui data lowongan magang
 *     description: Memperbarui data lowongan berdasarkan ID. Hanya dapat diakses oleh admin.
 *     tags: [Lowongan Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lowongan
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               posisi:
 *                 type: string
 *               kelompok_peminatan:
 *                 type: string
 *               lokasi:
 *                 type: string
 *               jobdesk:
 *                 type: string
 *               kualifikasi:
 *                 type: string
 *               benefit:
 *                 type: string
 *               durasi_awal:
 *                 type: string
 *                 format: date
 *               durasi_akhir:
 *                 type: string
 *                 format: date
 *               paid:
 *                 type: string
 *                 enum: [PAID, UNPAID]
 *               status_lowongan:
 *                 type: string
 *                 enum: [DIBUKA, DITUTUP]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Lowongan berhasil diperbarui
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
 *                   example: Lowongan berhasil diupdate
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Lowongan tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Lowongan tidak ditemukan
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
		const {
			posisi,
			kelompok_peminatan,
			lokasi,
			jobdesk,
			kualifikasi,
			benefit,
			durasi_awal,
			durasi_akhir,
			paid,
			status_lowongan
		} = req.body;

		const existing = await prisma.lowonganMagang.findUnique({
			where: { id }
		});

		if (!existing) {
			const error: CustomError = new Error('Lowongan tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		let imagePath = existing.imagePath;
		if (req.file) {
			imagePath = `/uploads/images/${req.file.filename}`;
		}

		const updated = await prisma.lowonganMagang.update({
			where: { id },
			data: {
				posisi: posisi ?? existing.posisi,
				kelompokPeminatan: kelompok_peminatan ?? existing.kelompokPeminatan,
				lokasi: lokasi ?? existing.lokasi,
				jobdesk: jobdesk ?? existing.jobdesk,
				kualifikasi: kualifikasi ?? existing.kualifikasi,
				benefit: benefit ?? existing.benefit,
				durasiAwal: durasi_awal ? new Date(durasi_awal) : existing.durasiAwal,
				durasiAkhir: durasi_akhir ? new Date(durasi_akhir) : existing.durasiAkhir,
				statusLowongan: (status_lowongan ?? existing.statusLowongan) === 'DIBUKA' ? 'DIBUKA' : 'DITUTUP',
				paid: paid ? (paid.toUpperCase() === 'PAID' ? 'PAID' : 'UNPAID') : existing.paid,
				imagePath
			}
		});

		res.status(200).json({
			status: true,
			message: 'Lowongan berhasil diupdate',
			data: mapToFrontend(updated)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/lowongan-magang-api/delete/{id}:
 *   delete:
 *     summary: Hapus lowongan magang
 *     description: Menghapus data lowongan berdasarkan ID. Hanya dapat diakses oleh admin.
 *     tags: [Lowongan Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lowongan
 *     responses:
 *       200:
 *         description: Lowongan berhasil dihapus
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
 *                   example: Lowongan berhasil dihapus
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Lowongan tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Lowongan tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/delete/:id', protect, restrictTo('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const existing = await prisma.lowonganMagang.findUnique({
			where: { id }
		});

		if (!existing) {
			const error: CustomError = new Error('Lowongan tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		await prisma.lowonganMagang.delete({
			where: { id }
		});

		res.status(200).json({
			status: true,
			message: 'Lowongan berhasil dihapus'
		});
	} catch (error) {
		next(error);
	}
});

export default router;
