import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

function isValidAlgerianPhone(phone: string): boolean {
    return /^(05|06|07)[0-9]{8}$/.test(phone);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, fullName, phone } = body;

        // Validate required fields
        if (!email || !password || !phone) {
            return NextResponse.json(
                { message: "Missing required fields. Email, password, and phone number are required." },
                { status: 400 }
            );
        }

        // Validate phone format
        if (!isValidAlgerianPhone(phone)) {
            return NextResponse.json(
                { message: "Invalid phone number format. Must be Algerian format (05/06/07 followed by 8 digits)." },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Check if phone is already registered
        const existingPhone = await prisma.user.findFirst({
            where: { phone },
        });

        if (existingPhone) {
            return NextResponse.json(
                { message: "This phone number is already registered" },
                { status: 409 }
            );
        }

        const passwordHash = await hash(password, 10);

        // Create user and initialize CustomerScore in a transaction
        const user = await prisma.$transaction(async (tx: any) => {
            // Create user
            const newUser = await tx.user.create({
                data: {
                    email,
                    password_hash: passwordHash,
                    full_name: fullName,
                    phone,
                },
            });

            // Initialize CustomerScore
            await tx.customerScore.create({
                data: {
                    phone,
                    name: fullName,
                    trust_score: 100,
                    total_orders: 0,
                    total_returns: 0,
                    successful_orders: 0,
                    status: "GOOD",
                },
            });

            return newUser;
        });

        return NextResponse.json(
            { message: "User created successfully", user: { id: user.id, email: user.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
