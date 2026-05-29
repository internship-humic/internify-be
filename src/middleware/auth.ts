import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { CustomError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
		role: 'ADMIN' | 'STUDENT';
	};
}

export const protect = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
	let token: string | undefined;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		const error: CustomError = new Error('Not authorized to access this route, token is missing');
		error.statusCode = 401;
		return next(error);
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'internify_secret_key_2026_dev') as {
			id: string;
			email: string;
			role: 'ADMIN' | 'STUDENT';
		};

		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
			select: {
				id: true,
				email: true,
				role: true,
			},
		});

		if (!user) {
			const error: CustomError = new Error('User belonging to this token no longer exists');
			error.statusCode = 401;
			return next(error);
		}

		req.user = user as { id: string; email: string; role: 'ADMIN' | 'STUDENT' };
		next();
	} catch (err) {
		const error: CustomError = new Error('Not authorized to access this route, token is invalid or expired');
		error.statusCode = 401;
		return next(error);
	}
};

export const restrictTo = (...roles: ('ADMIN' | 'STUDENT')[]) => {
	return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			const error: CustomError = new Error('You do not have permission to perform this action');
			error.statusCode = 403;
			return next(error);
		}
		next();
	};
};
