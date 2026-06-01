import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { protect, restrictTo, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { upload } from '../middleware/upload';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

// Map data lamaran dari DB ke format frontend
function mapToFrontend(lamaran: any) {
	return {
		id: lamaran.id,
		status: (lamaran.status || 'diproses').toLowerCase(),
		batch: lamaran.batch,
		createdAt: lamaran.createdAt,
		updatedAt: lamaran.updatedAt,
		mahasiswa: lamaran.mahasiswa ? {
			id: lamaran.mahasiswa.id,
			nama_depan: lamaran.mahasiswa.namaDepan,
			nama_belakang: lamaran.mahasiswa.namaBelakang || '',
			email: lamaran.mahasiswa.user?.email || '',
			kontak: lamaran.mahasiswa.kontak,
			jurusan: lamaran.mahasiswa.jurusan,
			universitas: lamaran.mahasiswa.universitas,
			negara: lamaran.mahasiswa.negara,
			cv_path: lamaran.mahasiswa.cvPath,
			portofolio_path: lamaran.mahasiswa.portofolioPath,
			motivasi: lamaran.mahasiswa.motivasi,
			relevant_skills: lamaran.mahasiswa.relevantSkills
		} : null,
		lowongan_magang: lamaran.lowonganMagang ? {
			id: lamaran.lowonganMagang.id,
			posisi: lamaran.lowonganMagang.posisi,
			kelompok_peminatan: lamaran.lowonganMagang.kelompokPeminatan
		} : null
	};
}

/**
 * @route   POST /api/lamaran-magang-api/add/:lowonganId
 * @desc    Kirim pendaftaran magang baru
 * @access  Public
 */
router.post(
	'/add/:lowonganId',
	upload.fields([
		{ name: 'cv', maxCount: 1 },
		{ name: 'portofolio', maxCount: 1 }
	]),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { lowonganId } = req.params;
			const {
				nama_depan,
				nama_belakang,
				email,
				kontak,
				universitas,
				negara,
				jurusan,
				batch,
				motivasi,
				relevant_skills
			} = req.body;

			if (!nama_depan || !email || !kontak || !universitas || !negara || !jurusan || !motivasi) {
				const error: CustomError = new Error('Mohon lengkapi semua field wajib yang diperlukan');
				error.statusCode = 400;
				return next(error);
			}

			const files = req.files as { [fieldname: string]: Express.Multer.File[] };
			const cvFile = files?.['cv']?.[0];
			const portofolioFile = files?.['portofolio']?.[0];

			if (!cvFile || !portofolioFile) {
				const error: CustomError = new Error('CV dan Portofolio wajib diunggah!');
				error.statusCode = 400;
				return next(error);
			}

			const lowongan = await prisma.lowonganMagang.findUnique({
				where: { id: lowonganId }
			});

			if (!lowongan) {
				const error: CustomError = new Error('Lowongan magang tidak ditemukan');
				error.statusCode = 404;
				return next(error);
			}

			let user = await prisma.user.findUnique({
				where: { email },
				include: { mahasiswa: true }
			});

			const cvPath = `/uploads/docs/${cvFile.filename}`;
			const portofolioPath = `/uploads/docs/${portofolioFile.filename}`;

			if (!user) {
				// Kalo user belom terdaftar, kita buatin akun STUDENT baru
				const randomPassword = Math.random().toString(36).substring(2, 15);
				const salt = await bcrypt.genSalt(10);
				const passwordHash = await bcrypt.hash(randomPassword, salt);

				user = await prisma.user.create({
					data: {
						email,
						passwordHash,
						role: 'STUDENT',
						mahasiswa: {
							create: {
								namaDepan: nama_depan,
								namaBelakang: nama_belakang || null,
								kontak,
								jurusan,
								universitas,
								negara,
								cvPath,
								portofolioPath,
								motivasi,
								relevantSkills: relevant_skills || ''
							}
						}
					},
					include: { mahasiswa: true }
				});
			} else {
				// Kalo user udah ada, kita update data profil mahasiswanya aja
				if (user.mahasiswa) {
					await prisma.mahasiswa.update({
						where: { id: user.mahasiswa.id },
						data: {
							namaDepan: nama_depan,
							namaBelakang: nama_belakang || user.mahasiswa.namaBelakang,
							kontak: kontak || user.mahasiswa.kontak,
							jurusan: jurusan || user.mahasiswa.jurusan,
							universitas: universitas || user.mahasiswa.universitas,
							negara: negara || user.mahasiswa.negara,
							cvPath,
							portofolioPath,
							motivasi,
							relevantSkills: relevant_skills || user.mahasiswa.relevantSkills
						}
					});
				}
			}

			const parsedBatch = batch ? parseInt(batch, 10) : lowongan.idBatch;

			const lamaran = await prisma.lamaranMagang.create({
				data: {
					idMahasiswa: user.mahasiswa!.id,
					idLowonganMagang: lowongan.id,
					status: 'DIPROSES',
					batch: parsedBatch
				},
				include: {
					mahasiswa: {
						include: { user: true }
					},
					lowonganMagang: true
				}
			});

			res.status(201).json({
				status: true,
				message: 'Pendaftaran magang berhasil dikirim',
				data: mapToFrontend(lamaran)
			});
		} catch (error) {
			next(error);
		}
	}
);

