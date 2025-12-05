const fs = require('fs');
const path = require('path');

console.log('Starting debug script...');

// Manually load .env
try {
    const envPath = path.join(__dirname, '.env');
    console.log('Checking .env at:', envPath);

    if (fs.existsSync(envPath)) {
        console.log('.env file found.');
        const envConfig = fs.readFileSync(envPath, 'utf8');

        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                const cleanKey = key.trim();
                const cleanValue = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
                process.env[cleanKey] = cleanValue;
            }
        });
    } else {
        console.error('.env file NOT found!');
    }
} catch (e) {
    console.error('Error loading .env:', e);
}

// Fallback for DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not found in .env, using fallback: file:./dev.db');
    process.env.DATABASE_URL = 'file:./dev.db';
}

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log('Fetching all orders...');
    try {
        const orders = await prisma.order.findMany({
            include: { user: true }
        });

        console.log('\n--- SIMULATING API CALCULATION ---');

        // Group by user email
        const customers = {};

        orders.forEach(order => {
            const email = order.user?.email || order.guest_email;
            if (!email) return;

            if (!customers[email]) {
                customers[email] = {
                    orders: [],
                    totalSpent: 0
                };
            }

            customers[email].orders.push(order);
        });

        // Calculate for each customer
        Object.keys(customers).forEach(email => {
            const customer = customers[email];
            console.log(`\nCustomer: ${email}`);

            let calculatedTotal = 0;

            customer.orders.forEach(order => {
                const status = order.status?.toUpperCase().trim();
                const amount = Number(order.total_amount);
                const isCancelled = status === 'CANCELLED';

                console.log(`  - Order ${order.id}: ${status} (${amount}) -> ${isCancelled ? 'EXCLUDED' : 'INCLUDED'}`);

                if (!isCancelled) {
                    calculatedTotal += amount;
                }
            });

            console.log(`  => Total Spent: ${calculatedTotal}`);
        });

    } catch (err) {
        console.error('Error fetching orders:', err);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
