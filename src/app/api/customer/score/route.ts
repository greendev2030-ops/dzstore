import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/customer/score - Get current user's trust score
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log("[Customer Score] Session:", session?.user?.email);

        if (!session || !(session.user as any)?.id) {
            console.error("[Customer Score] No session or user ID");
            return NextResponse.json(
                { error: "Unauthorized - Please login" },
                { status: 401 }
            );
        }

        const userId = (session.user as any).id;

        // Get user info to find phone
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { phone: true, email: true }
        });

        console.log("[Customer Score] User found:", { email: user?.email, hasPhone: !!user?.phone });

        if (!user) {
            console.error("[Customer Score] User not found in database");
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Use phone if available, otherwise use email as fallback
        const identifier = user.phone || user.email;

        if (!identifier) {
            console.error("[Customer Score] No identifier (phone or email)");
            return NextResponse.json(
                { error: "No phone or email found for user" },
                { status: 400 }
            );
        }

        console.log("[Customer Score] Using identifier:", identifier);

        // Get or create customer score
        let customerScore = await prisma.customerScore.findUnique({
            where: { phone: identifier },
        });

        if (!customerScore) {
            console.log("[Customer Score] Creating new score for:", identifier);
            // Create default score for new customer
            customerScore = await prisma.customerScore.create({
                data: {
                    phone: identifier,
                    name: (session.user as any).name || null,
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
            where: { customer_phone: identifier },
            orderBy: { created_at: "desc" },
            take: 10,
        });

        console.log("[Customer Score] Success - Score:", customerScore.trust_score);

        return NextResponse.json({
            score: customerScore,
            history,
        });
    } catch (error) {
        console.error("[Customer Score] Error:", error);
        console.error("[Customer Score] Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            {
                error: "Failed to fetch customer score",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
