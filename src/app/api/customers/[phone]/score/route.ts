import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/customers/:phone/score - Get customer trust score
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ phone: string }> }
) {
    try {
        const { phone } = await params;

        // Get or create customer score
        let customerScore = await prisma.customerScore.findUnique({
            where: { phone },
        });

        if (!customerScore) {
            // Create default score for new customer
            customerScore = await prisma.customerScore.create({
                data: {
                    phone,
                    trust_score: 100,
                    total_orders: 0,
                    total_returns: 0,
                    successful_orders: 0,
                    status: "GOOD",
                },
            });
        }

        // Get score history
        const history = await prisma.scoreHistory.findMany({
            where: { customer_phone: phone },
            orderBy: { created_at: "desc" },
            take: 10,
        });

        return NextResponse.json({
            score: customerScore,
            history,
        });
    } catch (error) {
        console.error("Error fetching customer score:", error);
        return NextResponse.json(
            { error: "Failed to fetch customer score" },
            { status: 500 }
        );
    }
}
