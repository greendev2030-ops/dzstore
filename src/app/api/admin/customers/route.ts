import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get all orders with items
        const orders = await prisma.order.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                user: true,
            },
        });

        // Get all registered users
        const users = await prisma.user.findMany({
            include: {
                orders: {
                    include: {
                        items: true,
                    },
                },
            },
        });

        // Group orders by customer
        const customersMap = new Map();

        // Add registered users first
        users.forEach((user: any) => {
            const key = user.email;

            // Only count non-cancelled orders for total spent
            const validOrders = user.orders.filter((order: any) => order.status?.toUpperCase().trim() !== 'CANCELLED');

            const totalSpent = validOrders.reduce((sum: any, order: any) => sum + Number(order.total_amount), 0);

            customersMap.set(key, {
                name: user.full_name || user.email,
                email: user.email,
                phone: user.phone || 'N/A',
                address: user.address ? `${user.address}, ${user.wilaya}` : 'N/A',
                orders: validOrders,
                totalSpent: totalSpent,
                isRegistered: true,
                lastOrderDate: validOrders[0]?.created_at || user.created_at,
            });
        });

        // Add guest orders
        orders.forEach((order: any) => {
            if (!order.user_id && (order as any).guest_email) {
                const key = (order as any).guest_email;
                if (!customersMap.has(key)) {
                    customersMap.set(key, {
                        name: (order as any).guest_name || 'Guest',
                        email: (order as any).guest_email,
                        phone: (order as any).guest_phone || 'N/A',
                        address: (order as any).guest_address ? `${(order as any).guest_address}, ${(order as any).guest_commune}, ${(order as any).guest_wilaya}` : 'N/A',
                        orders: [],
                        totalSpent: 0,
                        isRegistered: false,
                        lastOrderDate: order.created_at,
                    });
                }

                const customer = customersMap.get(key);

                // Add order to the list
                customer.orders.push(order);

                // Only add to total spent if order is not cancelled
                if (order.status?.toUpperCase().trim() !== 'CANCELLED') {
                    customer.totalSpent += Number(order.total_amount);
                }

                // Update last order date (only for non-cancelled orders)
                if (order.status?.toUpperCase().trim() !== 'CANCELLED' && new Date(order.created_at) > new Date(customer.lastOrderDate)) {
                    customer.lastOrderDate = order.created_at;
                }
            }
        });

        // Convert to array and add segmentation
        const customers = Array.from(customersMap.values()).map((customer) => {
            const daysSinceLastOrder = Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));

            // Only count non-cancelled orders for segmentation
            const validOrderCount = customer.orders.filter((order: any) => order.status?.toUpperCase().trim() !== 'CANCELLED').length;

            let segment: 'VIP' | 'Active' | 'New' | 'Regular' = 'Regular';

            // VIP: 10+ valid orders OR spent > 100,000 DZD
            if (validOrderCount >= 10 || customer.totalSpent > 100000) {
                segment = 'VIP';
            }
            // Active: ordered in last 30 days and 3+ valid orders
            else if (daysSinceLastOrder <= 30 && validOrderCount >= 3) {
                segment = 'Active';
            }
            // New: 1-2 valid orders
            else if (validOrderCount <= 2) {
                segment = 'New';
            }

            return {
                ...customer,
                segment,
                orderCount: validOrderCount,
                debug_breakdown: {
                    total_raw: customer.orders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0),
                    cancelled_amount: customer.orders
                        .filter((o: any) => o.status?.toUpperCase().trim() === 'CANCELLED')
                        .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0),
                    valid_count: validOrderCount,
                    all_count: customer.orders.length
                }
            };
        });

        // Sort by total spent
        customers.sort((a, b) => b.totalSpent - a.totalSpent);

        return NextResponse.json({ customers: JSON.parse(JSON.stringify(customers)) });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Error fetching customers' },
            { status: 500 }
        );
    }
}
