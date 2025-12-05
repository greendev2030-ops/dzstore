import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT - Update category
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, slug } = body;

        const category = await prisma.category.update({
            where: { id },
            data: { name, slug },
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

// DELETE - Delete category
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
