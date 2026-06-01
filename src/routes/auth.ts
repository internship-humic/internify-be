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
 * @route   POST /api/auth/register
 * @desc    Daftarin user baru dgn role STUDENT (Mahasiswa)
 * @access  Public
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
 * @route   POST /api/auth/login
 * @desc    Autentikasi user biar dapet token
 * @access  Public
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
 * @route   GET /api/auth/profile
 * @desc    Dapetin profil user yg lagi login
 * @access  Private
 */
router.get('/profile', protect, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
			const error: CustomError = new Error('User tidak ditemukan');
			error.statusCode = 404;
			return next(error);
		}

		const profile = user.role === 'ADMIN' ? user.admin : user.mahasiswa;

		res.status(200).json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				profile,
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
