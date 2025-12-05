import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ⚠️ WARNING: DELETE THIS FILE AFTER CREATING YOUR ADMIN!
// This endpoint is for one-time use only during setup.
// Leaving it active is a SECURITY RISK!

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password, secret } = body;

        // Simple protection - change this to a random string
        const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || "change-me-in-production";

        if (secret !== SETUP_SECRET) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password required" },
                { status: 400 }
            );
        }

        // Check if admin already exists
        const existing = await prisma.admin.findUnique({
            where: { username },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Admin already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await prisma.admin.create({
            data: {
                username,
                password_hash,
                role: "admin",
            },
        });

        return NextResponse.json({
            message: "Admin created successfully!",
            username: admin.username,
            id: admin.id,
            warning: "⚠️ DELETE THIS API ENDPOINT NOW!"
        });
    } catch (error) {
        console.error("Error creating admin:", error);
        return NextResponse.json(
            { error: "Failed to create admin" },
            { status: 500 }
        );
    }
}
