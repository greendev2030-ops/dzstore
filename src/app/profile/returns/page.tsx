"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Return {
    id: string;
    order_id: string;
    product_id: string;
    reason: string;
    detailed_reason?: string;
    status: string;
    created_at: string;
    admin_notes?: string;
    refund_amount?: number;
}

interface CustomerScore {
    trust_score: number;
    status: string;
    total_returns: number;
    total_orders: number;
}

export default function ReturnsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [returns, setReturns] = useState<Return[]>([]);
    const [score, setScore] = useState<CustomerScore | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }

        if (session?.user?.email) {
            fetchReturns();
            fetchScore();
        }
    }, [session, status]);


    const fetchReturns = async () => {
        try {
            // Fetch returns using the customer endpoint
            const res = await fetch(`/api/customer/returns`);
            if (res.ok) {
                const data = await res.json();
                setReturns(data);
            }
        } catch (error) {
            console.error("Error fetching returns:", error);
        } finally {
            setLoading(false);
        }
    };


    const fetchScore = async () => {
        try {
            const res = await fetch(`/api/customer/score`);
            if (res.ok) {
                const data = await res.json();
                setScore(data.score);
            } else {
                const errorData = await res.json();
                console.error("Failed to fetch score:", {
                    status: res.status,
                    error: errorData.error,
                    details: errorData.details
                });
                // Don't show score if fetch failed
                setScore(null);
            }
        } catch (error) {
            console.error("Error fetching score:", error);
            setScore(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
        return styles[status] || "bg-gray-100 text-gray-800";
    };

    const getScoreColor = (score: number) => {
        if (score >= 60) return "text-green-600";
        if (score >= 40) return "text-yellow-600";
        if (score >= 20) return "text-orange-600";
        return "text-red-600";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-black dark:to-slate-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header with Trust Score */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                            My Returns
                        </h1>
                        <Link
                            href="/profile/request-return"
                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all"
                        >
                            + Request Return
                        </Link>
                    </div>
                    {score && (
                        <div className="glass-card p-6 rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                        Trust Score
                                    </p>
                                    <p className={`text-4xl font-bold ${getScoreColor(score.trust_score)}`}>
                                        {score.trust_score}
                                        <span className="text-lg text-slate-500 dark:text-slate-400">/100</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                                    <p className={`text-lg font-bold ${score.status === "GOOD" ? "text-green-600" :
                                        score.status === "WARNING" ? "text-yellow-600" :
                                            score.status === "WATCH" ? "text-orange-600" :
                                                "text-red-600"
                                        }`}>
                                        {score.status}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Returns</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                        {score.total_returns}/{score.total_orders}
                                    </p>
                                </div>
                            </div>

                            {score.status !== "GOOD" && (
                                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        {score.status === "BLACKLISTED"
                                            ? "⚠️ Your account is blacklisted. Please contact support."
                                            : score.status === "WATCH"
                                                ? "⚠️ Your account is under review. Future orders may require prepayment."
                                                : "⚠️ Please be cautious with returns to maintain good standing."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Returns List */}
                <div className="space-y-4">
                    {returns.length === 0 ? (
                        <div className="glass-card p-12 rounded-2xl text-center">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-slate-400"
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                No Returns Yet
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                You haven't requested any returns.
                            </p>
                        </div>
                    ) : (
                        returns.map((returnItem) => (
                            <div key={returnItem.id} className="glass-card p-6 rounded-2xl">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                Return Request
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(
                                                    returnItem.status
                                                )}`}
                                            >
                                                {returnItem.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                            <span className="font-medium">Reason:</span> {returnItem.reason}
                                        </p>
                                        {returnItem.detailed_reason && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                <span className="font-medium">Details:</span>{" "}
                                                {returnItem.detailed_reason}
                                            </p>
                                        )}

                                        {/* Admin Notes / Rejection Reason */}
                                        {returnItem.admin_notes && (
                                            <div className={`mt-3 p-3 rounded-lg border ${returnItem.status === 'REJECTED'
                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                                                }`}>
                                                <p className={`text-sm font-medium mb-1 ${returnItem.status === 'REJECTED'
                                                    ? 'text-red-800 dark:text-red-200'
                                                    : 'text-slate-700 dark:text-slate-300'
                                                    }`}>
                                                    {returnItem.status === 'REJECTED' ? 'Rejection Reason:' : 'Admin Notes:'}
                                                </p>
                                                <p className={`text-sm ${returnItem.status === 'REJECTED'
                                                    ? 'text-red-700 dark:text-red-300'
                                                    : 'text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    {returnItem.admin_notes}
                                                </p>
                                            </div>
                                        )}
                                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                            Requested on{" "}
                                            {new Date(returnItem.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {returnItem.refund_amount && (
                                        <div className="text-right">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Refund Amount
                                            </p>
                                            <p className="text-xl font-bold text-green-600">
                                                {new Intl.NumberFormat("fr-DZ", {
                                                    style: "currency",
                                                    currency: "DZD",
                                                }).format(Number(returnItem.refund_amount))}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
