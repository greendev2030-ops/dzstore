const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres.qohndwgsievfluieykgi:Codelyoko1993..@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true'
        }
    }
});

async function testConnection() {
    try {
        console.log('Testing connection...');
        await prisma.$connect();
        console.log('✅ Connected successfully!');

        const count = await prisma.product.count();
        console.log('Products count:', count);

    } catch (error) {
        console.log('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
