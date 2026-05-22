import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, CustomError } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());

app.use(morgan('dev'));

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
