import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import authRouter from './auth';
import lowonganRouter from './lowongan';
import lamaranRouter from './lamaran';
import partnershipRouter from './partnership';
import researchRouter from './research';
import feedbackRouter from './feedback';
import faqRouter from './faq';

const router = Router();

router.use('/auth', authRouter);
router.use('/auth-api', authRouter);
router.use('/lowongan-magang-api', lowonganRouter);
router.use('/lamaran-magang-api', lamaranRouter);
router.use('/partnership-api', partnershipRouter);
router.use('/hasil-research-api', researchRouter);
router.use('/feedback-api', feedbackRouter);
router.use('/faq-api', faqRouter);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Cek status kesehatan server
 *     description: Digunakan untuk memastikan API berjalan normal.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Server berjalan dengan baik
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running smoothly
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-06-02T10:00:00.000Z
 */
router.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({
		status: 'OK',
		message: 'Server is running smoothly',
		timestamp: new Date().toISOString(),
	});
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil daftar seluruh pengguna
 *     description: Mengembalikan seluruh data user dasar dari database.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: cku3xq2v0000xk8w7a1b2c3d4
 *                       email:
 *                         type: string
 *                         example: admin@internify.com
 *                       role:
 *                         type: string
 *                         example: ADMIN
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-06-02T10:00:00.000Z
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * @swagger
 * /api/error-test:
 *   get:
 *     summary: Simulasi error server untuk pengujian
 *     description: Endpoint utilitas untuk menguji middleware penanganan error global.
 *     tags: [Admin]
 *     responses:
 *       500:
 *         description: Error simulasi berhasil dipicu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: This is a test error to verify our custom global error handler!
 */
router.get('/error-test', (_req: Request, _res: Response, next: NextFunction) => {
	try {
		throw new Error('This is a test error to verify our custom global error handler!');
	} catch (error) {
		next(error);
	}
});

export default router;
