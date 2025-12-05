// Script to create admin user
// Run with: node create-admin.mjs

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const username = process.argv[2] || 'admin';
        const password = process.argv[3] || 'admin123';

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await prisma.admin.create({
            data: {
                username,
                password_hash,
                role: 'admin',
            },
        });

        console.log('✅ Admin created successfully!');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('ID:', admin.id);
    } catch (error) {
        if (error.code === 'P2002') {
            console.error('❌ Error: Username already exists!');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();

// Usage:
// node create-admin.mjs
// node create-admin.mjs myusername mypassword
