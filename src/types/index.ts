export interface Product {
    id: string
    name: string
    slug: string
    description: string
    price: number // Stored as Decimal in DB, but JSON returns number/string usually. We'll handle it.
    discount_price?: number // Optional discount price
    cost_price?: number;
    delivery_fee?: number // Delivery fee for this product (0 = free)
    image_url: string
    category?: {
        name: string
        slug: string
    }
}
