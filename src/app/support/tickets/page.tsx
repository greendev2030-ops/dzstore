"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Ticket {
    id: string;
    subject: string;
    type: string;
    status: string;
    priority: string;
    created_at: string;
    messages: any[];
}

export default function MyTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/support/tickets");
            const data = await res.json();
            setTickets(data.tickets || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case "IN_PROGRESS": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case "RESOLVED": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "CLOSED": return "text-slate-400 bg-slate-400/10 border-slate-400/20";
            default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
                            My <span className="text-gradient-animated">Tickets</span>
                        </h1>
                        <p className="text-slate-400">Track and manage your support requests</p>
                    </div>
                    <Link
                        href="/support/contact"
                        className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                    >
                        <span>+ New Ticket</span>
                    </Link>
                </div>

                {tickets.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl border-white/5">
                        <div className="text-6xl mb-6">🎫</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No tickets yet</h3>
                        <p className="text-slate-400 mb-8">You haven't created any support tickets yet.</p>
                        <Link
                            href="/support/contact"
                            className="text-purple-400 hover:text-purple-300 font-medium"
                        >
                            Create your first ticket →
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tickets.map((ticket, index) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={`/support/tickets/${ticket.id}`}>
                                    <div className="glass-card p-6 rounded-xl border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                                                    {getTypeIcon(ticket.type)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                                                        {ticket.subject}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                                        <span>#{ticket.id.slice(0, 8)}</span>
                                                        <span>•</span>
                                                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span className={ticket.priority === "HIGH" ? "text-red-400" : ""}>
                                                            {ticket.priority} Priority
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace("_", " ")}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
