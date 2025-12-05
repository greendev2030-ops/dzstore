import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email || '' },
            select: {
                full_name: true,
                email: true,
                phone: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                name: user.full_name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Error fetching profile' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, phone } = await request.json();

        // Prevent phone number changes (security measure)
        if (phone !== undefined) {
            return NextResponse.json(
                { error: 'Phone number cannot be changed. Please contact support for assistance.' },
                { status: 403 }
            );
        }

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Update user (only name, phone is locked)
        const user = await prisma.user.update({
            where: { email: session.user.email || '' },
            data: {
                full_name: name
            },
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                name: user.full_name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Error updating profile' },
            { status: 500 }
        );
    }
}