/**
 * @route   GET /api/lamaran-magang-api/get
 * @desc    Dapetin semua data pelamar (admin aja ya)
 * @access  Private (Admin)
 */
router.get('/get', protect, restrictTo('ADMIN'), async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const applications = await prisma.lamaranMagang.findMany({
			include: {
				mahasiswa: {
					include: { user: true }
				},
				lowonganMagang: true
			},
			orderBy: { createdAt: 'desc' }
		});
		res.status(200).json({
			status: true,
			data: applications.map(mapToFrontend)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   GET /api/lamaran-magang-api/get/:id
 * @desc    Dapetin detail satu lamaran berdasarkan id
 * @access  Private (Admin)
 */
router.get('/get/:id', protect, restrictTo('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const application = await prisma.lamaranMagang.findUnique({
			where: { id: parseInt(id, 10) },
			include: {
				mahasiswa: {
					include: { user: true }
				},
				lowonganMagang: true
			}
		});

		if (!application) {
			const error: CustomError = new Error('Lamaran tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		res.status(200).json({
			status: true,
			data: mapToFrontend(application)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   PATCH /api/lamaran-magang-api/update/:id
 * @desc    Ganti status lamaran (diterima, ditolak, dll)
 * @access  Private (Admin)
 */
router.patch('/update/:id', protect, restrictTo('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!status) {
			const error: CustomError = new Error('Mohon masukkan status baru');
			error.statusCode = 400;
			return next(error);
		}

		const formattedStatus = status.toUpperCase();
		if (formattedStatus !== 'DITERIMA' && formattedStatus !== 'DITOLAK' && formattedStatus !== 'DIPROSES') {
			const error: CustomError = new Error('Status tidak valid');
			error.statusCode = 400;
			return next(error);
		}

		const updated = await prisma.lamaranMagang.update({
			where: { id: parseInt(id, 10) },
			data: {
				status: formattedStatus as any
			},
			include: {
				mahasiswa: {
					include: { user: true }
				},
				lowonganMagang: true
			}
		});

		res.status(200).json({
			status: true,
			message: 'Status lamaran berhasil diupdate',
			data: mapToFrontend(updated)
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   DELETE /api/lamaran-magang-api/delete
 * @desc    Hapus semua data pelamar
 * @access  Private (Admin)
 */
router.delete('/delete', protect, restrictTo('ADMIN'), async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		await prisma.lamaranMagang.deleteMany({});
		res.status(200).json({
			status: true,
			message: 'Seluruh data pelamar berhasil dihapus'
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   GET /api/lamaran-magang-api/export
 * @desc    Ekspor data pelamar ke file Excel (.xlsx)
 * @access  Private (Admin)
 */
router.get('/export', protect, restrictTo('ADMIN'), async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const applications = await prisma.lamaranMagang.findMany({
			include: {
				mahasiswa: {
					include: { user: true }
				},
				lowonganMagang: true
			}
		});

		const rows = applications.map((app) => ({
			ID: app.id,
			Nama: `${app.mahasiswa?.namaDepan} ${app.mahasiswa?.namaBelakang || ''}`.trim(),
			Email: app.mahasiswa?.user?.email || '',
			Kontak: app.mahasiswa?.kontak || '',
			Universitas: app.mahasiswa?.universitas || '',
			Jurusan: app.mahasiswa?.jurusan || '',
			Negara: app.mahasiswa?.negara || '',
			Posisi: app.lowonganMagang?.posisi || '',
			Status: app.status,
			Motivasi: app.mahasiswa?.motivasi || '',
			Skills: app.mahasiswa?.relevantSkills || ''
		}));

		const worksheet = XLSX.utils.json_to_sheet(rows);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

		const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
		res.send(buffer);
	} catch (error) {
		next(error);
	}
});

export default router;
