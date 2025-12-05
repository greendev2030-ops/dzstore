import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // Get user email from session
        const userEmail = session.user.email;

        // Find the order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if order belongs to this user
        const user = await prisma.user.findUnique({
            where: { email: userEmail || '' },
        });

        const isOwner = order.user_id === user?.id || order.guest_email === userEmail;

        if (!isOwner) {
            return NextResponse.json({ error: 'Not authorized to cancel this order' }, { status: 403 });
        }

        // Check if order is still pending
        if (order.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Only pending orders can be cancelled' },
                { status: 400 }
            );
        }

        // Update order status to CANCELLED
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });

        return NextResponse.json({
            message: 'Order cancelled successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json(
            { error: 'Error cancelling order' },
            { status: 500 }
        );
    }
}
