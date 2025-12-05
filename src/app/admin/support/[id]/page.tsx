"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface Message {
    id: string;
    message: string;
    sender_type: "CUSTOMER" | "ADMIN";
    created_at: string;
    sender_id: string;
}

interface Ticket {
    id: string;
    subject: string;
    type: string;
    status: string;
    priority: string;
    description: string;
    created_at: string;
    admin_notes: string;
    user: {
        id: string;
        full_name: string;
        email: string;
        phone: string;
    };
    messages: Message[];
}

interface CustomerScore {
    trust_score: number;
    status: string;
    total_orders: number;
    total_returns: number;
}

export default function AdminTicketDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [customerScore, setCustomerScore] = useState<CustomerScore | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [newPhone, setNewPhone] = useState("");
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [pointsToAdd, setPointsToAdd] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTicket();
    }, [params.id]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/admin/support/${params.id}`);
            const data = await res.json();
            if (res.ok) {
                setTicket(data.ticket);
                setCustomerScore(data.customerScore);
                setAdminNotes(data.ticket.admin_notes || "");
            } else {
                toast.error(data.error || "Failed to load ticket");
            }
        } catch (error) {
            console.error("Error fetching ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/admin/support/${params.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: newMessage }),
            });

            if (res.ok) {
                setNewMessage("");
                fetchTicket();
                toast.success("Reply sent");
            } else {
                toast.error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/support/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchTicket();
                toast.success(`Status updated to ${newStatus}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const updatePriority = async (newPriority: string) => {
        try {
            const res = await fetch(`/api/admin/support/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priority: newPriority }),
            });

            if (res.ok) {
                fetchTicket();
                toast.success(`Priority updated to ${newPriority}`);
            }
        } catch (error) {
            toast.error("Failed to update priority");
        }
    };

    const saveNotes = async () => {
        try {
            const res = await fetch(`/api/admin/support/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ admin_notes: adminNotes }),
            });

            if (res.ok) {
                toast.success("Admin notes saved");
            }
        } catch (error) {
            toast.error("Failed to save notes");
        }
    };

    // Admin Actions
    const handleResetBlacklist = async () => {
        if (!ticket?.user.phone) {
            toast.error("Customer has no phone number");
            return;
        }

        if (!confirm("Are you sure you want to remove this customer from blacklist and reset their score to 100?")) {
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/customers/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "RESET_BLACKLIST",
                    phone: ticket.user.phone,
                    reason: `Reset via support ticket #${ticket.id.slice(0, 8)}`,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Customer removed from blacklist!");
                fetchTicket();
            } else {
                toast.error(data.error || "Failed to reset blacklist");
            }
        } catch (error) {
            toast.error("Failed to reset blacklist");
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangePhone = async () => {
        if (!newPhone) {
            toast.error("Please enter a new phone number");
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/customers/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "CHANGE_PHONE",
                    user_id: ticket?.user.id,
                    new_phone: newPhone,
                    reason: `Changed via support ticket #${ticket?.id.slice(0, 8)}`,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Phone number changed successfully!");
                setShowPhoneModal(false);
                setNewPhone("");
                fetchTicket();
            } else {
                toast.error(data.error || "Failed to change phone");
            }
        } catch (error) {
            toast.error("Failed to change phone");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdjustScore = async () => {
        if (!ticket?.user.phone) {
            toast.error("Customer has no phone number");
            return;
        }

        if (pointsToAdd === 0) {
            toast.error("Please enter points to add or subtract");
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/customers/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "ADJUST_SCORE",
                    phone: ticket.user.phone,
                    points: pointsToAdd,
                    reason: `Adjusted via support ticket #${ticket.id.slice(0, 8)}`,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`Score adjusted by ${pointsToAdd} points!`);
                setShowPointsModal(false);
                setPointsToAdd(0);
                fetchTicket();
            } else {
                toast.error(data.error || "Failed to adjust score");
            }
        } catch (error) {
            toast.error("Failed to adjust score");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSetStatus = async (status: string) => {
        if (!ticket?.user.phone) {
            toast.error("Customer has no phone number");
            return;
        }

        if (!confirm(`Are you sure you want to set customer status to ${status}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/customers/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "SET_STATUS",
                    phone: ticket.user.phone,
                    status: status,
                    reason: `Set via support ticket #${ticket.id.slice(0, 8)}`,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`Status set to ${status}!`);
                fetchTicket();
            } else {
                toast.error(data.error || "Failed to set status");
            }
        } catch (error) {
            toast.error("Failed to set status");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <>
            <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
                {/* Left Sidebar - Ticket Info */}
                <div className="w-full md:w-1/3 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    <div className="glass-card p-6 rounded-xl border-white/10">
                        <Link href="/admin/support" className="text-slate-400 hover:text-white text-sm mb-4 block">
                            ← Back to Dashboard
                        </Link>

                        <h2 className="text-xl font-bold text-white mb-2">{ticket.subject}</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-slate-300">
                                {ticket.type.replace("_", " ")}
                            </span>
                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-slate-300">
                                #{ticket.id.slice(0, 8)}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                                <select
                                    value={ticket.status}
                                    onChange={(e) => updateStatus(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50"
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="IN_PROGRESS">IN PROGRESS</option>
                                    <option value="RESOLVED">RESOLVED</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                                <select
                                    value={ticket.priority}
                                    onChange={(e) => updatePriority(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50"
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="NORMAL">NORMAL</option>
                                    <option value="HIGH">HIGH</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="glass-card p-6 rounded-xl border-white/10">
                        <h3 className="text-sm font-bold text-slate-300 uppercase mb-4">Customer Details</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs text-slate-500">Name</div>
                                <div className="text-white font-medium">{ticket.user.full_name}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Email</div>
                                <div className="text-white">{ticket.user.email}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Phone</div>
                                <div className="text-white">{ticket.user.phone || "N/A"}</div>
                            </div>

                            {customerScore && (
                                <div className="pt-3 border-t border-white/10 mt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500">Trust Score</span>
                                        <span className={`text-sm font-bold ${customerScore.status === "BLACKLISTED" ? "text-red-500" :
                                            customerScore.status === "GOOD" ? "text-emerald-400" : "text-yellow-400"
                                            }`}>
                                            {customerScore.trust_score} ({customerScore.status})
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-white/5 p-2 rounded">
                                            <div className="text-slate-500">Orders</div>
                                            <div className="text-white font-bold">{customerScore.total_orders}</div>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded">
                                            <div className="text-slate-500">Returns</div>
                                            <div className="text-white font-bold">{customerScore.total_returns}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ⭐ Admin Actions Card - NEW */}
                    <div className="glass-card p-6 rounded-xl border-purple-500/20 bg-purple-500/5">
                        <h3 className="text-sm font-bold text-purple-300 uppercase mb-4 flex items-center gap-2">
                            🛠️ Admin Actions
                        </h3>
                        <div className="space-y-3">
                            {/* Reset Blacklist Button */}
                            {customerScore?.status === "BLACKLISTED" && (
                                <button
                                    onClick={handleResetBlacklist}
                                    disabled={actionLoading}
                                    className="w-full py-2.5 px-4 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium hover:bg-emerald-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    ✅ Remove from Blacklist
                                </button>
                            )}

                            {/* Change Phone Button */}
                            {ticket.type === "PHONE_CHANGE" && (
                                <button
                                    onClick={() => setShowPhoneModal(true)}
                                    disabled={actionLoading}
                                    className="w-full py-2.5 px-4 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium hover:bg-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    📞 Change Phone Number
                                </button>
                            )}

                            {/* Adjust Score Button */}
                            <button
                                onClick={() => setShowPointsModal(true)}
                                disabled={actionLoading || !ticket.user.phone}
                                className="w-full py-2.5 px-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-medium hover:bg-yellow-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                ⚡ Adjust Trust Score
                            </button>

                            {/* Quick Status Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                    onClick={() => handleSetStatus("GOOD")}
                                    disabled={actionLoading || !ticket.user.phone}
                                    className="py-2 px-3 bg-emerald-600/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium hover:bg-emerald-600/20 transition-all disabled:opacity-50"
                                >
                                    Set GOOD
                                </button>
                                <button
                                    onClick={() => handleSetStatus("WARNING")}
                                    disabled={actionLoading || !ticket.user.phone}
                                    className="py-2 px-3 bg-yellow-600/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs font-medium hover:bg-yellow-600/20 transition-all disabled:opacity-50"
                                >
                                    Set WARNING
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="glass-card p-6 rounded-xl border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-slate-300 uppercase">Internal Notes</h3>
                            <button onClick={saveNotes} className="text-xs text-purple-400 hover:text-purple-300">Save</button>
                        </div>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={4}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                            placeholder="Private notes for admins..."
                        />
                    </div>
                </div>

                {/* Right Side - Conversation */}
                <div className="flex-1 glass-card rounded-xl overflow-hidden flex flex-col border-white/10">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Original Request */}
                        <div className="flex justify-start">
                            <div className="max-w-[85%] bg-slate-800/50 border border-white/10 rounded-2xl rounded-tl-sm p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold text-blue-300">Customer Request</span>
                                    <span className="text-[10px] text-slate-500">
                                        {new Date(ticket.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        {ticket.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_type === "ADMIN" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-4 ${msg.sender_type === "ADMIN"
                                        ? "bg-purple-600/20 border border-purple-500/30 rounded-tr-sm"
                                        : "bg-slate-800/50 border border-white/10 rounded-tl-sm"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold ${msg.sender_type === "ADMIN" ? "text-purple-300" : "text-blue-300"}`}>
                                            {msg.sender_type === "ADMIN" ? "You (Admin)" : "Customer"}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(msg.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-white whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    <div className="p-4 bg-black/20 border-t border-white/5">
                        <form onSubmit={handleSendMessage} className="flex gap-4">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your reply..."
                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="btn-primary px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? "Sending..." : "Reply"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Phone Change Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="glass-card p-6 rounded-2xl w-full max-w-md border-purple-500/20">
                        <h3 className="text-xl font-bold text-white mb-4">📞 Change Phone Number</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Current: <span className="text-white">{ticket.user.phone || "N/A"}</span>
                        </p>
                        <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="New phone (e.g., 0555123456)"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-purple-500/50"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPhoneModal(false)}
                                className="flex-1 py-2.5 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePhone}
                                disabled={actionLoading || !newPhone}
                                className="flex-1 py-2.5 bg-purple-600 rounded-xl text-white font-medium hover:bg-purple-700 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? "Changing..." : "Change Phone"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Points Adjustment Modal */}
            {showPointsModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="glass-card p-6 rounded-2xl w-full max-w-md border-purple-500/20">
                        <h3 className="text-xl font-bold text-white mb-4">⚡ Adjust Trust Score</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Current Score: <span className={`font-bold ${customerScore?.status === "BLACKLISTED" ? "text-red-400" : "text-emerald-400"}`}>
                                {customerScore?.trust_score || 0}
                            </span>
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-2">Points to Add/Subtract</label>
                            <input
                                type="number"
                                value={pointsToAdd}
                                onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                                placeholder="e.g., 10 or -10"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Use positive numbers to add points, negative to subtract
                            </p>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => setPointsToAdd(10)} className="px-3 py-1 bg-emerald-600/20 rounded text-emerald-400 text-sm">+10</button>
                            <button onClick={() => setPointsToAdd(25)} className="px-3 py-1 bg-emerald-600/20 rounded text-emerald-400 text-sm">+25</button>
                            <button onClick={() => setPointsToAdd(50)} className="px-3 py-1 bg-emerald-600/20 rounded text-emerald-400 text-sm">+50</button>
                            <button onClick={() => setPointsToAdd(-10)} className="px-3 py-1 bg-red-600/20 rounded text-red-400 text-sm">-10</button>
                            <button onClick={() => setPointsToAdd(-25)} className="px-3 py-1 bg-red-600/20 rounded text-red-400 text-sm">-25</button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowPointsModal(false); setPointsToAdd(0); }}
                                className="flex-1 py-2.5 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdjustScore}
                                disabled={actionLoading || pointsToAdd === 0}
                                className="flex-1 py-2.5 bg-purple-600 rounded-xl text-white font-medium hover:bg-purple-700 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? "Adjusting..." : "Adjust Score"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
