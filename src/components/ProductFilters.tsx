"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function ProductFilters({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

    const currentCategory = searchParams.get("category");
    const currentSort = searchParams.get("sort");

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (minPrice) params.set("minPrice", minPrice);
        else params.delete("minPrice");

        if (maxPrice) params.set("maxPrice", maxPrice);
        else params.delete("maxPrice");

        router.push(`/products?${params.toString()}`);
    };

    const selectCategory = (slug: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) {
            params.set("category", slug);
        } else {
            params.delete("category");
        }
        router.push(`/products?${params.toString()}`);
    };

    const selectSort = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", sort);
        router.push(`/products?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/products");
        setMinPrice("");
        setMaxPrice("");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gradient-animated font-[family-name:var(--font-orbitron)]">
                    Filters
                </h2>
                {(currentCategory || minPrice || maxPrice || currentSort) && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="glass-card rounded-2xl p-6 border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Categories
                </h3>
                <div className="space-y-2">
                    <button
                        onClick={() => selectCategory(null)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${!currentCategory
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        All Products
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => selectCategory(category.slug)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${currentCategory === category.slug
                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="glass-card rounded-2xl p-6 border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Price Range
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Min Price (DZD)</label>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Max Price (DZD)</label>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="999999"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={applyFilters}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                    >
                        Apply Price Filter
                    </button>
                </div>
            </div>

            {/* Sort */}
            <div className="glass-card rounded-2xl p-6 border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    Sort By
                </h3>
                <div className="space-y-2">
                    <button
                        onClick={() => selectSort("newest")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${!currentSort || currentSort === "newest"
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Newest First
                    </button>
                    <button
                        onClick={() => selectSort("price_asc")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${currentSort === "price_asc"
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Price: Low to High
                    </button>
                    <button
                        onClick={() => selectSort("price_desc")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${currentSort === "price_desc"
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Price: High to Low
                    </button>
                </div>
            </div>
        </div>
    );
}
