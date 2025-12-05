"use client";

import { Product } from "@/types";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useRef, MouseEvent } from "react";

interface ProductCardProps {
    product: Product & { reviews?: Array<{ rating: number }> };
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleAddToCart = (e: MouseEvent) => {
        e.preventDefault();
        setIsAdding(true);
        addToCart(product);
        setTimeout(() => setIsAdding(false), 1000);
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateXValue = ((y - centerY) / centerY) * -10;
        const rotateYValue = ((x - centerX) / centerX) * 10;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    // Calculate average rating
    const avgRating = product.reviews && product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

    const reviewCount = product.reviews?.length || 0;

    // Determine badge
    const productData = product as any;
    const isNew = new Date(productData.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
    // const isLowStock = productData.stock_quantity < 5 && productData.stock_quantity > 0; // Removed as per user request
    const hasDiscount = productData.discount_price && Number(productData.discount_price) < Number(productData.price);
    const discountPercentage = hasDiscount ? Math.round(((Number(productData.price) - Number(productData.discount_price)) / Number(productData.price)) * 100) : 0;
    const deliveryFee = productData.delivery_fee ? Number(productData.delivery_fee) : 0;
    const isFreeDelivery = deliveryFee === 0;

    return (
        <Link href={`/products/${product.slug}`} className="group block h-full">
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="card-3d h-full relative"
                style={{
                    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                {/* Holographic Border */}
                <div className="border-holographic h-full">
                    <div className="border-holographic-content h-full flex flex-col overflow-hidden">
                        {/* Badge */}
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                            {hasDiscount && (
                                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse-glow">
                                    SAVE {discountPercentage}%
                                </span>
                            )}
                            {isNew && (
                                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    NEW
                                </span>
                            )}
                            {/* Low Stock Badge Removed */}
                            {isFreeDelivery && (
                                <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    FREE DELIVERY
                                </span>
                            )}
                        </div>

                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-gradient-to-br dark:from-slate-900 dark:to-black">
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                            />
                            {/* Glow Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col product-card-bg transition-colors duration-300">
                            <div className="flex-1">
                                <p className="product-card-category text-sm font-bold mb-1 uppercase tracking-wider">{product.category?.name}</p>
                                <h3 className="text-lg font-bold product-card-title mb-2 group-hover:text-gradient-animated transition-all line-clamp-2 font-[family-name:var(--font-orbitron)]">
                                    {product.name}
                                </h3>

                                {/* Rating */}
                                {reviewCount > 0 && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex text-yellow-500 dark:text-yellow-400 text-sm">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i} className="drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                                                    {i < Math.round(avgRating) ? "★" : "☆"}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-500 text-xs">({reviewCount})</span>
                                    </div>
                                )}

                                <p className="product-card-desc text-sm line-clamp-2 mb-4 font-medium">
                                    {product.description}
                                </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    {hasDiscount && (
                                        <span className="text-xs text-slate-500 line-through">
                                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(product.price))}
                                        </span>
                                    )}
                                    <span className={`font-bold text-gradient-animated ${hasDiscount ? 'text-xl' : 'text-2xl'}`}>
                                        {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(hasDiscount ? Number(productData.discount_price) : Number(product.price))}
                                    </span>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className={`
                                        btn-magnetic px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2
                                        ${isAdding
                                            ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                                            : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-900/50 hover:shadow-emerald-500/50"
                                        }
                                    `}
                                >
                                    {isAdding ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Added</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <span>Add</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
