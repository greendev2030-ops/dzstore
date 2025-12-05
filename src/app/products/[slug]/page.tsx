import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { useCart } from "@/context/CartContext";
import AddToCartButton from "@/components/AddToCartButton";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/ui/motion";
import ProductReviews from "@/components/ProductReviews";

export const dynamic = 'force-dynamic';

async function getProduct(slug: string) {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            reviews: {
                orderBy: { created_at: 'desc' }
            }
        },
    });
    return product ? JSON.parse(JSON.stringify(product)) : null;
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
    const products = await prisma.product.findMany({
        where: {
            category_id: categoryId,
            id: { not: currentProductId },
            is_active: true,
        },
        take: 4,
        orderBy: { created_at: "desc" },
        include: { category: true },
    });
    return JSON.parse(JSON.stringify(products));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.category_id, product.id);

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: product.category.name, href: `/products?category=${product.category.slug}` },
                        { label: product.name, href: `/products/${product.slug}` }
                    ]}
                />

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 mt-8">
                    {/* Image */}
                    <FadeIn className="relative aspect-square rounded-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse-glow" />
                        {/* Holographic Border */}
                        <div className="absolute inset-0 border border-white/10 rounded-2xl z-20 pointer-events-none" />
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-10 blur-sm" />

                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover relative z-0 transition-transform duration-700 group-hover:scale-105"
                        />
                    </FadeIn>

                    {/* Info */}
                    <SlideUp delay={0.2} className="flex flex-col justify-center">
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
                                {product.category.name}
                            </span>
                            <h1 className="text-5xl font-bold text-white mb-4 font-[family-name:var(--font-orbitron)] tracking-wide">
                                {product.name}
                            </h1>
                            <div className="flex items-baseline gap-4 mb-6">
                                {product.discount_price && Number(product.discount_price) < Number(product.price) ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <p className="text-4xl font-bold text-gradient-animated">
                                                {new Intl.NumberFormat("fr-DZ", {
                                                    style: "currency",
                                                    currency: "DZD",
                                                }).format(Number(product.discount_price))}
                                            </p>
                                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold shadow-lg animate-pulse-glow">
                                                SAVE {Math.round(((Number(product.price) - Number(product.discount_price)) / Number(product.price)) * 100)}%
                                            </span>
                                        </div>
                                        <p className="text-lg text-slate-500 line-through">
                                            {new Intl.NumberFormat("fr-DZ", {
                                                style: "currency",
                                                currency: "DZD",
                                            }).format(Number(product.price))}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-4xl font-bold text-gradient-animated">
                                        {new Intl.NumberFormat("fr-DZ", {
                                            style: "currency",
                                            currency: "DZD",
                                        }).format(Number(product.price))}
                                    </p>
                                )}
                            </div>
                            <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                                {product.description}
                            </p>
                        </div>

                        <div className="glass-card rounded-2xl p-6 border-purple-500/20 mb-8">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                                Specifications
                            </h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                {Object.entries(JSON.parse(product.specs || "{}")).map(
                                    ([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <span className="text-slate-500 capitalize text-xs mb-1">
                                                {key.replace(/_/g, " ")}
                                            </span>
                                            <span className="text-slate-200 font-medium border-b border-white/5 pb-1">
                                                {String(value)}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <AddToCartButton product={product} />
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-sm text-slate-300 p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span>
                                    {product.delivery_fee && Number(product.delivery_fee) > 0
                                        ? `Delivery: ${new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(product.delivery_fee))}`
                                        : 'Free Delivery'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300 p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span>Cash on Delivery</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300 p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span>Secure Shopping</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300 p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span>Authentic Products</span>
                            </div>
                        </div>
                    </SlideUp>
                </div>

                {/* Reviews Section */}
                <ProductReviews productId={product.id} reviews={product.reviews || []} />

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20 border-t border-white/10 pt-12">
                        <SlideUp delay={0.4}>
                            <h2 className="text-2xl font-bold text-white mb-8 font-[family-name:var(--font-orbitron)]">
                                You Might Also <span className="text-gradient-animated">Like</span>
                            </h2>
                        </SlideUp>
                        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((related: any) => (
                                <StaggerItem key={related.id}>
                                    <ProductCard product={related} />
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </section>
                )}
            </div>
        </div>
    );
}
