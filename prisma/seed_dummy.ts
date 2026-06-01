import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	console.log('=== STARTING DEVELOPER DUMMY SEEDING ===');

	const adminEmail = 'admin@internify.com';
	const adminPassword = 'AdminInternify123!';
	const passwordHash = await bcrypt.hash(adminPassword, 10);

	let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
	if (!adminUser) {
		adminUser = await prisma.user.create({
			data: {
				email: adminEmail,
				passwordHash,
				role: 'ADMIN',
				admin: {
					create: {
						namaDepan: 'Super',
						namaBelakang: 'Admin'
					}
				}
			}
		});
		console.log('   Admin created:', adminEmail);
	} else {
		console.log('   Admin already exists:', adminEmail);
	}

	console.log('   Seeding Batches...');
	const batchesData = [
		{ batchNumber: 1, isActive: false },
		{ batchNumber: 2, isActive: false },
		{ batchNumber: 3, isActive: true } // Active Batch
	];

	const batches: any[] = [];
	for (const b of batchesData) {
		let dbBatch = await prisma.batch.findUnique({ where: { batchNumber: b.batchNumber } });
		if (!dbBatch) {
			dbBatch = await prisma.batch.create({ data: b });
		}
		batches.push(dbBatch);
	}
	console.log(`   Seeding Batches complete! Created/Found ${batches.length} batches.`);

	const activeBatch = batches.find(b => b.isActive) || batches[2];

	console.log('   Seeding Student Users...');
	const studentsData = [
		{
			email: 'alice@example.com',
			namaDepan: 'Alice',
			namaBelakang: 'Smith',
			kontak: '08111222333',
			jurusan: 'Informatika',
			universitas: 'Institut Teknologi Bandung',
			negara: 'Indonesia',
			cvPath: '/uploads/docs/alice-cv.pdf',
			portofolioPath: '/uploads/docs/alice-portfolio.pdf',
			motivasi: 'Saya sangat tertarik dengan UI/UX design dan ingin mempraktekkannya.',
			relevantSkills: 'Figma, Adobe XD, User Research'
		},
		{
			email: 'bob@example.com',
			namaDepan: 'Bob',
			namaBelakang: 'Johnson',
			kontak: '08222333444',
			jurusan: 'Sistem Informasi',
			universitas: 'Universitas Indonesia',
			negara: 'Indonesia',
			cvPath: '/uploads/docs/bob-cv.pdf',
			portofolioPath: '/uploads/docs/bob-portfolio.pdf',
			motivasi: 'Ingin mengembangkan keahlian React dan Tailwind CSS.',
			relevantSkills: 'React, HTML, CSS, JavaScript'
		},
		{
			email: 'charlie@example.com',
			namaDepan: 'Charlie',
			namaBelakang: 'Brown',
			kontak: '08333444555',
			jurusan: 'Teknik Komputer',
			universitas: 'Telkom University',
			negara: 'Indonesia',
			cvPath: '/uploads/docs/charlie-cv.pdf',
			portofolioPath: '/uploads/docs/charlie-portfolio.pdf',
			motivasi: 'Suka membangun server scalable dan merancang arsitektur API.',
			relevantSkills: 'Node.js, Express, MySQL, TypeScript'
		}
	];

	const mahasiswaList: any[] = [];
	for (const s of studentsData) {
		let user = await prisma.user.findUnique({
			where: { email: s.email },
			include: { mahasiswa: true }
		});

		if (!user) {
			const hash = await bcrypt.hash('Student123!', 10);
			user = await prisma.user.create({
				data: {
					email: s.email,
					passwordHash: hash,
					role: 'STUDENT',
					mahasiswa: {
						create: {
							namaDepan: s.namaDepan,
							namaBelakang: s.namaBelakang,
							kontak: s.kontak,
							jurusan: s.jurusan,
							universitas: s.universitas,
							negara: s.negara,
							cvPath: s.cvPath,
							portofolioPath: s.portofolioPath,
							motivasi: s.motivasi,
							relevantSkills: s.relevantSkills
						}
					}
				},
				include: { mahasiswa: true }
			});
		}
		mahasiswaList.push(user.mahasiswa);
	}
	console.log(`   Student seeding complete! Created/Found ${mahasiswaList.length} students.`);

	console.log('   Seeding Lowongan Listings...');
	const lowongansData = [
		{
			id: 'lowongan-ui-ux',
			posisi: 'UI/UX Designer Intern',
			kelompokPeminatan: 'Design & Creative',
			imagePath: '/uploads/images/ui-ux-design.png',
			jobdesk: '<p>Mendesain antarmuka aplikasi mobile dan web, melakukan user testing, dan wireframing.</p>',
			lokasi: 'Onsite - Bandung',
			kualifikasi: 'Menguasai Figma, memiliki portofolio desain UI/UX, kreatif.',
			benefit: 'Sertifikat magang resmi, uang transport harian, mentoring 1-on-1.',
			paid: 'PAID' as any,
			statusLowongan: 'DIBUKA' as any
		},
		{
			id: 'lowongan-frontend',
			posisi: 'Frontend Developer Intern',
			kelompokPeminatan: 'Web Engineering',
			imagePath: '/uploads/images/frontend-dev.png',
			jobdesk: '<p>Mengembangkan antarmuka responsif menggunakan React dan Tailwind CSS.</p>',
			lokasi: 'Remote',
			kualifikasi: 'Memahami React JS, ES6 JavaScript, HTML, CSS.',
			benefit: 'Sertifikat magang resmi, jam kerja fleksibel, free access learning course.',
			paid: 'UNPAID' as any,
			statusLowongan: 'DIBUKA' as any
		},
		{
			id: 'lowongan-backend',
			posisi: 'Backend Developer Intern',
			kelompokPeminatan: 'Web Engineering',
			imagePath: '/uploads/images/backend-dev.png',
			jobdesk: '<p>Membangun REST API, mengoptimalkan query database, dan integrasi backend services.</p>',
			lokasi: 'Hybrid - Jakarta',
			kualifikasi: 'Memahami Node.js, Express, dan Relational Database seperti MySQL.',
			benefit: 'Sertifikat magang resmi, konversi SKS, coworking space access.',
			paid: 'PAID' as any,
			statusLowongan: 'DIBUKA' as any
		}
	];

	const lowonganList: any[] = [];
	for (const l of lowongansData) {
		let dbLowongan = await prisma.lowonganMagang.findUnique({ where: { id: l.id } });
		if (!dbLowongan) {
			dbLowongan = await prisma.lowonganMagang.create({
				data: {
					id: l.id,
					idBatch: activeBatch.id,
					posisi: l.posisi,
					kelompokPeminatan: l.kelompokPeminatan,
					imagePath: l.imagePath,
					jobdesk: l.jobdesk,
					lokasi: l.lokasi,
					kualifikasi: l.kualifikasi,
					benefit: l.benefit,
					durasiAwal: new Date(),
					durasiAkhir: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
					statusLowongan: l.statusLowongan,
					paid: l.paid
				}
			});
		}
		lowonganList.push(dbLowongan);
	}
	console.log(`   Lowongan seeding complete! Created/Found ${lowonganList.length} listings.`);

	console.log('   Seeding Lamaran Records...');
	const lamaranData = [
		{
			idMahasiswa: mahasiswaList[0].id,
			idLowonganMagang: lowonganList[0].id,
			status: 'DIPROSES' as any
		},
		{
			idMahasiswa: mahasiswaList[1].id,
			idLowonganMagang: lowonganList[1].id,
			status: 'DIPROSES' as any
		},
		{
			idMahasiswa: mahasiswaList[2].id,
			idLowonganMagang: lowonganList[2].id,
			status: 'DIPROSES' as any
		}
	];

	let lamaranCount = 0;
	for (const lam of lamaranData) {
		const existing = await prisma.lamaranMagang.findFirst({
			where: {
				idMahasiswa: lam.idMahasiswa,
				idLowonganMagang: lam.idLowonganMagang
			}
		});

		if (!existing) {
			await prisma.lamaranMagang.create({
				data: {
					idMahasiswa: lam.idMahasiswa,
					idLowonganMagang: lam.idLowonganMagang,
					status: lam.status,
					batch: activeBatch.id
				}
			});
			lamaranCount++;
		}
	}
	console.log(`   Lamaran seeding complete! Created ${lamaranCount} new applications.`);

	console.log('\n=== DEVELOPER SEEDING COMPLETED SUCCESSFULLY ===');
}

main()
	.catch(e => {
		console.error('Seeding failed:', e);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
