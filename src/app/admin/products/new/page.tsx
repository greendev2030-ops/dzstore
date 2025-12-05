import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

async function getCategories() {
    const categories = await prisma.category.findMany();
    return categories;
}

async function createProduct(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock_quantity = parseInt(formData.get("stock_quantity") as string);
    const category_id = formData.get("category_id") as string;
    const image_url = formData.get("image_url") as string;
    const specs = formData.get("specs") as string;
    const discount_price = formData.get("discount_price") ? parseFloat(formData.get("discount_price") as string) : null;
    const cost_price = formData.get("cost_price") ? parseFloat(formData.get("cost_price") as string) : 0;
    const delivery_fee = formData.get("delivery_fee") ? parseFloat(formData.get("delivery_fee") as string) : 0;
    const is_featured = formData.get("is_featured") === "on";

    await prisma.product.create({
        data: {
            name,
            slug,
            description,
            price,
            stock_quantity,
            category_id,
            image_url,
            specs, // Assuming user enters valid JSON string for now
            discount_price,
            cost_price,
            delivery_fee,
            is_featured,
            is_active: true,
        },
    });

    revalidatePath("/admin/products");
    redirect("/admin/products");
}

export default async function NewProductPage() {
    const categories = await getCategories();

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Add New Product</h1>

            <form action={createProduct} className="space-y-6 bg-slate-900 p-8 rounded-lg border border-slate-800">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300">Name</label>
                    <input type="text" name="name" id="name" required className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-slate-300">Slug</label>
                    <input type="text" name="slug" id="slug" required className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-slate-300">Category</label>
                    <select name="category_id" id="category_id" required className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                        {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-slate-300">Price (DZD)</label>
                    <input type="number" name="price" id="price" required min="0" step="0.01" className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="cost_price" className="block text-sm font-medium text-slate-300">Cost Price (Purchase Price)</label>
                    <input type="number" name="cost_price" id="cost_price" min="0" step="0.01" defaultValue="0" className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    <p className="mt-1 text-xs text-slate-500">Used to calculate profit margin (not visible to customers).</p>
                </div>

                <div>
                    <label htmlFor="discount_price" className="block text-sm font-medium text-slate-300">Discount Price (Optional)</label>
                    <input type="number" name="discount_price" id="discount_price" min="0" step="0.01" className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="delivery_fee" className="block text-sm font-medium text-slate-300">Delivery Fee (0 for Free)</label>
                    <input type="number" name="delivery_fee" id="delivery_fee" min="0" step="0.01" defaultValue="0" className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>

                <div className="flex items-center">
                    <input type="checkbox" name="is_featured" id="is_featured" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-700 rounded bg-slate-800" />
                    <label htmlFor="is_featured" className="ml-2 block text-sm text-slate-300">Featured Product</label>
                </div>

                <div>
                    <label htmlFor="stock_quantity" className="block text-sm font-medium text-slate-300">Stock</label>
                    <input type="number" name="stock_quantity" id="stock_quantity" required min="0" className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-slate-300">Image URL</label>
                    <input type="url" name="image_url" id="image_url" required className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
                    <textarea name="description" id="description" rows={3} required className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="specs" className="block text-sm font-medium text-slate-300">Specs (JSON)</label>
                    <textarea name="specs" id="specs" rows={5} required defaultValue='{"key": "value"}' className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-mono" />
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Create Product
                    </button>
                </div>
            </form>
        </div>
    );
}
