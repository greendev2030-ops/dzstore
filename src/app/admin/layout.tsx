"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navigation = [
        { name: "Dashboard", href: "/admin" },
        { name: "Orders", href: "/admin/orders" },
        { name: "Products", href: "/admin/products" },
        { name: "Categories", href: "/admin/categories" },
        { name: "Customers", href: "/admin/customers" },
        { name: "Returns", href: "/admin/returns" },
        { name: "🎧 Support", href: "/admin/support" },
        { name: "Reviews", href: "/admin/reviews" },
        { name: "Settings", href: "/admin/settings" },
    ];

    return (
        <div id="admin-layout" className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <div className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <Link href="/admin" className="text-2xl font-bold text-purple-400 tracking-tighter">
                        Admin <span className="text-white">Panel</span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
