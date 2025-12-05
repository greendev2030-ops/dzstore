"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart, totalDeliveryFee, grandTotal } = useCart();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [userPhone, setUserPhone] = useState("");

    // Fetch user's registered phone number
    useEffect(() => {
        const fetchUserPhone = async () => {
            if (session?.user) {
                try {
                    const res = await fetch("/api/user/profile");
                    if (res.ok) {
                        const data = await res.json();
                        setUserPhone(data.user.phone || "");
                    }
                } catch (error) {
                    console.error("Error fetching user phone:", error);
                }
            }
        };
        fetchUserPhone();
    }, [session]);

    // Handle loading state
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    // Handle unauthenticated state
    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center border-purple-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-4 font-[family-name:var(--font-orbitron)]">
                            Login Required
                        </h1>
                        <p className="text-slate-400 mb-8">
                            Please sign in or create an account to complete your purchase.
                        </p>

                        <div className="space-y-4">
                            <Link
                                href="/auth/login?callbackUrl=/checkout"
                                className="block w-full btn-primary py-3 rounded-xl font-bold relative overflow-hidden group"
                            >
                                <span className="relative z-10">Sign In</span>
                            </Link>

                            <Link
                                href="/auth/register?callbackUrl=/checkout"
                                className="block w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl transition-all"
                            >
                                Create Account
                            </Link>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <Link href="/cart" className="text-sm text-slate-400 hover:text-white transition-colors">
                                ← Back to Cart
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
                <Link href="/" className="text-emerald-400 hover:text-emerald-300">
                    Go back to shopping
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const guestInfo = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            wilaya: formData.get("wilaya"),
            commune: formData.get("commune"),
        };

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: items.map((item) => ({
                        product_id: item.id,
                        quantity: item.quantity,
                    })),
                    guest_info: guestInfo,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Display the actual error message from the server
                setError(data.error || "Failed to place order");
                setLoading(false);
                return;
            }

            clearCart();
            router.push(`/order-confirmation/${data.order_id}`);
        } catch (err) {
            console.error("Order error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <h1 className="text-4xl font-bold text-white mb-8 font-[family-name:var(--font-orbitron)]">
                    Checkout <span className="text-gradient-animated">(Cash on Delivery)</span>
                </h1>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                    {/* Order Summary */}
                    <div className="mt-10 lg:mt-0 order-2">
                        <div className="glass-card rounded-2xl p-6 border-purple-500/30 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />

                            <h2 className="text-lg font-medium text-white mb-4 relative z-10">Order Summary</h2>
                            <div className="bg-black/40 border border-white/10 rounded-xl p-6 relative z-10">
                                <ul className="divide-y divide-white/10">
                                    {items.map((item) => (
                                        <li key={item.id} className="py-4 flex justify-between">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10">
                                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {item.discount_price && Number(item.discount_price) < Number(item.price) ? (
                                                    <>
                                                        <p className="text-sm font-medium text-emerald-400">
                                                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.discount_price) * item.quantity)}
                                                        </p>
                                                        <p className="text-xs text-slate-500 line-through">
                                                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.price) * item.quantity)}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm font-medium text-emerald-400">
                                                        {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.price) * item.quantity)}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                                    <div className="flex justify-between text-slate-300">
                                        <span>Subtotal</span>
                                        <span>{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Delivery</span>
                                        {totalDeliveryFee === 0 ? (
                                            <span className="text-emerald-400">Free</span>
                                        ) : (
                                            <span>{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(totalDeliveryFee)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-base font-medium text-white pt-2 border-t border-white/10">
                                        <span>Total</span>
                                        <span className="text-xl font-bold text-gradient-animated">
                                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(grandTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Form */}
                    <div className="order-1">
                        <div className="glass-card rounded-2xl p-8 border-purple-500/20 relative overflow-hidden">
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            defaultValue={session?.user?.name || ""}
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            defaultValue={session?.user?.email || ""}
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            id="phone"
                                            required
                                            value={userPhone}
                                            readOnly
                                            title="Phone number from your profile (cannot be changed here)"
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-slate-400 placeholder-slate-500 focus:outline-none transition-all cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">🔒 Using your registered phone number</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="wilaya" className="block text-sm font-medium text-slate-300 mb-2">
                                            Wilaya
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                            <select
                                                name="wilaya"
                                                id="wilaya"
                                                required
                                                className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all appearance-none"
                                            >
                                                <option value="" className="bg-slate-900">Select Wilaya</option>
                                                <option value="Algiers" className="bg-slate-900">Algiers</option>
                                                <option value="Oran" className="bg-slate-900">Oran</option>
                                                <option value="Constantine" className="bg-slate-900">Constantine</option>
                                                <option value="Setif" className="bg-slate-900">Setif</option>
                                                {/* Add more wilayas as needed */}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="commune" className="block text-sm font-medium text-slate-300 mb-2">
                                            Commune
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                            <input
                                                type="text"
                                                name="commune"
                                                id="commune"
                                                required
                                                className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                                placeholder="Enter commune"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">
                                        Detailed Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <textarea
                                            name="address"
                                            id="address"
                                            rows={3}
                                            required
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                            placeholder="Enter your full address"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            "Confirm Order"
                                        )}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
