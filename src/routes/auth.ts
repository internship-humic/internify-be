import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { protect, AuthenticatedRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

const generateToken = (payload: { id: string; email: string; role: string }) => {
	return jwt.sign(
		payload,
		process.env.JWT_SECRET || 'internify_secret_key_2026_dev',
		{ expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
	);
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi akun mahasiswa baru
 *     description: Membuat akun pengguna baru dengan role `STUDENT` beserta profil mahasiswa.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - namaDepan
 *               - kontak
 *               - jurusan
 *               - universitas
 *               - negara
 *             properties:
 *               email:
 *                 type: string
 *                 example: student@example.com
 *               password:
 *                 type: string
 *                 example: Student123!
 *               namaDepan:
 *                 type: string
 *                 example: Alya
 *               namaBelakang:
 *                 type: string
 *                 example: Putri
 *               kontak:
 *                 type: string
 *                 example: 08123456789
 *               jurusan:
 *                 type: string
 *                 example: Informatika
 *               universitas:
 *                 type: string
 *                 example: Telkom University
 *               negara:
 *                 type: string
 *                 example: Indonesia
 *               cvPath:
 *                 type: string
 *                 example: /uploads/docs/cv.pdf
 *               portofolioPath:
 *                 type: string
 *                 example: /uploads/docs/portofolio.pdf
 *               motivasi:
 *                 type: string
 *                 example: Saya tertarik mengikuti program ini.
 *               relevantSkills:
 *                 type: string
 *                 example: React, Node.js
 *     responses:
 *       201:
 *         description: Registrasi mahasiswa berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registrasi mahasiswa berhasil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: cku3xq2v0000xk8w7a1b2c3d4
 *                     email:
 *                       type: string
 *                       example: student@example.com
 *                     role:
 *                       type: string
 *                       example: STUDENT
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-06-02T10:00:00.000Z
 *       400:
 *         description: Validasi registrasi gagal
 *         content:
 *           application/json:
 *             examples:
 *               field_wajib_kosong:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: Mohon lengkapi semua field wajib yang diperlukan
 *               email_sudah_terdaftar:
 *                 value:
 *                   status: error
 *                   statusCode: 400
 *                   message: Email sudah terdaftar
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const {
			email,
			password,
			namaDepan,
			namaBelakang,
			kontak,
			jurusan,
			universitas,
			negara,
			cvPath,
			portofolioPath,
			motivasi,
			relevantSkills,
		} = req.body;

		if (!email || !password || !namaDepan || !kontak || !jurusan || !universitas || !negara) {
			const error: CustomError = new Error('Mohon lengkapi semua field wajib yang diperlukan');
			error.statusCode = 400;
			return next(error);
		}

		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			const error: CustomError = new Error('Email sudah terdaftar');
			error.statusCode = 400;
			return next(error);
		}

		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);

		const newUser = await prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					email,
					passwordHash,
					role: 'STUDENT',
				},
			});

			await tx.mahasiswa.create({
				data: {
					idUser: user.id,
					namaDepan,
					namaBelakang: namaBelakang || null,
					kontak,
					jurusan,
					universitas,
					negara,
					cvPath: cvPath || '',
					portofolioPath: portofolioPath || '',
					motivasi: motivasi || '',
					relevantSkills: relevantSkills || '',
				},
			});

			return user;
		});

		res.status(201).json({
			success: true,
			message: 'Registrasi mahasiswa berhasil',
			data: {
				id: newUser.id,
				email: newUser.email,
				role: newUser.role,
				createdAt: newUser.createdAt,
			},
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna dan mendapatkan token JWT
 *     description: Melakukan autentikasi pengguna (admin/mahasiswa) dan mengembalikan token akses.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@internify.com
 *               password:
 *                 type: string
 *                 example: AdminInternify123!
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: cku3xq2v0000xk8w7a1b2c3d4
 *                         email:
 *                           type: string
 *                           example: admin@internify.com
 *                         role:
 *                           type: string
 *                           example: ADMIN
 *                         profile:
 *                           type: object
 *                           description: Data profil admin atau mahasiswa
 *       401:
 *         description: Autentikasi gagal
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 401
 *               message: Email atau password salah
 *       400:
 *         description: Validasi login gagal
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 400
 *               message: Mohon masukkan email dan password
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			const error: CustomError = new Error('Mohon masukkan email dan password');
			error.statusCode = 400;
			return next(error);
		}

		const user = await prisma.user.findUnique({
			where: { email },
			include: {
				admin: true,
				mahasiswa: true,
			},
		});

		if (!user) {
			const error: CustomError = new Error('Email atau password salah');
			error.statusCode = 401;
			return next(error);
		}

		const isMatch = await bcrypt.compare(password, user.passwordHash);
		if (!isMatch) {
			const error: CustomError = new Error('Email atau password salah');
			error.statusCode = 401;
			return next(error);
		}

		const profile = user.role === 'ADMIN' ? user.admin : user.mahasiswa;

		const token = generateToken({
			id: user.id,
			email: user.email,
			role: user.role,
		});

		res.status(200).json({
			success: true,
			data: {
				token,
				user: {
					id: user.id,
					email: user.email,
					role: user.role,
					profile,
				},
			},
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil profil pengguna yang sedang login
 *     description: Mengembalikan informasi ringkas user berdasarkan token JWT aktif.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil pengguna berhasil diambil
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
 *                       example: cku3xq2v0000xk8w7a1b2c3d4
 *                     email:
 *                       type: string
 *                       example: admin@internify.com
 *                     role:
 *                       type: string
 *                       example: ADMIN
 *                     nama_depan:
 *                       type: string
 *                       example: Super
 *       401:
 *         description: Token tidak valid atau tidak tersedia
 *         content:
 *           application/json:
 *             examples:
 *               token_missing:
 *                 value:
 *                   status: error
 *                   statusCode: 401
 *                   message: Not authorized to access this route, token is missing
 *               token_invalid:
 *                 value:
 *                   status: error
 *                   statusCode: 401
 *                   message: Not authorized to access this route, token is invalid or expired
 *               user_token_tidak_ada:
 *                 value:
 *                   status: error
 *                   statusCode: 401
 *                   message: User belonging to this token no longer exists
 *       404:
 *         description: Pengguna tidak ditemukan
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               statusCode: 404
 *               message: User not found
 */
router.get('/me', protect, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				admin: true,
				mahasiswa: true,
			},
		});

		if (!user) {
			const error: CustomError = new Error('User not found');
			error.statusCode = 404;
			return next(error);
		}

		const profile = user.role === 'ADMIN' ? user.admin : user.mahasiswa;
		const namaDepan = profile?.namaDepan || '';

		res.status(200).json({
			status: true,
			data: {
				id: user.id,
				email: user.email,
				role: user.role,
				nama_depan: namaDepan
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
