import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

async function getProducts() {
    const products = await prisma.product.findMany({
        orderBy: { created_at: "desc" },
        include: { category: true },
    });
    return JSON.parse(JSON.stringify(products));
}

async function deleteProduct(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;

    await prisma.product.delete({
        where: { id: productId },
    });

    revalidatePath("/admin/products");
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gradient-animated mb-2 font-[family-name:var(--font-orbitron)]">Product Management</h1>
                <Link
                    href="/admin/products/new"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-500/30"
                >
                    Add New Product
                </Link>
            </div>

            <div className="bg-slate-900 shadow overflow-hidden sm:rounded-lg border border-slate-800">
                <ul className="divide-y divide-slate-800">
                    {products.map((product: any) => (
                        <li key={product.id} className="p-6 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-700">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-white">{product.name}</h3>
                                    <p className="text-sm text-slate-400">{product.category.name}</p>
                                    <p className="text-sm font-medium text-emerald-400">
                                        {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(product.price))}
                                    </p>
                                    {product.cost_price && Number(product.cost_price) > 0 && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500">
                                                Profit: <span className={Number(product.price) - Number(product.cost_price) >= 0 ? "text-emerald-500" : "text-red-500"}>
                                                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(product.price) - Number(product.cost_price))}
                                                </span>
                                            </span>
                                            <span className="text-xs text-slate-600">
                                                ({Math.round(((Number(product.price) - Number(product.cost_price)) / Number(product.price)) * 100)}%)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={`/admin/products/${product.id}`}
                                    className="text-slate-400 hover:text-white text-sm font-medium"
                                >
                                    Edit
                                </Link>
                                <form action={deleteProduct}>
                                    <input type="hidden" name="productId" value={product.id} />
                                    <button
                                        type="submit"
                                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </form>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
