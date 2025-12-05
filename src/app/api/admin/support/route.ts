import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Admin: Get all tickets with filters
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const type = searchParams.get("type");
        const priority = searchParams.get("priority");

        // Build filter
        const where: any = {};

        if (status && status !== "ALL") {
            where.status = status;
        }
        if (type && type !== "ALL") {
            where.type = type;
        }
        if (priority && priority !== "ALL") {
            where.priority = priority;
        }

        const tickets = await prisma.supportTicket.findMany({
            where,
            orderBy: [
                { priority: "desc" },
                { created_at: "desc" },
            ],
            include: {
                messages: {
                    orderBy: { created_at: "desc" },
                    take: 1,
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

        // Get counts for dashboard
        const counts = await prisma.supportTicket.groupBy({
            by: ["status"],
            _count: { id: true },
        });

        const typeCounts = await prisma.supportTicket.groupBy({
            by: ["type"],
            _count: { id: true },
        });

        return NextResponse.json({
            tickets,
            stats: {
                byStatus: counts.reduce((acc: any, curr: any) => {
                    acc[curr.status] = curr._count.id;
                    return acc;
                }, {}),
                byType: typeCounts.reduce((acc: any, curr: any) => {
                    acc[curr.type] = curr._count.id;
                    return acc;
                }, {}),
            }
        });
    } catch (error) {
        console.error("Error fetching admin tickets:", error);
        return NextResponse.json(
            { error: "Error fetching tickets" },
            { status: 500 }
        );
    }
}
