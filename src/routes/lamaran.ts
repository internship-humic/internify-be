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
 * @swagger
 * /api/lamaran-magang-api/add/{lowonganId}:
 *   post:
 *     summary: Kirim lamaran magang baru
 *     description: Mengirim pendaftaran magang ke lowongan tertentu beserta CV dan portofolio (PDF).
 *     tags: [Lamaran Magang]
 *     parameters:
 *       - in: path
 *         name: lowonganId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lowongan magang
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nama_depan
 *               - email
 *               - kontak
 *               - universitas
 *               - negara
 *               - jurusan
 *               - motivasi
 *               - cv
 *               - portofolio
 *             properties:
 *               nama_depan:
 *                 type: string
 *                 example: Alya
 *               nama_belakang:
 *                 type: string
 *                 example: Putri
 *               email:
 *                 type: string
 *                 example: alya@example.com
 *               kontak:
 *                 type: string
 *                 example: 081234567890
 *               universitas:
 *                 type: string
 *                 example: Telkom University
 *               negara:
 *                 type: string
 *                 example: Indonesia
 *               jurusan:
 *                 type: string
 *                 example: Informatika
 *               batch:
 *                 type: integer
 *                 example: 3
 *               motivasi:
 *                 type: string
 *                 example: Saya ingin belajar langsung dari tim engineering.
 *               relevant_skills:
 *                 type: string
 *                 example: React, TypeScript, Node.js
 *               cv:
 *                 type: string
 *                 format: binary
 *               portofolio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Lamaran berhasil dikirim
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
 *                   example: Pendaftaran magang berhasil dikirim
 *       400:
 *         description: Validasi pengajuan lamaran gagal
 *         content:
 *           application/json:
 *             examples:
 *               field_wajib:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: Mohon lengkapi semua field wajib yang diperlukan
 *               dokumen_wajib:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: CV dan Portofolio wajib diunggah!
 *       404:
 *         description: Lowongan magang tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Lowongan magang tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server (termasuk validasi tipe file upload)
 *         content:
 *           application/json:
 *             examples:
 *               tipe_file_pdf:
 *                 value:
 *                   status: error
 *                   statusCode: 500
 *                   message: CV dan Portofolio harus dalam format PDF!
 *               internal:
 *                 value:
 *                   status: error
 *                   statusCode: 500
 *                   message: Internal Server Error
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
 * @swagger
 * /api/lamaran-magang-api/get:
 *   get:
 *     summary: Ambil seluruh data lamaran
 *     description: Mengambil daftar seluruh lamaran magang. Hanya dapat diakses oleh admin.
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data lamaran berhasil diambil
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * @swagger
 * /api/lamaran-magang-api/get/{id}:
 *   get:
 *     summary: Ambil detail lamaran berdasarkan ID
 *     description: Mengambil detail satu lamaran magang. Hanya dapat diakses oleh admin.
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lamaran magang
 *     responses:
 *       200:
 *         description: Detail lamaran berhasil diambil
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Lamaran tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: Lamaran tidak ditemukan
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * @swagger
 * /api/lamaran-magang-api/update/{id}:
 *   patch:
 *     summary: Perbarui status lamaran
 *     description: Mengubah status lamaran menjadi `DIPROSES`, `DITERIMA`, atau `DITOLAK`. Hanya admin.
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lamaran magang
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DIPROSES, DITERIMA, DITOLAK]
 *                 example: DITERIMA
 *     responses:
 *       200:
 *         description: Status lamaran berhasil diperbarui
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
 *                   example: Status lamaran berhasil diupdate
 *       400:
 *         description: Validasi status lamaran gagal
 *         content:
 *           application/json:
 *             examples:
 *               status_kosong:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: Mohon masukkan status baru
 *               status_tidak_valid:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: Status tidak valid
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * @swagger
 * /api/lamaran-magang-api/delete:
 *   delete:
 *     summary: Hapus seluruh data lamaran
 *     description: Menghapus seluruh data lamaran magang. Hanya dapat diakses oleh admin.
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seluruh data pelamar berhasil dihapus
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: Seluruh data pelamar berhasil dihapus
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * @swagger
 * /api/lamaran-magang-api/export:
 *   get:
 *     summary: Ekspor data lamaran ke file Excel
 *     description: Mengunduh data lamaran dalam format `.xlsx`. Hanya dapat diakses oleh admin.
 *     tags: [Lamaran Magang]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File Excel berhasil dibuat
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
