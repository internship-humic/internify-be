import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, CustomError } from './middleware/errorHandler';

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

app.get('/', (_req: Request, res: Response) => {
	res.status(200).json({
		message: 'Welcome to the Internify API',
		documentation: 'Check /api/health untuk status',
	});
});

app.use('/api', routes);

app.use((req: Request, _res: Response, next: NextFunction) => {
	const error: CustomError = new Error(`Not Found - ${req.originalUrl}`);
	error.statusCode = 404;
	next(error);
});

app.use(errorHandler);

export default app;
