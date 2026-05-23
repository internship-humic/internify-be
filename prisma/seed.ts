import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding Internify database...');

    // Seeding process ...

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
