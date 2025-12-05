import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user ID from session
        const userEmail = session.user.email;

        // For registered users, fetch their orders
        const user = await prisma.user.findUnique({
            where: { email: userEmail || '' },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch orders for this user
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { user_id: user.id },
                    { guest_email: userEmail }
                ]
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        return NextResponse.json(
            { error: 'Error fetching orders' },
            { status: 500 }
        );
    }
}
