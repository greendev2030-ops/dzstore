"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            if (res.ok) {
                router.push("/auth/login?registered=true");
            } else {
                const data = await res.json();
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-glow" />
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="glass-card rounded-2xl p-8 shadow-2xl border-purple-500/20 relative overflow-hidden group">
                    {/* Holographic Border Effect */}
                    <div className="absolute inset-0 border border-white/10 rounded-2xl z-20 pointer-events-none" />
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-10 blur-sm" />

                    <div className="relative z-30">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
                                Create <span className="text-gradient-animated">Account</span>
                            </h2>
                            <p className="text-slate-400">Join us today</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                            placeholder="Full Name"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email-address" className="block text-sm font-medium text-slate-300 mb-2">
                                        Email address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <input
                                            id="email-address"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                            placeholder="Email address"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            pattern="(05|06|07)[0-9]{8}"
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                            placeholder="05xxxxxxxx"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Algerian phone number (05/06/07 + 8 digits)</p>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                            placeholder="Confirm Password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? "Creating account..." : "Sign up"}
                                    </span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-400">
                                Already have an account?{" "}
                                <Link href="/auth/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors relative group">
                                    Sign in
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
