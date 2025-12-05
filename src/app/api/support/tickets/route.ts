import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - List tickets (customer gets their own, admin gets all)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const type = searchParams.get("type");

        // Build filter
        const where: any = {
            user_id: (session.user as any).id,
        };

        if (status && status !== "ALL") {
            where.status = status;
        }
        if (type && type !== "ALL") {
            where.type = type;
        }

        const tickets = await prisma.supportTicket.findMany({
            where,
            orderBy: { created_at: "desc" },
            include: {
                messages: {
                    orderBy: { created_at: "desc" },
                    take: 1,
                },
                user: {
                    select: {
                        full_name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        return NextResponse.json({ tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return NextResponse.json(
            { error: "Error fetching tickets" },
            { status: 500 }
        );
    }
}

// POST - Create new ticket
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { subject, type, description, priority } = body;

        // Validation
        if (!subject || !type || !description) {
            return NextResponse.json(
                { error: "Subject, type, and description are required" },
                { status: 400 }
            );
        }

        const validTypes = ["PHONE_CHANGE", "BLACKLIST_INQUIRY", "ORDER_ISSUE", "GENERAL"];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: "Invalid ticket type" },
                { status: 400 }
            );
        }

        // Create ticket
        const ticket = await prisma.supportTicket.create({
            data: {
                user_id: (session.user as any).id,
                subject,
                type,
                description,
                priority: priority || "NORMAL",
                status: "OPEN",
            },
        });

        return NextResponse.json(
            { message: "Ticket created successfully", ticket },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating ticket:", error);
        return NextResponse.json(
            { error: "Error creating ticket" },
            { status: 500 }
        );
    }
}
