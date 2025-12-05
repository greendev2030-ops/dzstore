"use client";

import { useState, useEffect } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Return {
    id: string;
    order_id: string;
    product_id: string;
    customer_phone: string;
    customer_name?: string;
    reason: string;
    detailed_reason?: string;
    status: string;
    admin_notes?: string;
    refund_amount?: number;
    created_at: string;
}

interface SuspiciousCustomer {
    id: string;
    phone: string;
    name?: string;
    trust_score: number;
    status: string;
    total_returns: number;
    total_orders: number;
    recent_returns: Return[];
}

export default function AdminReturnsPage() {
    const [activeTab, setActiveTab] = useState<"pending" | "all" | "suspicious">("pending");
    const [returns, setReturns] = useState<Return[]>([]);
    const [suspiciousCustomers, setSuspiciousCustomers] = useState<SuspiciousCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [refundAmount, setRefundAmount] = useState("");

    useEffect(() => {
        if (activeTab === "suspicious") {
            fetchSuspiciousCustomers();
        } else {
            fetchReturns();
        }
    }, [activeTab]);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const status = activeTab === "pending" ? "PENDING" : "";
            const res = await fetch(`/api/returns${status ? `?status=${status}` : ""}`);
            const data = await res.json();
            setReturns(data);
        } catch (error) {
            console.error("Error fetching returns:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuspiciousCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/customers/suspicious?status=WARNING");
            const data = await res.json();
            setSuspiciousCustomers(data);
        } catch (error) {
            console.error("Error fetching suspicious customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedReturn) return;

        try {
            const res = await fetch(`/api/returns/${selectedReturn.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    admin_notes: adminNotes,
                    refund_amount: refundAmount ? parseFloat(refundAmount) : undefined,
                }),
            });

            if (res.ok) {
                setSelectedReturn(null);
                setAdminNotes("");
                setRefundAmount("");
                fetchReturns();
            }
        } catch (error) {
            console.error("Error updating return:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            PENDING: "bg-yellow-500/20 text-yellow-400",
            APPROVED: "bg-blue-500/20 text-blue-400",
            REJECTED: "bg-red-500/20 text-red-400",
            COMPLETED: "bg-emerald-500/20 text-emerald-400",
        };
        return styles[status] || "bg-gray-500/20 text-gray-400";
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-gradient-animated mb-2 font-[family-name:var(--font-orbitron)]">Returns Management</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "pending"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "glass-card text-slate-400 hover:text-white"
                        }`}
                >
                    Pending ({returns.filter((r) => r.status === "PENDING").length})
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "all"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "glass-card text-slate-400 hover:text-white"
                        }`}
                >
                    All Returns
                </button>
                <button
                    onClick={() => setActiveTab("suspicious")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "suspicious"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "glass-card text-slate-400 hover:text-white"
                        }`}
                >
                    Suspicious Customers ({suspiciousCustomers.length})
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="glass-card p-12 rounded-2xl text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading...</p>
                </div>
            ) : activeTab === "suspicious" ? (
                <div className="space-y-4">
                    {suspiciousCustomers.map((customer) => (
                        <div key={customer.id} className="glass-card p-6 rounded-2xl">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {customer.name || customer.phone}
                                    </h3>
                                    <p className="text-sm text-slate-400">{customer.phone}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-400 mb-1">Trust Score</p>
                                    <p
                                        className={`text-2xl font-bold ${customer.trust_score >= 60
                                            ? "text-green-500"
                                            : customer.trust_score >= 40
                                                ? "text-yellow-500"
                                                : customer.trust_score >= 20
                                                    ? "text-orange-500"
                                                    : "text-red-500"
                                            }`}
                                    >
                                        {customer.trust_score}
                                    </p>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${customer.status === "BLACKLISTED"
                                            ? "bg-red-500/20 text-red-400"
                                            : customer.status === "WATCH"
                                                ? "bg-orange-500/20 text-orange-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                            }`}
                                    >
                                        {customer.status}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-white/5 rounded-lg">
                                    <p className="text-sm text-slate-400">Total Orders</p>
                                    <p className="text-xl font-bold text-white">
                                        {customer.total_orders}
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-lg">
                                    <p className="text-sm text-slate-400">Total Returns</p>
                                    <p className="text-xl font-bold text-orange-400">
                                        {customer.total_returns}
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-lg">
                                    <p className="text-sm text-slate-400">Return Rate</p>
                                    <p className="text-xl font-bold text-red-400">
                                        {customer.total_orders > 0
                                            ? Math.round(
                                                (customer.total_returns / customer.total_orders) *
                                                100
                                            )
                                            : 0}
                                        %
                                    </p>
                                </div>
                            </div>
                            {customer.recent_returns.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-slate-400 mb-2">Recent Returns:</p>
                                    <div className="space-y-2">
                                        {customer.recent_returns.slice(0, 3).map((ret) => (
                                            <div
                                                key={ret.id}
                                                className="text-xs text-slate-500 bg-white/5 p-2 rounded"
                                            >
                                                {ret.reason} -{" "}
                                                {new Date(ret.created_at).toLocaleDateString()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {returns.map((returnItem) => (
                        <div
                            key={returnItem.id}
                            className="glass-card p-6 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all"
                            onClick={() => setSelectedReturn(returnItem)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white">
                                            {returnItem.customer_name || returnItem.customer_phone}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(returnItem.status)}`}>
                                            {returnItem.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-1">
                                        <span className="font-medium">Reason:</span> {returnItem.reason}
                                    </p>
                                    {returnItem.detailed_reason && (
                                        <p className="text-sm text-slate-400">
                                            {returnItem.detailed_reason}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500 mt-2">
                                        {new Date(returnItem.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Return Details */}
            {selectedReturn && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Return Details</h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-sm text-slate-400">Customer</label>
                                <p className="text-white font-medium">
                                    {selectedReturn.customer_name || selectedReturn.customer_phone}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">Reason</label>
                                <p className="text-white">{selectedReturn.reason}</p>
                            </div>
                            {selectedReturn.detailed_reason && (
                                <div>
                                    <label className="text-sm text-slate-400">Details</label>
                                    <p className="text-white">{selectedReturn.detailed_reason}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-slate-400 block mb-2">Admin Notes</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                                    rows={3}
                                    placeholder="Add notes..."
                                />
                            </div>

                            <div>
                                <label className="text-sm text-slate-400 block mb-2">Refund Amount</label>
                                <input
                                    type="number"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleUpdateStatus("APPROVED")}
                                className="flex-1 btn-primary bg-green-600 hover:bg-green-700"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleUpdateStatus("REJECTED")}
                                className="flex-1 btn-primary bg-red-600 hover:bg-red-700"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => setSelectedReturn(null)}
                                className="px-6 py-3 glass-card text-slate-400 hover:text-white rounded-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
