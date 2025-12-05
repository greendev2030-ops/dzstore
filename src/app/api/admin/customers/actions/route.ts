import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// POST - Admin actions on customer accounts
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action, user_id, phone, new_phone, points, reason } = body;

        if (!action) {
            return NextResponse.json({ error: "Action is required" }, { status: 400 });
        }

        switch (action) {
            case "RESET_BLACKLIST": {
                // Reset customer from blacklist to GOOD status
                if (!phone) {
                    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
                }

                const customerScore = await prisma.customerScore.findUnique({
                    where: { phone },
                });

                if (!customerScore) {
                    return NextResponse.json({ error: "Customer score not found" }, { status: 404 });
                }

                // Reset to good standing
                const updated = await prisma.customerScore.update({
                    where: { phone },
                    data: {
                        trust_score: 100,
                        status: "GOOD",
                        total_returns: 0, // Reset returns count
                    },
                });

                // Log this action
                await prisma.scoreHistory.create({
                    data: {
                        customer_phone: phone,
                        action: "ADMIN_RESET",
                        points_change: 100 - customerScore.trust_score,
                        previous_score: customerScore.trust_score,
                        new_score: 100,
                        notes: reason || "Admin reset blacklist status",
                    },
                });

                return NextResponse.json({
                    message: "Customer removed from blacklist successfully",
                    customerScore: updated,
                });
            }

            case "CHANGE_PHONE": {
                // Change customer phone number
                if (!user_id || !new_phone) {
                    return NextResponse.json(
                        { error: "User ID and new phone are required" },
                        { status: 400 }
                    );
                }

                // Validate Algerian phone format
                const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
                if (!phoneRegex.test(new_phone)) {
                    return NextResponse.json(
                        { error: "Invalid Algerian phone format" },
                        { status: 400 }
                    );
                }

                // Check if new phone already exists
                const existingPhone = await prisma.user.findFirst({
                    where: { phone: new_phone, id: { not: user_id } },
                });

                if (existingPhone) {
                    return NextResponse.json(
                        { error: "This phone number is already registered" },
                        { status: 409 }
                    );
                }

                // Get old phone for score transfer
                const user = await prisma.user.findUnique({
                    where: { id: user_id },
                });

                if (!user) {
                    return NextResponse.json({ error: "User not found" }, { status: 404 });
                }

                const oldPhone = user.phone;

                // Update user phone
                await prisma.user.update({
                    where: { id: user_id },
                    data: { phone: new_phone },
                });

                // Transfer customer score to new phone if exists
                if (oldPhone) {
                    const oldScore = await prisma.customerScore.findUnique({
                        where: { phone: oldPhone },
                    });

                    if (oldScore) {
                        // Check if new phone has a score
                        const newPhoneScore = await prisma.customerScore.findUnique({
                            where: { phone: new_phone },
                        });

                        if (newPhoneScore) {
                            // Merge scores - keep the better one but track returns
                            await prisma.customerScore.update({
                                where: { phone: new_phone },
                                data: {
                                    trust_score: Math.max(oldScore.trust_score, newPhoneScore.trust_score),
                                    total_orders: oldScore.total_orders + newPhoneScore.total_orders,
                                    total_returns: oldScore.total_returns + newPhoneScore.total_returns,
                                    successful_orders: oldScore.successful_orders + newPhoneScore.successful_orders,
                                },
                            });
                            // Delete old score
                            await prisma.customerScore.delete({
                                where: { phone: oldPhone },
                            });
                        } else {
                            // Just update the phone in existing score
                            await prisma.customerScore.update({
                                where: { phone: oldPhone },
                                data: { phone: new_phone },
                            });
                        }

                        // Log action
                        await prisma.scoreHistory.create({
                            data: {
                                customer_phone: new_phone,
                                action: "PHONE_CHANGED",
                                points_change: 0,
                                previous_score: oldScore.trust_score,
                                new_score: oldScore.trust_score,
                                notes: reason || `Phone changed from ${oldPhone} to ${new_phone} by admin`,
                            },
                        });
                    }
                }

                return NextResponse.json({
                    message: "Phone number changed successfully",
                    old_phone: oldPhone,
                    new_phone: new_phone,
                });
            }

            case "ADJUST_SCORE": {
                // Add or subtract points from customer score
                if (!phone || points === undefined) {
                    return NextResponse.json(
                        { error: "Phone and points are required" },
                        { status: 400 }
                    );
                }

                const customerScore = await prisma.customerScore.findUnique({
                    where: { phone },
                });

                if (!customerScore) {
                    return NextResponse.json({ error: "Customer score not found" }, { status: 404 });
                }

                const newScore = Math.max(0, Math.min(200, customerScore.trust_score + points));

                // Determine new status based on score
                let newStatus = "GOOD";
                if (newScore <= 0) newStatus = "BLACKLISTED";
                else if (newScore <= 30) newStatus = "WATCH";
                else if (newScore <= 60) newStatus = "WARNING";

                const updated = await prisma.customerScore.update({
                    where: { phone },
                    data: {
                        trust_score: newScore,
                        status: newStatus,
                    },
                });

                // Log action
                await prisma.scoreHistory.create({
                    data: {
                        customer_phone: phone,
                        action: points > 0 ? "ADMIN_ADD_POINTS" : "ADMIN_DEDUCT_POINTS",
                        points_change: points,
                        previous_score: customerScore.trust_score,
                        new_score: newScore,
                        notes: reason || `Admin adjusted score by ${points} points`,
                    },
                });

                return NextResponse.json({
                    message: `Score adjusted by ${points} points`,
                    customerScore: updated,
                });
            }

            case "SET_STATUS": {
                // Manually set customer status
                if (!phone || !body.status) {
                    return NextResponse.json(
                        { error: "Phone and status are required" },
                        { status: 400 }
                    );
                }

                const validStatuses = ["GOOD", "WARNING", "WATCH", "BLACKLISTED"];
                if (!validStatuses.includes(body.status)) {
                    return NextResponse.json(
                        { error: "Invalid status" },
                        { status: 400 }
                    );
                }

                // Set score based on status
                const scoreMap: Record<string, number> = {
                    GOOD: 100,
                    WARNING: 50,
                    WATCH: 25,
                    BLACKLISTED: 0,
                };

                const customerScore = await prisma.customerScore.findUnique({
                    where: { phone },
                });

                if (!customerScore) {
                    return NextResponse.json({ error: "Customer score not found" }, { status: 404 });
                }

                const newScore = scoreMap[body.status];
                const updated = await prisma.customerScore.update({
                    where: { phone },
                    data: {
                        trust_score: newScore,
                        status: body.status,
                    },
                });

                // Log action
                await prisma.scoreHistory.create({
                    data: {
                        customer_phone: phone,
                        action: "ADMIN_SET_STATUS",
                        points_change: newScore - customerScore.trust_score,
                        previous_score: customerScore.trust_score,
                        new_score: newScore,
                        notes: reason || `Admin set status to ${body.status}`,
                    },
                });

                return NextResponse.json({
                    message: `Status set to ${body.status}`,
                    customerScore: updated,
                });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in admin customer action:", error);
        return NextResponse.json(
            { error: "Failed to perform action" },
            { status: 500 }
        );
    }
}
