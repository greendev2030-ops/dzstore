import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        const body = await request.json()
        const { items, guest_info } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in order' }, { status: 400 })
        }

        if (!guest_info || !guest_info.name || !guest_info.phone) {
            return NextResponse.json({ error: 'Missing guest information' }, { status: 400 })
        }

        // Calculate total and verify prices
        let itemsTotal = 0
        let deliveryTotal = 0
        const orderItemsData: { product_id: string; quantity: number; price: number }[] = []

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.product_id },
            })

            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.product_id}` }, { status: 400 })
            }

            // Use discount price if available, otherwise regular price
            const price = product.discount_price ? Number(product.discount_price) : Number(product.price)
            itemsTotal += price * item.quantity

            // Add delivery fee (once per unique product)
            // Note: In this loop, each item is a unique product line item from the cart
            const deliveryFee = product.delivery_fee ? Number(product.delivery_fee) : 0
            deliveryTotal += deliveryFee

            orderItemsData.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price: price, // Store the actual price paid (discounted or regular)
            })
        }

        const totalAmount = itemsTotal + deliveryTotal

        // Check if customer is blacklisted
        const customerScore = await prisma.customerScore.findUnique({
            where: { phone: guest_info.phone }
        });

        if (customerScore?.status === "BLACKLISTED") {
            return NextResponse.json(
                {
                    error: "Your account has been suspended due to policy violations. Please contact support for assistance.",
                    status: "BLACKLISTED"
                },
                { status: 403 }
            );
        }

        // Show warning for customers under watch
        if (customerScore?.status === "WATCH" || customerScore?.status === "WARNING") {
            console.warn(`Customer ${guest_info.phone} with status ${customerScore.status} is placing an order`);
        }

        // Create Order in Transaction
        const order = await prisma.$transaction(async (tx: any) => {
            // Check stock and decrement for all items
            for (const item of orderItemsData) {
                const product = await tx.product.findUnique({
                    where: { id: item.product_id },
                });

                if (!product) {
                    throw new Error(`Product not found: ${item.product_id}`);
                }

                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }

                await tx.product.update({
                    where: { id: item.product_id },
                    data: {
                        stock_quantity: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            const newOrder = await tx.order.create({
                data: {
                    user_id: (session?.user as any)?.id, // Link to user if logged in
                    guest_name: guest_info.name,
                    guest_email: guest_info.email,
                    guest_phone: guest_info.phone,
                    guest_address: guest_info.address,
                    guest_wilaya: guest_info.wilaya,
                    guest_commune: guest_info.commune,
                    total_amount: totalAmount,
                    status: 'PENDING',
                    items: {
                        create: orderItemsData,
                    },
                },
            })

            return newOrder
        })

        return NextResponse.json({ order_id: order.id }, { status: 201 })
    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json(
            { error: 'Error creating order' },
            { status: 500 }
        )
    }
}
