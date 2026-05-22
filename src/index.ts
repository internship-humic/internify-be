import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
	console.log(`=========================================`);
	console.log(`  Server jalanin di ${PORT}      `);
	console.log(`  Environment: ${NODE_ENV}               `);
	console.log(`  API base: http://localhost:${PORT}/api   `);
	console.log(`=========================================`);
});

process.on('unhandledRejection', (err: Error) => {
	console.error(`[Unhandled Rejection] Shutting down...`);
	console.error(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});

process.on('uncaughtException', (err: Error) => {
	console.error(`[Uncaught Exception] Shutting down...`);
	console.error(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
