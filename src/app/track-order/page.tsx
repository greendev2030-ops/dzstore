"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setOrder(null);

        try {
            const res = await fetch(`/api/track-order?orderId=${orderId}&email=${email}`);
            const data = await res.json();

            if (res.ok) {
                setOrder(data.order);
            } else {
                toast.error(data.error || "Order not found");
            }
        } catch (error) {
            console.error("Error tracking order:", error);
            toast.error("Error tracking order");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "PENDING":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "CONFIRMED":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "SHIPPED":
                return "bg-purple-500/20 text-purple-400 border-purple-500/30";
            case "DELIVERED":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            case "CANCELLED":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30";
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
                        Track Your <span className="text-gradient-animated">Order</span>
                    </h1>
                    <p className="text-slate-400">Enter your order details to track your order status</p>
                </div>

                {/* Track Order Form */}
                <div className="glass-card rounded-2xl p-8 border-purple-500/20 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Order ID
                            </label>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="e.g., e736bee3-9125-4bbc..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Tracking...
                                </span>
                            ) : (
                                "Track Order"
                            )}
                        </button>
                    </form>
                </div>

                {/* Order Details */}
                {order && (
                    <div className="glass-card rounded-2xl p-8 border-purple-500/20">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                                <p className="text-sm text-slate-400 font-mono mt-1">#{order.id.slice(0, 16)}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Customer</p>
                                <p className="text-white font-medium">{order.guest_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Phone</p>
                                <p className="text-white font-medium">{order.guest_phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Address</p>
                                <p className="text-white font-medium">{order.guest_address}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Wilaya</p>
                                <p className="text-white font-medium">{order.guest_wilaya}</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <p className="text-sm text-slate-400 mb-4">Order Items</p>
                            <div className="space-y-3">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 bg-white/5 rounded-lg p-3">
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-white">{item.product.name}</p>
                                            <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-gradient-animated">
                                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.price))}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-white/10 mt-6 pt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-lg text-white">Total</span>
                                <span className="text-2xl font-bold text-gradient-animated">
                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(order.total_amount))}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
