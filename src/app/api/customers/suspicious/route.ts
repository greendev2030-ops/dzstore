import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/customers/suspicious - List suspicious/blacklisted customers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const minStatus = searchParams.get("status") || "WARNING";

        const statusFilter: string[] = [];
        if (minStatus === "WARNING") {
            statusFilter.push("WARNING", "WATCH", "BLACKLISTED");
        } else if (minStatus === "WATCH") {
            statusFilter.push("WATCH", "BLACKLISTED");
        } else if (minStatus === "BLACKLISTED") {
            statusFilter.push("BLACKLISTED");
        }

        const suspiciousCustomers = await prisma.customerScore.findMany({
            where: {
                status: { in: statusFilter },
            },
            orderBy: { trust_score: "asc" },
        });

        // Also get their recent returns
        const customersWithReturns = await Promise.all(
            suspiciousCustomers.map(async (customer: any) => {
                const recentReturns = await prisma.return.findMany({
                    where: { customer_phone: customer.phone },
                    orderBy: { created_at: "desc" },
                    take: 5,
                });

                return {
                    ...customer,
                    recent_returns: recentReturns,
                };
            })
        );

        return NextResponse.json(customersWithReturns);
    } catch (error) {
        console.error("Error fetching suspicious customers:", error);
        return NextResponse.json(
            { error: "Failed to fetch suspicious customers" },
            { status: 500 }
        );
    }
}
