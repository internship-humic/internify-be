import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import authRouter from './auth';

const router = Router();

router.use('/auth', authRouter);

/**
 * @route   GET /api/health
 * @desc    Endpoint untuk memeriksa kesehatan/status server
 * @access  Public
 */
router.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({
		status: 'OK',
		message: 'Server is running smoothly',
		timestamp: new Date().toISOString(),
	});
});

/**
 * @route   GET /api/users
 * @desc    Mendapatkan daftar semua user dari database menggunakan Prisma
 * @access  Public
 */
router.get('/users', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				role: true,
				createdAt: true,
			},
		});
		res.status(200).json({
			success: true,
			count: users.length,
			data: users,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   GET /api/error-test
 * @desc    Mensimulasikan error server internal untuk memverifikasi middleware penanganan error global
 * @access  Public
 */
router.get('/error-test', (_req: Request, _res: Response, next: NextFunction) => {
	try {
		throw new Error('This is a test error to verify our custom global error handler!');
	} catch (error) {
		next(error);
	}
});

export default router;
