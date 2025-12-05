export function ProductCardSkeleton() {
    return (
        <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col animate-pulse">
            {/* Image Skeleton */}
            <div className="relative aspect-square bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer" />
            </div>

            {/* Content Skeleton */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-white/10 rounded w-full mb-1" />
                    <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="h-6 bg-white/10 rounded w-1/3" />
                    <div className="h-10 bg-white/10 rounded w-20" />
                </div>
            </div>
        </div>
    );
}

export function ProductPageSkeleton() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb Skeleton */}
                <div className="h-4 bg-white/10 rounded w-48 mb-6 animate-pulse" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                    {/* Image Skeleton */}
                    <div className="relative aspect-square bg-white/5 rounded-2xl animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer" />
                    </div>

                    {/* Info Skeleton */}
                    <div className="flex flex-col justify-center space-y-4 animate-pulse">
                        <div className="h-4 bg-white/10 rounded w-1/4" />
                        <div className="h-10 bg-white/10 rounded w-3/4" />
                        <div className="h-8 bg-white/10 rounded w-1/3" />
                        <div className="h-4 bg-white/10 rounded w-full" />
                        <div className="h-4 bg-white/10 rounded w-5/6" />
                        <div className="h-32 bg-white/10 rounded w-full mt-6" />
                        <div className="h-12 bg-white/10 rounded w-full mt-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
