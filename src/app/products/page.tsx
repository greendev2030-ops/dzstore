import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import prisma from "@/lib/prisma";

async function getProducts(searchParams: any) {
    const { search, category, minPrice, maxPrice, sort } = searchParams;

    const where: any = {
        is_active: true,
        price: {
            gte: minPrice ? parseFloat(minPrice) : undefined,
            lte: maxPrice ? parseFloat(maxPrice) : undefined,
        },
    };

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
        ];
    }

    if (category) {
        where.category = {
            slug: category,
        };
    }

    let orderBy: any = { created_at: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    const products = await prisma.product.findMany({
        where,
        orderBy,
        include: { category: true },
    });

    return JSON.parse(JSON.stringify(products));
}

async function getCategories() {
    const categories = await prisma.category.findMany();
    return categories;
}

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const products = await getProducts(resolvedSearchParams);
    const categories = await getCategories();

    return (
        <div className="min-h-screen bg-black pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-gradient-animated mb-4 font-[family-name:var(--font-orbitron)]">
                        {resolvedSearchParams.search ? `Search: "${resolvedSearchParams.search}"` : "All Products"}
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Discover {products.length} premium products
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <ProductFilters categories={categories} />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 glass-card rounded-2xl border-purple-500/20">
                                <svg
                                    className="mx-auto h-16 w-16 text-slate-500 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                                <p className="text-slate-400 mb-6">
                                    Try adjusting your search or filters to find what you're looking for.
                                </p>
                                <a
                                    href="/products"
                                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all"
                                >
                                    Clear Filters
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
