import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateCustomerScore } from "@/lib/customerScore";

export const dynamic = 'force-dynamic';

async function getOrders() {
    const orders = await prisma.order.findMany({
        orderBy: { created_at: "desc" },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
    return JSON.parse(JSON.stringify(orders));
}

async function updateStatus(formData: FormData) {
    "use server";
    const orderId = formData.get("orderId") as string;
    const newStatus = formData.get("status") as string;

    // Update order status
    const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
    });

    // Award Trust Score points when order is delivered successfully
    if (newStatus === "DELIVERED" && order.guest_phone) {
        try {
            await updateCustomerScore(
                order.guest_phone,
                "ORDER_COMPLETED",
                5 // Award 5 points for successful delivery
            );
        } catch (error) {
            console.error("Error updating customer score:", error);
            // Don't fail the order update if score update fails
        }
    }

    revalidatePath("/admin/orders");
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div>
            <h1 className="text-4xl font-bold text-gradient-animated mb-2 font-[family-name:var(--font-orbitron)]">Order Management</h1>

            <div className="bg-slate-900 shadow overflow-hidden sm:rounded-lg border border-slate-800">
                <ul className="divide-y divide-slate-800">
                    {orders.map((order: any) => (
                        <li key={order.id} className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-white">
                                        Order #{order.id.slice(0, 8)}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Placed on {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === "PENDING"
                                            ? "bg-yellow-900 text-yellow-200"
                                            : order.status === "DELIVERED"
                                                ? "bg-emerald-900 text-emerald-200"
                                                : order.status === "CANCELLED"
                                                    ? "bg-red-900 text-red-200"
                                                    : "bg-blue-900 text-blue-200"
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                    <form action={updateStatus} className="flex items-center space-x-2">
                                        <input type="hidden" name="orderId" value={order.id} />
                                        <select
                                            name="status"
                                            defaultValue={order.status}
                                            className="bg-slate-800 text-white text-sm rounded-md border-slate-700 focus:ring-emerald-500 focus:border-emerald-500"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="CONFIRMED">Confirmed</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                        <button
                                            type="submit"
                                            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                                        >
                                            Update
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="border-t border-slate-800 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-300 mb-2">Customer Details</h4>
                                        <p className="text-sm text-slate-400">Name: <span className="text-white">{order.guest_name}</span></p>
                                        <p className="text-sm text-slate-400">Phone: <span className="text-white">{order.guest_phone}</span></p>
                                        <p className="text-sm text-slate-400">Address: <span className="text-white">{order.guest_address}, {order.guest_commune}, {order.guest_wilaya}</span></p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-300 mb-2">Order Items</h4>
                                        <ul className="space-y-1">
                                            {order.items.map((item: any) => (
                                                <li key={item.id} className="text-sm text-slate-400 flex justify-between">
                                                    <span>{item.quantity}x {item.product.name}</span>
                                                    <span className="text-white">
                                                        {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(item.price_at_purchase))}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between font-medium text-white">
                                            <span>Total</span>
                                            <span className="text-emerald-400">
                                                {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(order.total_amount))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
