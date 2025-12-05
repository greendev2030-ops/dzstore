"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { cartCount } = useCart();
    const router = useRouter();
    const { data: session } = useSession();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showUserMenu && !target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
        }
    };

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 dark:bg-black/80 border-b border-white/10 dark:border-white/10 [html:not(.dark)_&]:bg-white/90 [html:not(.dark)_&]:border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                                <span className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">
                                    DZ<span className="text-cyan-400">Store</span>
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-slate-300 hover:text-white dark:text-slate-300 dark:hover:text-white [html:not(.dark)_&]:text-slate-700 [html:not(.dark)_&]:hover:text-slate-900 transition-colors font-medium relative group"
                        >
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link
                            href="/products"
                            className="text-slate-300 hover:text-white dark:text-slate-300 dark:hover:text-white [html:not(.dark)_&]:text-slate-700 [html:not(.dark)_&]:hover:text-slate-900 transition-colors font-medium relative group"
                        >
                            Products
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all [html:not(.dark)_&]:bg-slate-100 [html:not(.dark)_&]:border-slate-300 [html:not(.dark)_&]:text-slate-900 [html:not(.dark)_&]:placeholder-slate-500"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </form>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative p-2 text-slate-300 hover:text-white transition-colors group"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {session ? (
                            <div className="relative user-menu-container">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-2 text-slate-300 hover:text-white transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden md:block text-sm font-medium">{session.user?.name}</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl border-white/10 overflow-hidden z-50">
                                        <div className="p-3 border-b border-white/10">
                                            <p className="text-sm font-medium text-white">{session.user?.name}</p>
                                            <p className="text-xs text-slate-400">{session.user?.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                My Profile
                                            </Link>
                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                My Dashboard
                                            </Link>
                                            <Link
                                                href="/profile/returns"
                                                className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                My Returns
                                            </Link>
                                            <Link
                                                href="/support/tickets"
                                                className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                🎧 Support
                                            </Link>
                                            {session.user?.email === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    signOut({ callbackUrl: '/' });
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="p-2 text-slate-300 hover:text-white transition-colors group"
                                title="Login / Register"
                            >
                                <svg className="w-6 h-6 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                />
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>

                        <div className="space-y-2">
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                Home
                            </Link>
                            <Link
                                href="/products"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                Products
                            </Link>
                            <Link
                                href="/cart"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>

                            {session ? (
                                <>
                                    <div className="border-t border-white/10 my-2"></div>
                                    <div className="px-4 py-3">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                                                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{session.user?.name}</p>
                                                <p className="text-xs text-slate-400">{session.user?.email}</p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all mb-2"
                                        >
                                            My Dashboard
                                        </Link>
                                        {session.user?.email === 'admin' && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all mb-2"
                                            >
                                                Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                signOut({ callbackUrl: '/' });
                                            }}
                                            className="w-full px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg transition-all text-left"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                    Login / Register
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav >
    );
}
