import Link from "next/link";

export default async function OrderConfirmationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="min-h-screen py-16 px-4 relative overflow-hidden flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10 w-full text-center">
                <div className="glass-card rounded-3xl p-12 border-emerald-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-emerald-500/20 mb-8 animate-pulse-glow">
                            <svg className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-orbitron)]">
                            Order Placed <span className="text-emerald-400">Successfully!</span>
                        </h1>

                        <p className="text-slate-300 text-lg mb-8">
                            Thank you for your order. Your Order ID is <span className="text-white font-mono font-bold bg-white/10 px-2 py-1 rounded">{id}</span>.
                        </p>

                        <div className="bg-black/40 rounded-xl p-8 max-w-xl mx-auto border border-white/10 mb-10">
                            <h3 className="text-xl font-bold text-white mb-4">What happens next?</h3>
                            <div className="flex items-start gap-4 text-left">
                                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-slate-300 leading-relaxed">
                                        Our team will call you within 24 hours to confirm your order and delivery details. Payment will be collected upon delivery (Cash on Delivery).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/"
                            className="inline-flex items-center px-8 py-4 btn-primary relative overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Continue Shopping
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
