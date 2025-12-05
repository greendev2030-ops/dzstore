const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

// Set DATABASE_URL if not set
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://postgres.qohndwgsievfluieykgi:Codelyoko1993..@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";
}

const prisma = new PrismaClient();

async function main() {
    console.log('Creating admin user...');
    const passwordHash = await hash('admin123', 10);

    const admin = await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {
            password_hash: passwordHash, // Update password if user exists
        },
        create: {
            username: 'admin',
            password_hash: passwordHash,
            role: 'admin',
        },
    });

    console.log('Admin user created/updated:', admin);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
