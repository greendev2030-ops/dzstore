import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Get single ticket with messages
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { created_at: "asc" },
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

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Verify ownership (customers can only see their own tickets)
        if (ticket.user_id !== (session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error("Error fetching ticket:", error);
        return NextResponse.json(
            { error: "Error fetching ticket" },
            { status: 500 }
        );
    }
}

// POST - Add message to ticket
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { message } = body;

        if (!message || message.trim() === "") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Verify ticket exists and belongs to user
        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        if (ticket.user_id !== (session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Create message
        const newMessage = await prisma.ticketMessage.create({
            data: {
                ticket_id: id,
                sender_id: (session.user as any).id,
                sender_type: "CUSTOMER",
                message: message.trim(),
            },
        });

        // Update ticket status if it was resolved/closed
        if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
            await prisma.supportTicket.update({
                where: { id },
                data: { status: "OPEN" },
            });
        }

        return NextResponse.json(
            { message: "Message sent successfully", data: newMessage },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding message:", error);
        return NextResponse.json(
            { error: "Error adding message" },
            { status: 500 }
        );
    }
}
