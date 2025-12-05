import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateCustomerScore } from "@/lib/customerScore";
import {
    validateReturnRequest,
    RETURN_CONFIG,
    isValidReturnStatus,
} from "@/lib/returnValidation";
import { Prisma } from "@prisma/client";

// GET /api/returns - List returns (with optional filters)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const phone = searchParams.get("phone");
        const userId = searchParams.get("user_id");

        const where: Prisma.ReturnWhereInput = {};
        if (status && isValidReturnStatus(status)) {
            where.status = status;
        }
        if (phone) {
            where.customer_phone = phone;
        }
        if (userId) {
            where.user_id = userId;
        }

        const returns = await prisma.return.findMany({
            where,
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json(returns);
    } catch (error) {
        console.error("Error fetching returns:", error);
        return NextResponse.json(
            { error: "Failed to fetch returns" },
            { status: 500 }
        );
    }
}

// POST /api/returns - Create a new return request
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please login to request a return." },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate request data
        const validation = validateReturnRequest(body);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validation.errors,
                },
                { status: 400 }
            );
        }

        const {
            order_id,
            product_id,
            customer_phone,
            customer_name,
            reason,
            detailed_reason,
            images,
        } = body;

        // Verify order exists and belongs to user
        const order = await prisma.order.findUnique({
            where: { id: order_id },
            include: { items: true },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Check order ownership (for logged in users)
        if (order.user_id && order.user_id !== (session.user as any).id) {
            return NextResponse.json(
                { error: "Access denied. This order does not belong to you." },
                { status: 403 }
            );
        }

        // Check if product exists in the order
        const orderItem = order.items.find(
            (item) => item.product_id === product_id
        );

        if (!orderItem) {
            return NextResponse.json(
                { error: "Product not found in this order" },
                { status: 400 }
            );
        }

        // Check return period
        const orderDate = new Date(order.created_at);
        const today = new Date();
        const daysSinceOrder = Math.floor(
            (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceOrder > RETURN_CONFIG.RETURN_PERIOD_DAYS) {
            return NextResponse.json(
                {
                    error: `Return period expired. You can only return within ${RETURN_CONFIG.RETURN_PERIOD_DAYS} days of purchase.`,
                },
                { status: 400 }
            );
        }

        // Check for existing return request
        const existingReturn = await prisma.return.findFirst({
            where: {
                order_id,
                product_id,
                status: {
                    in: ["PENDING", "APPROVED", "COMPLETED"],
                },
            },
        });

        if (existingReturn) {
            return NextResponse.json(
                {
                    error: "A return request already exists for this product",
                    existing_return_id: existingReturn.id,
                    existing_status: existingReturn.status,
                },
                { status: 409 }
            );
        }

        // Create return request and update customer score in a transaction
        const returnRequest = await prisma.$transaction(async (tx) => {
            // 1. Create the return request
            const newReturn = await tx.return.create({
                data: {
                    user_id: (session.user as any).id, // Link to logged-in user
                    order_id,
                    product_id,
                    customer_phone,
                    customer_name,
                    reason,
                    detailed_reason,
                    images: images ? JSON.stringify(images) : null,
                    status: "PENDING",
                },
            });

            // 2. Update customer score
            await updateCustomerScore(
                customer_phone,
                "RETURN_REQUESTED",
                RETURN_CONFIG.POINTS_FOR_RETURN_REQUEST,
                tx
            );

            // 3. Sync phone number to user profile if missing
            // This ensures the Trust Score page finds the correct record
            const currentUser = await tx.user.findUnique({
                where: { id: (session.user as any).id }
            });

            if (currentUser && !currentUser.phone) {
                await tx.user.update({
                    where: { id: (session.user as any).id },
                    data: { phone: customer_phone }
                });
            }

            return newReturn;
        });

        return NextResponse.json(returnRequest, { status: 201 });
    } catch (error) {
        console.error("Error creating return:", error);

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json(
                    { error: "Duplicate return request" },
                    { status: 409 }
                );
            }
            if (error.code === "P2025") {
                return NextResponse.json(
                    { error: "Related record not found" },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to create return request" },
            { status: 500 }
        );
    }
}
