"use client";

import { useState, useEffect, Fragment } from 'react';
import toast from 'react-hot-toast';

interface Customer {
    name: string;
    email: string;
    phone: string;
    address: string;
    orders: any[];
    totalSpent: number;
    isRegistered: boolean;
    lastOrderDate: Date;
    segment: 'VIP' | 'Active' | 'New' | 'Regular';
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSegment, setFilterSegment] = useState<string>('all');
    const [filterOrders, setFilterOrders] = useState<string>('all');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        filterCustomers();
    }, [searchTerm, filterSegment, filterOrders, customers]);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`/api/admin/customers?t=${Date.now()}`);
            const data = await res.json();
            setCustomers(data.customers || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const filterCustomers = () => {
        let filtered = [...customers];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.name?.toLowerCase().includes(search) ||
                c.email?.toLowerCase().includes(search) ||
                c.phone?.includes(search)
            );
        }

        // Segment filter
        if (filterSegment !== 'all') {
            filtered = filtered.filter(c => c.segment === filterSegment);
        }

        // Orders filter
        if (filterOrders !== 'all') {
            const minOrders = parseInt(filterOrders);
            filtered = filtered.filter(c => c.orders.length >= minOrders);
        }

        setFilteredCustomers(filtered);
    };

    const getSegmentBadge = (segment: string) => {
        const badges = {
            VIP: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30',
            Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            Regular: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };
        return badges[segment as keyof typeof badges] || badges.Regular;
    };

    const stats = {
        total: customers.length,
        vip: customers.filter(c => c.segment === 'VIP').length,
        active: customers.filter(c => c.segment === 'Active').length,
        new: customers.filter(c => c.segment === 'New').length,
        totalOrders: customers.reduce((sum, c) => {
            const validOrders = c.orders.filter((order: any) => order.status !== 'CANCELLED').length;
            return sum + validOrders;
        }, 0),
        avgOrderValue: customers.length > 0
            ? customers.reduce((sum, c) => sum + c.totalSpent, 0) /
            customers.reduce((sum, c) => {
                const validOrders = c.orders.filter((order: any) => order.status !== 'CANCELLED').length;
                return sum + validOrders;
            }, 0)
            : 0,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gradient-animated mb-2 font-[family-name:var(--font-orbitron)]">
                    Customer Management
                </h1>
                <p className="text-slate-400">
                    View and manage your customer base
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card rounded-2xl p-6 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Customers</p>
                            <p className="text-3xl font-bold text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border-yellow-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl">
                            <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">VIP Customers</p>
                            <p className="text-3xl font-bold text-yellow-400">{stats.vip}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl">
                            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Orders</p>
                            <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border-cyan-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-cyan-600/20 to-teal-600/20 rounded-xl">
                            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Avg Order Value</p>
                            <p className="text-xl font-bold text-gradient-animated">
                                {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(stats.avgOrderValue)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-2xl p-6 border-purple-500/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Search Customers
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Name, email, or phone..."
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>

                    {/* Segment Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Customer Segment
                        </label>
                        <select
                            value={filterSegment}
                            onChange={(e) => setFilterSegment(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                        >
                            <option value="all">All Segments</option>
                            <option value="VIP">VIP Only</option>
                            <option value="Active">Active Only</option>
                            <option value="New">New Only</option>
                            <option value="Regular">Regular Only</option>
                        </select>
                    </div>

                    {/* Orders Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Minimum Orders
                        </label>
                        <select
                            value={filterOrders}
                            onChange={(e) => setFilterOrders(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                        >
                            <option value="all">All</option>
                            <option value="1">1+ orders</option>
                            <option value="3">3+ orders</option>
                            <option value="5">5+ orders</option>
                            <option value="10">10+ orders</option>
                        </select>
                    </div>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                    Showing {filteredCustomers.length} of {customers.length} customers
                </p>
            </div>

            {/* Customers Table */}
            <div className="glass-card rounded-2xl border-purple-500/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-white">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-white">Contact</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-white">Segment</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-white">Orders</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-white">Total Spent</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-white">Last Order</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCustomers.map((customer, index) => (
                                <Fragment key={`customer-${customer.email}-${index}`}>
                                    <tr key={index} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="font-medium text-white flex items-center gap-2">
                                                        {customer.name}
                                                        {customer.isRegistered && (
                                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                                                                Registered
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-slate-400">{customer.address}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-300">{customer.email}</p>
                                                <p className="text-sm text-slate-400">{customer.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSegmentBadge(customer.segment)}`}>
                                                {customer.segment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
                                                {customer.orders.filter((order: any) => order.status !== 'CANCELLED').length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="font-bold text-gradient-animated">
                                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(customer.totalSpent)}
                                                </p>
                                                {(customer as any).debug_breakdown && (
                                                    <div className="text-[10px] text-slate-500 mt-1">
                                                        <span className="text-red-400">Cancelled: {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format((customer as any).debug_breakdown.cancelled_amount)}</span>
                                                        <br />
                                                        <span className="text-emerald-400">Valid: {(customer as any).debug_breakdown.valid_count}/{(customer as any).debug_breakdown.all_count}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-300">
                                                {new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                                                className="text-purple-400 hover:text-purple-300 transition-colors"
                                            >
                                                <svg className={`w-5 h-5 transition-transform ${expandedRow === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === index && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 bg-white/5">
                                                <div className="space-y-2">
                                                    <h4 className="font-bold text-white mb-3">Order History</h4>
                                                    {customer.orders.slice(0, 5).map((order: any) => (
                                                        <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                            <div>
                                                                <p className="text-sm text-white font-mono">#{order.id.slice(0, 8)}</p>
                                                                <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-bold text-purple-400">
                                                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(order.total_amount))}
                                                                </p>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                    order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                        'bg-blue-500/20 text-blue-400'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-white mb-2">No customers found</h3>
                        <p className="text-slate-400">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
