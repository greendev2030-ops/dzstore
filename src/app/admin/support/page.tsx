"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TicketStats {
    byStatus: {
        OPEN: number;
        IN_PROGRESS: number;
        RESOLVED: number;
        CLOSED: number;
    };
    byType: Record<string, number>;
}

interface Ticket {
    id: string;
    subject: string;
    type: string;
    status: string;
    priority: string;
    created_at: string;
    user: {
        full_name: string;
        email: string;
    };
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [stats, setStats] = useState<TicketStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL, OPEN, RESOLVED, etc.

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const fetchTickets = async () => {
        try {
            const query = filter !== "ALL" ? `?status=${filter}` : "";
            const res = await fetch(`/api/admin/support${query}`);
            const data = await res.json();
            setTickets(data.tickets || []);
            setStats(data.stats);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "IN_PROGRESS": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "RESOLVED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "CLOSED": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "PHONE_CHANGE": return "📞";
            case "BLACKLIST_INQUIRY": return "❓";
            case "ORDER_ISSUE": return "📦";
            default: return "💬";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-orbitron)]">
                    Support <span className="text-gradient-animated">Tickets</span>
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchTickets()}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-card p-6 rounded-xl border-emerald-500/20 bg-emerald-500/5">
                        <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.byStatus.OPEN || 0}</div>
                        <div className="text-sm text-emerald-200/70">Open Tickets</div>
                    </div>
                    <div className="glass-card p-6 rounded-xl border-yellow-500/20 bg-yellow-500/5">
                        <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.byStatus.IN_PROGRESS || 0}</div>
                        <div className="text-sm text-yellow-200/70">In Progress</div>
                    </div>
                    <div className="glass-card p-6 rounded-xl border-blue-500/20 bg-blue-500/5">
                        <div className="text-3xl font-bold text-blue-400 mb-1">{stats.byStatus.RESOLVED || 0}</div>
                        <div className="text-sm text-blue-200/70">Resolved</div>
                    </div>
                    <div className="glass-card p-6 rounded-xl border-purple-500/20 bg-purple-500/5">
                        <div className="text-3xl font-bold text-purple-400 mb-1">
                            {(stats.byType.PHONE_CHANGE || 0) + (stats.byType.BLACKLIST_INQUIRY || 0)}
                        </div>
                        <div className="text-sm text-purple-200/70">Account Issues</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === status
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                            : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        {status.replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* Tickets List */}
            <div className="glass-card rounded-xl overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No tickets found matching your filter.
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{getTypeIcon(ticket.type)}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{ticket.subject}</div>
                                                    <div className="text-xs text-slate-500">#{ticket.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-300">{ticket.user.full_name}</div>
                                            <div className="text-xs text-slate-500">{ticket.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-bold ${ticket.priority === "HIGH" ? "text-red-400" : ticket.priority === "LOW" ? "text-blue-400" : "text-slate-300"}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/support/${ticket.id}`}
                                                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                                            >
                                                View Details →
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
