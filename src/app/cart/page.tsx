"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, totalDeliveryFee, grandTotal } = useCart();

    const total = items.reduce((sum, item) => {
        const effectivePrice = item.discount_price ? Number(item.discount_price) : Number(item.price);
        return sum + effectivePrice * item.quantity;
    }, 0);

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="mb-8">
                        <svg className="w-32 h-32 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gradient-animated mb-4 font-[family-name:var(--font-orbitron)]">
                        Your Cart is Empty
                    </h1>
                    <p className="text-slate-400 mb-8">
                        Looks like you haven't added anything to your cart yet.
                    </p>
                    <Link
                        href="/products"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-105"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4 font-[family-name:var(--font-orbitron)]">
                        Shopping <span className="text-gradient-animated">Cart</span>
                    </h1>
                    <p className="text-slate-400">
                        {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="glass-card rounded-2xl p-6 hover:border-purple-500/50 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex gap-6 relative z-10">
                                    {/* Product Image */}
                                    <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/products/${item.slug}`}
                                            className="text-xl font-bold text-white hover:text-purple-400 transition-colors line-clamp-2"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                                            {item.description}
                                        </p>

                                        <div className="mt-4 flex items-center gap-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-purple-600 rounded transition-colors"
                                                >
                                                    −
                                                </button>
                                                <span className="w-12 text-center font-bold text-white">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-purple-600 rounded transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        {item.discount_price && Number(item.discount_price) < Number(item.price) ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="text-2xl font-bold text-gradient-animated">
                                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.discount_price) * item.quantity)}
                                                </div>
                                                <div className="text-xs text-slate-500 line-through">
                                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.price) * item.quantity)}
                                                </div>
                                                <div className="text-sm text-slate-400 mt-1">
                                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.discount_price))} each
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-2xl font-bold text-gradient-animated">
                                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.price) * item.quantity)}
                                                </div>
                                                <div className="text-sm text-slate-400 mt-1">
                                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.price))} each
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl p-6 sticky top-24 border-purple-500/30 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />

                            <h2 className="text-2xl font-bold text-white mb-6 font-[family-name:var(--font-orbitron)] relative z-10">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6 relative z-10">
                                <div className="flex justify-between text-slate-300">
                                    <span>Subtotal</span>
                                    <span className="font-medium">
                                        {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(total)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Delivery</span>
                                    {totalDeliveryFee === 0 ? (
                                        <span className="font-medium text-emerald-400">Free</span>
                                    ) : (
                                        <span className="font-medium">
                                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(totalDeliveryFee)}
                                        </span>
                                    )}
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span className="text-white">Total</span>
                                        <span className="text-gradient-animated">
                                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(grandTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full py-4 px-6 btn-primary relative overflow-hidden group text-center mb-4"
                            >
                                <span className="relative z-10">Proceed to Checkout</span>
                            </Link>

                            <Link
                                href="/products"
                                className="block w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-center font-bold rounded-xl transition-all"
                            >
                                Continue Shopping
                            </Link>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-white/10 space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span>{totalDeliveryFee === 0 ? 'Free delivery' : 'Fast delivery'} across Algeria</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <span>Secure payment</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span>Cash on delivery available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
