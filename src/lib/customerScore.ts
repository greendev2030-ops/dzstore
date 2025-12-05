import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Determine customer status based on trust score
 */
export function determineStatus(score: number): string {
    if (score < 20) return "BLACKLISTED";
    if (score < 40) return "WATCH";
    if (score < 60) return "WARNING";
    return "GOOD";
}

/**
 * Update customer score within a transaction or standalone
 */
export async function updateCustomerScore(
    phone: string,
    action: string,
    pointsChange: number,
    tx?: Prisma.TransactionClient
) {
    const client = tx || prisma;

    try {
        // Get or create customer score
        let customerScore = await client.customerScore.findUnique({
            where: { phone },
        });

        if (!customerScore) {
            // Create new customer score record
            customerScore = await client.customerScore.create({
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

        const previousScore = customerScore.trust_score;
        const newScore = Math.max(0, Math.min(100, previousScore + pointsChange));

        // Update score and return count if applicable
        const updated = await client.customerScore.update({
            where: { phone },
            data: {
                trust_score: newScore,
                total_returns: {
                    increment: action === "RETURN_REQUESTED" ? 1 : 0,
                },
                successful_orders: {
                    increment: action === "ORDER_COMPLETED" ? 1 : 0,
                },
                status: determineStatus(newScore),
            },
        });

        // Log the change
        await client.scoreHistory.create({
            data: {
                customer_phone: phone,
                action,
                points_change: pointsChange,
                previous_score: previousScore,
                new_score: newScore,
            },
        });

        return updated;
    } catch (error) {
        console.error("Error updating customer score:", error);
        throw error; // Re-throw to handle in transaction
    }
}
