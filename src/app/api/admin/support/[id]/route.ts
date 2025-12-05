import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Admin: Get single ticket with full details
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
                        id: true,
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

        // Get customer score if phone exists
        let customerScore = null;
        if (ticket.user.phone) {
            customerScore = await prisma.customerScore.findUnique({
                where: { phone: ticket.user.phone },
            });
        }

        return NextResponse.json({ ticket, customerScore });
    } catch (error) {
        console.error("Error fetching ticket:", error);
        return NextResponse.json(
            { error: "Error fetching ticket" },
            { status: 500 }
        );
    }
}

// PATCH - Admin: Update ticket status/priority/notes
export async function PATCH(
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
        const { status, priority, admin_notes } = body;

        const updateData: any = {};

        if (status) {
            updateData.status = status;
            if (status === "RESOLVED") {
                updateData.resolved_by = (session.user as any).id;
                updateData.resolved_at = new Date();
            }
        }
        if (priority) {
            updateData.priority = priority;
        }
        if (admin_notes !== undefined) {
            updateData.admin_notes = admin_notes;
        }

        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ message: "Ticket updated", ticket });
    } catch (error) {
        console.error("Error updating ticket:", error);
        return NextResponse.json(
            { error: "Error updating ticket" },
            { status: 500 }
        );
    }
}

// POST - Admin: Add reply message
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

        // Create admin message
        const newMessage = await prisma.ticketMessage.create({
            data: {
                ticket_id: id,
                sender_id: (session.user as any).id,
                sender_type: "ADMIN",
                message: message.trim(),
            },
        });

        // Update ticket status to in progress if it was open
        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
        });

        if (ticket?.status === "OPEN") {
            await prisma.supportTicket.update({
                where: { id },
                data: { status: "IN_PROGRESS" },
            });
        }

        return NextResponse.json(
            { message: "Reply sent successfully", data: newMessage },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding reply:", error);
        return NextResponse.json(
            { error: "Error adding reply" },
            { status: 500 }
        );
    }
}
