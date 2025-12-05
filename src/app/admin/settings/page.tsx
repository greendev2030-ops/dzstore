"use client";

import { useState } from "react";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        siteName: "DZStore",
        siteDescription: "Algeria's premier computer hardware store",
        contactEmail: "support@dzstore.com",
        contactPhone: "+213 555 123 456",
        freeShippingThreshold: "50000",
        taxRate: "19",
    });

    const [saved, setSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would save to database
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gradient-animated mb-2 font-[family-name:var(--font-orbitron)]">
                    Settings
                </h1>
                <p className="text-slate-400">
                    Manage your store configuration and preferences
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Settings */}
                <div className="glass-card rounded-2xl p-8 border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        General Settings
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Site Name
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={settings.contactEmail}
                                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Contact Phone
                            </label>
                            <input
                                type="tel"
                                value={settings.contactPhone}
                                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Site Description
                            </label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping & Tax */}
                <div className="glass-card rounded-2xl p-8 border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                        Shipping & Tax
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Free Shipping Threshold (DZD)
                            </label>
                            <input
                                type="number"
                                value={settings.freeShippingThreshold}
                                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Orders above this amount get free shipping
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tax Rate (%)
                            </label>
                            <input
                                type="number"
                                value={settings.taxRate}
                                onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Default tax rate for products
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="glass-card rounded-2xl p-8 border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Payment Methods
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-white">Cash on Delivery</p>
                                    <p className="text-sm text-slate-400">Pay when you receive your order</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                    >
                        Save Settings
                    </button>
                    {saved && (
                        <span className="text-green-400 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Settings saved successfully!
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
