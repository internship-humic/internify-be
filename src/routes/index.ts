import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

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
