import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateCustomerScore } from "@/lib/customerScore";
import {
    isValidReturnStatus,
    RETURN_CONFIG,
    RETURN_STATUSES,
} from "@/lib/returnValidation";

// PATCH /api/returns/:id - Update return status (Admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is admin
        // @ts-ignore
        if (session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden. Admin access required." },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { status, admin_notes, refund_amount } = body;

        if (!status) {
            return NextResponse.json(
                { error: "Status is required" },
                { status: 400 }
            );
        }

        if (!isValidReturnStatus(status)) {
            return NextResponse.json(
                {
                    error: `Invalid status. Must be one of: ${RETURN_STATUSES.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // Get the return to check customer
        const returnRequest = await prisma.return.findUnique({
            where: { id },
        });

        if (!returnRequest) {
            return NextResponse.json(
                { error: "Return not found" },
                { status: 404 }
            );
        }

        // Update return and adjust customer score in a transaction
        const updated = await prisma.$transaction(async (tx: any) => {
            // Update the return
            const updatedReturn = await tx.return.update({
                where: { id },
                data: {
                    status,
                    admin_notes,
                    refund_amount: refund_amount
                        ? parseFloat(refund_amount)
                        : undefined,
                },
            });

            // Adjust customer score ONLY if changing from PENDING
            // This prevents multiple score adjustments
            if (returnRequest.status === "PENDING") {
                if (status === "REJECTED") {
                    // Return rejected - customer was wrong, give back some points
                    await updateCustomerScore(
                        returnRequest.customer_phone,
                        "RETURN_REJECTED",
                        RETURN_CONFIG.POINTS_FOR_RETURN_REJECTED,
                        tx
                    );
                } else if (status === "COMPLETED") {
                    // Return completed successfully
                    await updateCustomerScore(
                        returnRequest.customer_phone,
                        "RETURN_COMPLETED",
                        RETURN_CONFIG.POINTS_FOR_RETURN_COMPLETED,
                        tx
                    );
                }
                // APPROVED status: no additional penalty, keep the -10 from initial request
            }

            return updatedReturn;
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating return:", error);
        return NextResponse.json(
            { error: "Failed to update return" },
            { status: 500 }
        );
    }
}
