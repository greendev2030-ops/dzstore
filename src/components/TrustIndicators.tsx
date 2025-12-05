"use client";

import { SlideUp, StaggerChildren, StaggerItem } from "./ui/motion";

export default function TrustIndicators() {
    const stats = [
        { value: "5000+", label: "Happy Customers" },
        { value: "48h", label: "Fast Delivery" },
        { value: "58", label: "Wilayas Covered" },
        { value: "100%", label: "Authentic Products" },
    ];

    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
            title: "Free Delivery",
            description: "On all orders across Algeria",
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Cash on Delivery",
            description: "Pay when you receive",
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: "Secure Shopping",
            description: "100% secure transactions",
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            title: "24/7 Support",
            description: "Always here to help",
        },
    ];

    return (
        <section className="py-20 bg-gradient-to-b from-black to-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats */}
                <SlideUp>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-slate-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </SlideUp>

                {/* Features */}
                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <StaggerItem key={index}>
                            <div className="glass-card p-6 text-center hover:border-emerald-500/30 transition-all group">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 group-hover:bg-emerald-500/20 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm">{feature.description}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerChildren>
            </div>
        </section>
    );
}
