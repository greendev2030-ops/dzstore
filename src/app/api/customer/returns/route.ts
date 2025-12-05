import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/customer/returns - Get returns for logged-in customer
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = session.user as any;

        // Get all orders for this user
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { user_id: user.id },
                    { guest_email: user.email },
                ],
            },
            select: {
                id: true,
                guest_phone: true,
            },
        });

        if (orders.length === 0) {
            return NextResponse.json([]);
        }

        // Get all order IDs
        const orderIds = orders.map((o: any) => o.id);

        // Get all returns for these orders
        const returns = await prisma.return.findMany({
            where: {
                order_id: {
                    in: orderIds,
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return NextResponse.json(returns);
    } catch (error) {
        console.error("Error fetching customer returns:", error);
        return NextResponse.json(
            { error: "Failed to fetch returns" },
            { status: 500 }
        );
    }
}
