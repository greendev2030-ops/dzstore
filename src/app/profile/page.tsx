"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        } else if (session?.user) {
            fetchProfile();
        }
    }, [status, session, router]);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.user.name || "",
                    email: data.user.email || "",
                    phone: data.user.phone || "",
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await update();
                toast.success("Profile updated successfully!");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
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
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
                        My <span className="text-gradient-animated">Profile</span>
                    </h1>
                    <p className="text-slate-400">Manage your account information</p>
                </div>

                {/* Profile Form */}
                <div className="glass-card rounded-2xl p-8 border-purple-500/20 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="05xxxxxxxx"
                                disabled
                                title="Phone number cannot be changed. Contact support for assistance."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 placeholder-slate-400 focus:outline-none transition-all cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">🔒 Contact support to change your phone number</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                required
                                disabled
                                title="Email cannot be changed"
                            />
                            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Updating...
                                </span>
                            ) : (
                                "Update Profile"
                            )}
                        </button>
                    </form>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/dashboard"
                        className="glass-card rounded-xl p-6 border-purple-500/20 hover:border-purple-500/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">My Orders</h3>
                                <p className="text-sm text-slate-400">View order history</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/products"
                        className="glass-card rounded-xl p-6 border-purple-500/20 hover:border-purple-500/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Browse Products</h3>
                                <p className="text-sm text-slate-400">Continue shopping</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
