import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - List all categories with product count
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

// POST - Create new category
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, slug } = body;

        const category = await prisma.category.create({
            data: {
                name,
                slug,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
