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
 * @route   GET /api/lowongan-magang-api/get
 * @desc    Ambil semua daftar lowongan magang nih
 * @access  Public
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
 * @route   GET /api/lowongan-magang-api/get/kelompok-all
 * @desc    Ambil semua kelompok peminatan yg unik
 * @access  Public
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
 * @route   GET /api/lowongan-magang-api/get/id/:id
 * @desc    Ambil detail lowongan magang berdasarkan id
 * @access  Public
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
 * @route   POST /api/lowongan-magang-api/add
 * @desc    Tambah lowongan magang baru (khusus admin ya)
 * @access  Private (Admin)
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
 * @route   PATCH /api/lowongan-magang-api/update/:id
 * @desc    Update data lowongan magang (khusus admin)
 * @access  Private (Admin)
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
 * @route   DELETE /api/lowongan-magang-api/delete/:id
 * @desc    Hapus lowongan magang (khusus admin)
 * @access  Private (Admin)
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
