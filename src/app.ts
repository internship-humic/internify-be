import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, CustomError } from './middleware/errorHandler';
import { setupSwaggerDocs } from './docs/swagger';

const app = express();

app.use(helmet({
	crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
	origin: true,
	credentials: true,
}));

app.use(morgan('dev'));

// File upload statis biar bisa diakses lewat /uploads atau /api/uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Endpoint root API
 *     description: Endpoint dasar.
 *     responses:
 *       200:
 *         description: Informasi umum API berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the Internify API
 *                 documentation:
 *                   type: string
 *                   example: Check /api/health untuk status
 */
app.get('/', (_req: Request, res: Response) => {
	res.status(200).json({
		message: 'Welcome to the Internify API',
		documentation: 'Check /api/health untuk status',
	});
});

app.use('/api', routes);

setupSwaggerDocs(app);

app.use((req: Request, _res: Response, next: NextFunction) => {
	const error: CustomError = new Error(`Not Found - ${req.originalUrl}`);
	error.statusCode = 404;
	next(error);
});

app.use(errorHandler);

export default app;
