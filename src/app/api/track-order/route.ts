import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const email = searchParams.get('email');

        if (!orderId || !email) {
            return NextResponse.json(
                { error: 'Order ID and email are required' },
                { status: 400 }
            );
        }

        // Find order by ID and email
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                guest_email: email,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found. Please check your Order ID and email.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Error tracking order:', error);
        return NextResponse.json(
            { error: 'Error tracking order' },
            { status: 500 }
        );
    }
}
