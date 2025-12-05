"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { VALID_RETURN_REASONS } from "@/lib/returnValidation";

interface OrderItem {
    id: string;
    quantity: number;
    price: string;
    product_id: string;
    product: {
        id: string;
        name: string;
        image_url: string;
    };
}

interface Order {
    id: string;
    total_amount: string;
    status: string;
    created_at: string;
    items: OrderItem[];
}

export default function RequestReturnPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [reason, setReason] = useState("");
    const [detailedReason, setDetailedReason] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchOrders();
            fetchUserPhone();
        }
    }, [session]);

    const fetchUserPhone = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                setCustomerPhone(data.user.phone || "");
            }
        } catch (error) {
            console.error("Error fetching user phone:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/customer/orders");
            const data = await res.json();
            // Only show delivered or shipped orders that can be returned
            const returnableOrders = (data.orders || []).filter(
                (order: Order) =>
                    ["DELIVERED", "SHIPPED"].includes(order.status) &&
                    isWithinReturnPeriod(order.created_at)
            );
            setOrders(returnableOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const isWithinReturnPeriod = (orderDate: string): boolean => {
        const created = new Date(orderDate);
        const now = new Date();
        const daysDiff = Math.floor(
            (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff <= 7; // 7 days return period
    };

    const selectedOrder = orders.find((o) => o.id === selectedOrderId);
    const availableProducts = selectedOrder?.items || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/returns", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_id: selectedOrderId,
                    product_id: selectedProductId,
                    customer_phone: customerPhone,
                    customer_name: session?.user?.name,
                    reason,
                    detailed_reason: detailedReason,
                }),
            });

            const data = await res.json();

            console.log("Return submission response:", {
                status: res.status,
                ok: res.ok,
                data: data
            });

            if (!res.ok) {
                const errorMessage = data.error || data.details || "Failed to submit return request";
                console.error("Return submission failed:", {
                    status: res.status,
                    error: data.error,
                    details: data.details
                });
                throw new Error(errorMessage);
            }

            toast.success("Return request submitted successfully!");
            router.push("/profile/returns");
        } catch (error: any) {
            console.error("Error submitting return:", error);
            toast.error(error.message || "Failed to submit return request");
        } finally {
            setSubmitting(false);
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

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
                        Request <span className="text-gradient-animated">Return</span>
                    </h1>
                    <p className="text-slate-400">
                        You can return items within 7 days of delivery
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center border-orange-500/20">
                        <svg
                            className="w-16 h-16 mx-auto text-slate-600 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h3 className="text-xl font-bold text-white mb-2">
                            No returnable orders
                        </h3>
                        <p className="text-slate-400 mb-6">
                            You don't have any orders that can be returned at this time.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="btn-primary px-6 py-3"
                        >
                            View Orders
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="glass-card rounded-2xl p-8 border-orange-500/20 space-y-6"
                    >
                        {/* Select Order */}
                        <div>
                            <label
                                htmlFor="order"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Select Order <span className="text-red-400">*</span>
                            </label>
                            <select
                                id="order"
                                value={selectedOrderId}
                                onChange={(e) => {
                                    setSelectedOrderId(e.target.value);
                                    setSelectedProductId(""); // Reset product selection
                                }}
                                required
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all"
                            >
                                <option value="">Choose an order...</option>
                                {orders.map((order) => (
                                    <option key={order.id} value={order.id}>
                                        Order #{order.id.slice(0, 8)} -{" "}
                                        {new Date(order.created_at).toLocaleDateString()} -{" "}
                                        {new Intl.NumberFormat("fr-DZ", {
                                            style: "currency",
                                            currency: "DZD",
                                        }).format(Number(order.total_amount))}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Select Product */}
                        {selectedOrderId && (
                            <div>
                                <label
                                    htmlFor="product"
                                    className="block text-sm font-medium text-slate-300 mb-2"
                                >
                                    Select Product <span className="text-red-400">*</span>
                                </label>
                                <div className="space-y-2">
                                    {availableProducts.map((item) => (
                                        <label
                                            key={item.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedProductId === item.product_id
                                                ? "border-orange-500/50 bg-orange-500/10"
                                                : "border-white/10 bg-black/30 hover:border-white/20"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="product"
                                                value={item.product_id}
                                                checked={selectedProductId === item.product_id}
                                                onChange={(e) =>
                                                    setSelectedProductId(e.target.value)
                                                }
                                                required
                                                className="w-5 h-5 text-orange-500"
                                            />
                                            <img
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-white">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Phone Number */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Phone Number <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                value={customerPhone}
                                readOnly
                                title="Phone number from your profile (cannot be changed here)"
                                required
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-slate-400 placeholder-slate-500 focus:outline-none transition-all cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                🔒 Using your registered phone number
                            </p>
                        </div>

                        {/* Reason */}
                        <div>
                            <label
                                htmlFor="reason"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Reason for Return <span className="text-red-400">*</span>
                            </label>
                            <select
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all"
                            >
                                <option value="">Choose a reason...</option>
                                {VALID_RETURN_REASONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r.replace(/_/g, " ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Detailed Reason */}
                        <div>
                            <label
                                htmlFor="details"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Additional Details (Optional)
                            </label>
                            <textarea
                                id="details"
                                value={detailedReason}
                                onChange={(e) => setDetailedReason(e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="Provide more details about the issue..."
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-all resize-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {detailedReason.length}/500 characters
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 btn-primary py-4 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 font-bold flex items-center justify-center gap-2">
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            Submit Return Request
                                        </>
                                    )}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard")}
                                className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                            <div className="flex gap-3">
                                <svg
                                    className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="text-sm text-orange-200">
                                    <p className="font-medium mb-1">Important Notes:</p>
                                    <ul className="list-disc list-inside space-y-1 text-orange-300/80">
                                        <li>Returns must be requested within 7 days of delivery</li>
                                        <li>
                                            Requesting a return will deduct 10 points from your
                                            trust score
                                        </li>
                                        <li>
                                            Our team will review your request and contact you within
                                            24-48 hours
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
