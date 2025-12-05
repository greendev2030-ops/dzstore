import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all stats in parallel for better performance
    const [
        totalOrders,
        ordersByStatus,
        revenueStats,
        todayRevenue,
        monthRevenue,
        lowStockProducts,
        totalProducts,
        totalCategories,
        recentOrders,
        topProducts,
        completedOrders // Add this to destructuring
    ] = await Promise.all([
        // Total orders count
        prisma.order.count(),

        // Orders by status
        prisma.order.groupBy({
            by: ['status'],
            _count: true,
        }),

        // Total revenue (excluding cancelled)
        prisma.order.aggregate({
            _sum: { total_amount: true },
            where: { status: { not: "CANCELLED" } },
        }),

        // Today's revenue
        prisma.order.aggregate({
            _sum: { total_amount: true },
            where: {
                status: { not: "CANCELLED" },
                created_at: { gte: startOfToday },
            },
        }),

        // This month's revenue
        prisma.order.aggregate({
            _sum: { total_amount: true },
            where: {
                status: { not: "CANCELLED" },
                created_at: { gte: startOfMonth },
            },
        }),

        // Low stock products (with details)
        prisma.product.findMany({
            where: { stock_quantity: { lt: 5 } },
            select: { id: true, name: true, stock_quantity: true },
            take: 5,
            orderBy: { stock_quantity: 'asc' },
        }),

        // Total products
        prisma.product.count(),

        // Total categories
        prisma.category.count(),

        // Recent orders
        prisma.order.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: {
                items: {
                    include: { product: true }
                }
            }
        }),

        // Top selling products
        prisma.orderItem.groupBy({
            by: ['product_id'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        }),

        // Completed orders for profit calculation
        prisma.order.findMany({
            where: { status: { not: "CANCELLED" } },
            select: {
                items: {
                    select: {
                        quantity: true,
                        price: true,
                        product: {
                            select: {
                                cost_price: true
                            }
                        }
                    }
                }
            }
        })
    ]);

    // Get product details for top sellers
    const topProductIds = topProducts.map((p: any) => p.product_id);
    const topProductDetails = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, image_url: true },
    });

    const topProductsWithDetails = topProducts.map((tp: any) => ({
        ...topProductDetails.find((pd: any) => pd.id === tp.product_id),
        totalSold: tp._sum.quantity || 0,
    }));

    // Process status counts
    const statusCounts = {
        PENDING: 0,
        CONFIRMED: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
    };

    ordersByStatus.forEach((item: any) => {
        statusCounts[item.status as keyof typeof statusCounts] = item._count;
    });

    // Calculate Total Profit
    // Profit = Sum of ((Selling Price - Cost Price) * Quantity) for all items in non-cancelled orders
    // Note: We use the CURRENT cost price of the product. Ideally, we should snapshot cost price at purchase time,
    // but for this feature request, using current product cost is the accepted approach.
    // const completedOrders = stats[10] as any[]; // Removed incorrect line
    let totalProfit = 0;

    completedOrders.forEach((order: any) => {
        order.items.forEach((item: any) => {
            const sellingPrice = Number(item.price);
            const costPrice = item.product?.cost_price ? Number(item.product.cost_price) : 0;
            const quantity = item.quantity;

            // Profit for this item line
            totalProfit += (sellingPrice - costPrice) * quantity;
        });
    });

    return {
        totalOrders,
        pendingOrders: statusCounts.PENDING,
        statusCounts,
        totalRevenue: revenueStats._sum.total_amount || 0,
        totalProfit, // Add calculated profit
        todayRevenue: todayRevenue._sum.total_amount || 0,
        monthRevenue: monthRevenue._sum.total_amount || 0,
        lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)),
        totalProducts,
        totalCategories,
        recentOrders: JSON.parse(JSON.stringify(recentOrders)),
        topProducts: topProductsWithDetails,
    };
}

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
        redirect("/");
    }

    const stats = await getStats();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gradient-animated font-[family-name:var(--font-orbitron)]">Dashboard Overview</h1>
                <p className="text-slate-400 mt-2">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Total Revenue */}
                <div className="glass-card rounded-2xl overflow-hidden border-purple-500/30 hover:border-purple-500/50 transition-all">
                    <div className="p-6 bg-gradient-to-br from-purple-600/10 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-gradient-animated mt-1">
                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(stats.totalRevenue))}
                        </p>
                        <p className="text-xs text-emerald-400 mt-2">
                            +{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(stats.monthRevenue))} this month
                        </p>
                    </div>
                </div>

                {/* Total Profit */}
                <div className="glass-card rounded-2xl overflow-hidden border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                    <div className="p-6 bg-gradient-to-br from-emerald-600/10 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Total Profit</p>
                        <p className="text-2xl font-bold text-gradient-animated mt-1">
                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(stats.totalProfit))}
                        </p>
                        <p className="text-xs text-emerald-400 mt-2">
                            {Number(stats.totalRevenue) > 0 ? Math.round((stats.totalProfit / Number(stats.totalRevenue)) * 100) : 0}% margin
                        </p>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="glass-card rounded-2xl overflow-hidden border-blue-500/30 hover:border-blue-500/50 transition-all">
                    <div className="p-6 bg-gradient-to-br from-blue-600/10 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Total Orders</p>
                        <p className="text-2xl font-bold text-gradient-animated mt-1">{stats.totalOrders}</p>
                        <p className="text-xs text-yellow-400 mt-2">{stats.pendingOrders} pending</p>
                    </div>
                </div>

                {/* Total Products */}
                <div className="glass-card rounded-2xl overflow-hidden border-cyan-500/30 hover:border-cyan-500/50 transition-all">
                    <div className="p-6 bg-gradient-to-br from-cyan-600/10 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-cyan-500/20 rounded-xl">
                                <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Total Products</p>
                        <p className="text-2xl font-bold text-gradient-animated mt-1">{stats.totalProducts}</p>
                        {stats.lowStockProducts.length > 0 && (
                            <p className="text-xs text-red-400 mt-2">{stats.lowStockProducts.length} low stock</p>
                        )}
                    </div>
                </div>

                {/* Today's Revenue */}
                <div className="glass-card rounded-2xl overflow-hidden border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                    <div className="p-6 bg-gradient-to-br from-emerald-600/10 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Today's Revenue</p>
                        <p className="text-2xl font-bold text-gradient-animated mt-1">
                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(stats.todayRevenue))}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Updated in real-time</p>
                    </div>
                </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="glass-card rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Orders by Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(stats.statusCounts).map(([status, count]) => (
                        <div key={status} className="text-center">
                            <p className="text-2xl font-bold text-white">{count}</p>
                            <p className={`text-xs mt-1 ${status === 'PENDING' ? 'text-yellow-400' :
                                status === 'CONFIRMED' ? 'text-blue-400' :
                                    status === 'SHIPPED' ? 'text-purple-400' :
                                        status === 'DELIVERED' ? 'text-emerald-400' :
                                            'text-red-400'
                                }`}>{status}</p>
                            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${status === 'PENDING' ? 'bg-yellow-500' :
                                        status === 'CONFIRMED' ? 'bg-blue-500' :
                                            status === 'SHIPPED' ? 'bg-purple-500' :
                                                status === 'DELIVERED' ? 'bg-emerald-500' :
                                                    'bg-red-500'
                                        }`}
                                    style={{ width: `${stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Quick Actions */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/products/new" className="p-4 bg-gradient-to-br from-purple-600/20 to-purple-600/5 rounded-xl hover:from-purple-600/30 hover:to-purple-600/10 transition-all border border-purple-500/20 hover:border-purple-500/40">
                            <div className="text-purple-400 mb-2">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-white">Add Product</p>
                        </Link>
                        <Link href="/admin/orders" className="p-4 bg-gradient-to-br from-blue-600/20 to-blue-600/5 rounded-xl hover:from-blue-600/30 hover:to-blue-600/10 transition-all border border-blue-500/20 hover:border-blue-500/40">
                            <div className="text-blue-400 mb-2">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-white">View Orders</p>
                        </Link>
                        <Link href="/admin/products" className="p-4 bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 rounded-xl hover:from-cyan-600/30 hover:to-cyan-600/10 transition-all border border-cyan-500/20 hover:border-cyan-500/40">
                            <div className="text-cyan-400 mb-2">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-white">Manage Products</p>
                        </Link>
                        <Link href="/admin/categories" className="p-4 bg-gradient-to-br from-pink-600/20 to-pink-600/5 rounded-xl hover:from-pink-600/30 hover:to-pink-600/10 transition-all border border-pink-500/20 hover:border-pink-500/40">
                            <div className="text-pink-400 mb-2">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-white">Categories</p>
                        </Link>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Low Stock Alert
                    </h2>
                    {stats.lowStockProducts.length === 0 ? (
                        <p className="text-sm text-slate-400">All products are well stocked! 🎉</p>
                    ) : (
                        <div className="space-y-2">
                            {stats.lowStockProducts.map((product: any) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-sm text-white font-medium truncate">{product.name}</p>
                                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full ml-2">
                                        {product.stock_quantity} left
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
                    <div className="space-y-3">
                        {stats.recentOrders.map((order: any) => (
                            <div key={order.id} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-white">{order.guest_name || 'Guest'}</p>
                                        <p className="text-xs text-slate-400">{order.items.length} items</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-purple-400">
                                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(order.total_amount))}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                            order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'SHIPPED' ? 'bg-purple-500/20 text-purple-400' :
                                                    order.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-red-500/20 text-red-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Top Selling Products</h2>
                    <div className="space-y-3">
                        {stats.topProducts.map((product: any, index: number) => (
                            <div key={product.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    #{index + 1}
                                </div>
                                {product.image_url && (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded-lg"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                                    <p className="text-xs text-slate-400">{product.totalSold} sold</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
