"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Message {
    id: string;
    message: string;
    sender_type: "CUSTOMER" | "ADMIN";
    created_at: string;
}

interface Ticket {
    id: string;
    subject: string;
    type: string;
    status: string;
    priority: string;
    created_at: string;
    messages: Message[];
}

export default function TicketDetailsPage() {
    const params = useParams();
    const { data: session } = useSession();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
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
            const res = await fetch(`/api/support/tickets/${params.id}`);
            const data = await res.json();
            if (res.ok) {
                setTicket(data.ticket);
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
            const res = await fetch(`/api/support/tickets/${params.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: newMessage }),
            });

            if (res.ok) {
                setNewMessage("");
                fetchTicket();
            } else {
                toast.error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10 h-[calc(100vh-6rem)] flex flex-col">
                {/* Header */}
                <div className="glass-card p-6 rounded-t-2xl border-b border-white/10 flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-white">{ticket.subject}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                                {ticket.status.replace("_", " ")}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Ticket #{ticket.id.slice(0, 8)} • {new Date(ticket.created_at).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-slate-300 mb-1">Priority</div>
                        <span className={`text-sm font-bold ${ticket.priority === "HIGH" ? "text-red-400" : "text-blue-400"}`}>
                            {ticket.priority}
                        </span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col border-white/5">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Conversation */}
                        {ticket.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_type === "CUSTOMER" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-4 ${msg.sender_type === "CUSTOMER"
                                        ? "bg-purple-600/20 border border-purple-500/30 rounded-tr-sm"
                                        : "bg-slate-800/50 border border-white/10 rounded-tl-sm"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold ${msg.sender_type === "CUSTOMER" ? "text-purple-300" : "text-blue-300"}`}>
                                            {msg.sender_type === "CUSTOMER" ? "You" : "Support Agent"}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-white whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black/20 border-t border-white/5">
                        <form onSubmit={handleSendMessage} className="flex gap-4">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your reply..."
                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                disabled={ticket.status === "CLOSED"}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim() || ticket.status === "CLOSED"}
                                className="btn-primary px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? "Sending..." : "Send"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
