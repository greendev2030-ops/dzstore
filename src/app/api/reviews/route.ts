import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, userName, rating, comment } = body;

        if (!productId || !userName || !rating || !comment) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const review = await prisma.review.create({
            data: {
                product_id: productId,
                user_name: userName,
                rating: parseInt(rating),
                comment,
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json(
            { error: "Error creating review" },
            { status: 500 }
        );
    }
}
