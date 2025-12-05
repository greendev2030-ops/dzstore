"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ContactSupportPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        type: "GENERAL",
        description: "",
        priority: "NORMAL",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/support/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to create ticket");

            toast.success("Ticket created successfully!");
            router.push("/support/tickets");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit ticket");
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

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4 font-[family-name:var(--font-orbitron)]">
                        Contact <span className="text-gradient-animated">Support</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        We're here to help. Submit a ticket and we'll get back to you shortly.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-8 border-purple-500/20 relative overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Issue Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                                >
                                    <option value="GENERAL">💬 General Inquiry</option>
                                    <option value="PHONE_CHANGE">📞 Phone Number Change</option>
                                    <option value="BLACKLIST_INQUIRY">❓ Blacklist Inquiry</option>
                                    <option value="ORDER_ISSUE">📦 Order Issue</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                                >
                                    <option value="LOW">🔵 Low</option>
                                    <option value="NORMAL">🟡 Normal</option>
                                    <option value="HIGH">🔴 High</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Brief summary of your issue"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Description
                            </label>
                            <textarea
                                required
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Please describe your issue in detail..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 rounded-xl font-bold relative overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>Submit Ticket →</>
                                )}
                            </span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
