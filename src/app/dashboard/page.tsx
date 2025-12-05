"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface OrderItem {
    id: string;
    quantity: number;
    price: string;
    product: {
        name: string;
        image_url: string;
    };
}

interface Order {
    id: string;
    total_amount: string;
    status: string;
    created_at: string;
    guest_name?: string;
    guest_phone?: string;
    guest_address?: string;
    guest_wilaya?: string;
    items: OrderItem[];
}

export default function CustomerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchOrders();
        }
    }, [session]);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/customer/orders");
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p>Are you sure you want to cancel this order?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            proceedWithCancellation(orderId);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Yes, Cancel
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        No, Keep It
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const proceedWithCancellation = async (orderId: string) => {
        setCancellingOrderId(orderId);
        try {
            const res = await fetch("/api/customer/cancel-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId }),
            });

            const data = await res.json();

            if (res.ok) {
                await fetchOrders();
                toast.success("Order cancelled successfully!");
            } else {
                toast.error(data.error || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error("Error cancelling order");
        } finally {
            setCancellingOrderId(null);
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

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const totalOrders = orders.length;
    const validOrders = orders.filter(o => o.status?.toUpperCase() !== 'CANCELLED');
    const totalSpent = validOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const pendingOrders = orders.filter(o => o.status === "PENDING").length;
    const lastOrder = orders[0];

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
                        Welcome, <span className="text-gradient-animated">{session.user?.name}</span>
                    </h1>
                    <p className="text-slate-400">Manage your orders and account information</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass-card rounded-2xl p-6 border-purple-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Orders</p>
                                <p className="text-3xl font-bold text-white">{totalOrders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border-purple-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Spent</p>
                                <p className="text-xl font-bold text-gradient-animated">
                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(totalSpent)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border-purple-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                                <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Pending Orders</p>
                                <p className="text-3xl font-bold text-white">{pendingOrders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border-purple-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Last Order</p>
                                <p className="text-sm font-bold text-white">
                                    {lastOrder ? new Date(lastOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="glass-card rounded-2xl border-purple-500/20 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">
                            Order <span className="text-gradient-animated">History</span>
                        </h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
                            <p className="text-slate-400 mb-6">Start shopping to see your orders here</p>
                            <Link href="/products" className="inline-flex px-6 py-3 btn-primary">
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-white/5 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-mono text-slate-400">#{order.id.slice(0, 8)}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-400 mb-1">Total</p>
                                            <p className="text-2xl font-bold text-gradient-animated">
                                                {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(order.total_amount))}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                                                <img
                                                    src={item.product.image_url}
                                                    alt={item.product.name}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                                                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Cancel Button for Pending Orders */}
                                    {order.status === "PENDING" && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={cancellingOrderId === order.id}
                                                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {cancellingOrderId === order.id ? (
                                                    <>
                                                        <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                                                        Cancelling...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Cancel Order
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
