"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid username or password");
            setLoading(false);
        } else {
            // Refresh to update session state
            router.refresh();
            // Redirect based on role (handled by middleware or client-side check if needed, but for now home/admin)
            // Since we don't know the role here easily without another call, we can default to home or let the user navigate.
            // However, for better UX, let's check if it looks like an email (customer) or not (admin).
            // Or better, just go to home page for now, or dashboard if we had one.
            // Given the previous code redirected to /admin, we should probably keep that for admins?
            // But we don't know the role.
            // Let's redirect to home "/" and let middleware handle access control if they try to go to /admin.
            router.push("/");
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

            <div className="relative w-full max-w-md">
                <div className="glass-card rounded-2xl p-8 shadow-2xl border-purple-500/20 relative overflow-hidden group">
                    {/* Holographic Border Effect */}
                    <div className="absolute inset-0 border border-white/10 rounded-2xl z-20 pointer-events-none" />
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-10 blur-sm" />

                    <div className="relative z-30">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
                                Welcome <span className="text-gradient-animated">Back</span>
                            </h1>
                            <p className="text-slate-400">Sign in to your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                                    Email or Username
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                        placeholder="Enter your email or username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-400">
                                Don't have an account?{" "}
                                <a href="/auth/register" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors relative group">
                                    Sign up
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
