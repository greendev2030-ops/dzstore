"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
    slug: string;
    _count?: {
        products: number;
    };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "" });
    const router = useRouter();

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ name: "", slug: "" });
                setIsAdding(false);
                setEditingId(null);
                fetchCategories();
                router.refresh();
                toast.success(editingId ? "Category updated!" : "Category created!");
            }
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error("Error saving category");
        }
    }

    const handleDelete = async (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p>Are you sure you want to delete this category?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            proceedWithDelete(id);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Yes, Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const proceedWithDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchCategories();
                router.refresh();
                toast.success("Category deleted!");
            } else {
                toast.error("Failed to delete category");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Error deleting category");
        }
    };

    function startEdit(category: Category) {
        setEditingId(category.id);
        setFormData({ name: category.name, slug: category.slug });
        setIsAdding(true);
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({ name: "", slug: "" });
        setIsAdding(false);
    }

    if (isLoading) {
        return <div className="text-white">Loading...</div>;
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gradient-animated font-[family-name:var(--font-orbitron)]">Categories</h1>
                    <p className="text-slate-400 mt-2">Manage product categories</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
                >
                    {isAdding ? "Cancel" : "+ Add Category"}
                </button>
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="glass-card rounded-2xl p-6 mb-8 border-purple-500/30">
                    <h2 className="text-xl font-bold text-white mb-4">
                        {editingId ? "Edit Category" : "Add New Category"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all"
                            >
                                {editingId ? "Update" : "Create"}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-6 py-2 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="glass-card rounded-2xl p-6 hover:border-purple-500/50 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{category.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">/{category.slug}</p>
                            </div>
                            <div className="px-3 py-1 bg-purple-500/20 rounded-full">
                                <span className="text-xs font-bold text-purple-400">
                                    {category._count?.products || 0} products
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => startEdit(category)}
                                className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 font-medium rounded-lg hover:bg-blue-500/30 transition-all"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(category.id)}
                                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 font-medium rounded-lg hover:bg-red-500/30 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-400">No categories yet. Add your first category!</p>
                </div>
            )}
        </div>
    );
}
