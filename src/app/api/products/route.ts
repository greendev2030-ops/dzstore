import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'

    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000000')

    const skip = (page - 1) * limit

    const where: any = {
        is_active: true,
        price: {
            gte: minPrice,
            lte: maxPrice,
        },
    }

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
        ]
    }

    if (category) {
        where.category = {
            slug: category,
        }
    }

    let orderBy: any = { created_at: 'desc' }

    if (sort === 'price_asc') orderBy = { price: 'asc' }
    if (sort === 'price_desc') orderBy = { price: 'desc' }

    try {
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: true,
                },
            }),
            prisma.product.count({ where }),
        ])

        return NextResponse.json({
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Error fetching products' },
            { status: 500 }
        )
    }
}
