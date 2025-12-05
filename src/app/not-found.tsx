import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-2xl mx-auto text-center relative z-10">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gradient-animated font-[family-name:var(--font-orbitron)] mb-4">
                        404
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-slate-400 mb-8">
                        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-8 border-purple-500/30">
                    <p className="text-slate-300 mb-6">
                        Here are some helpful links instead:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/"
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
                        >
                            Home
                        </Link>
                        <Link
                            href="/products"
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
                        >
                            Products
                        </Link>
                        <Link
                            href="/cart"
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
                        >
                            Cart
                        </Link>
                    </div>
                </div>

                {/* Animated Icon */}
                <div className="mt-12 flex justify-center">
                    <svg
                        className="w-32 h-32 text-purple-500/30 animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
