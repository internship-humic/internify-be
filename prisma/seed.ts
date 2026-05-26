import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	console.log('Start seeding Internify database...');

	const adminEmail = 'admin@internify.com';
	const adminPassword = 'AdminInternify123!';
	const passwordHash = await bcrypt.hash(adminPassword, 10);

	// Cek Apakah ada si Admin
	const existingAdmin = await prisma.user.findUnique({
		where: { email: adminEmail }
	});

	if (!existingAdmin) {
		const adminUser = await prisma.user.create({
			data: {
				email: adminEmail,
				passwordHash: passwordHash,
				role: 'ADMIN',
				admin: {
					create: {
						namaDepan: 'Super',
						namaBelakang: 'Admin',
					}
				}
			}
		});
		console.log(`Admin user created: ${adminEmail} (password: ${adminPassword})`);
	} else {
		console.log(`Admin user already exists: ${adminEmail}`);
	}

	console.log('Seeding finished');
}

main()
	.catch((error) => {
		console.error('Seeding failed:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
