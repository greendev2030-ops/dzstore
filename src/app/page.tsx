import ProductCard from "@/components/ProductCard";
import TrustIndicators from "@/components/TrustIndicators";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: 8,
    orderBy: { created_at: "desc" },
    include: {
      category: true,
      reviews: {
        select: { rating: true }
      }
    },
  });
  return JSON.parse(JSON.stringify(products));
}

async function getDiscountedProducts() {
  const products = await prisma.product.findMany({
    where: {
      discount_price: { not: null },
    },
    take: 4,
    orderBy: { discount_price: "asc" },
    include: {
      category: true,
      reviews: {
        select: { rating: true }
      }
    },
  });
  return JSON.parse(JSON.stringify(products));
}

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      is_featured: true,
    },
    take: 8,
    include: {
      category: true,
      reviews: {
        select: { rating: true }
      }
    },
  });

  // Fallback if no featured products
  if (products.length === 0) {
    return getLatestProducts();
  }

  return JSON.parse(JSON.stringify(products));
}

async function getCategories() {
  const categories = await prisma.category.findMany();
  return categories;
}

export default async function Home() {
  const latestProducts = await getLatestProducts();
  const discountedProducts = await getDiscountedProducts();
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Split Screen Modern */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-black">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-cyan-600/10 z-0" />

        {/* Floating Gradient Orbs - Purple/Blue Theme */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="text-left">
              {/* Premium Badge */}
              <span className="inline-block py-2 px-4 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 text-purple-400 text-sm font-bold mb-8 backdrop-blur-md animate-pulse-glow">
                🏆 The #1 Tech Store in Algeria
              </span>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 font-[family-name:var(--font-orbitron)]">
                <span className="block text-gradient-animated drop-shadow-[0_0_30px_rgba(102,126,234,0.5)]">
                  Upgrade Your
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 text-6xl md:text-8xl lg:text-9xl mt-2 drop-shadow-[0_0_40px_rgba(102,126,234,0.6)]">
                  Digital Life
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed">
                Discover the <span className="text-gradient font-bold">latest technology</span> with premium quality,
                authentic products, and <span className="text-gradient font-bold">lightning-fast delivery</span> across Algeria.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#products"
                  className="btn-magnetic group relative px-8 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative z-10">Shop Now</span>
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                </Link>
                <Link
                  href="/#categories"
                  className="px-8 py-4 text-lg rounded-xl border-2 border-white/20 hover:border-purple-500/50 bg-white/5 hover:bg-white/10 text-white font-bold transition-all duration-300 backdrop-blur-md transform hover:scale-105"
                >
                  Browse Categories
                </Link>
              </div>

              {/* Stats Row */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-gradient-animated font-[family-name:var(--font-orbitron)]">5000+</div>
                  <div className="text-slate-400 text-xs mt-1">Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-animated font-[family-name:var(--font-orbitron)]">48h</div>
                  <div className="text-slate-400 text-xs mt-1">Delivery</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-animated font-[family-name:var(--font-orbitron)]">100%</div>
                  <div className="text-slate-400 text-xs mt-1">Authentic</div>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[600px]">
                {/* Floating Cards */}
                <div className="absolute top-0 right-0 w-72 h-48 glass-card rounded-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500 animate-float">
                  <div className="text-purple-400 text-sm font-bold mb-2">Latest Products</div>
                  <div className="text-white text-2xl font-bold">Premium Tech</div>
                  <div className="text-slate-400 text-sm mt-2">Discover innovation</div>
                </div>
                <div className="absolute top-32 left-0 w-64 h-40 glass-card rounded-2xl p-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="text-cyan-400 text-sm font-bold mb-2">Fast Shipping</div>
                  <div className="text-white text-xl font-bold">48h Delivery</div>
                  <div className="text-slate-400 text-sm mt-2">All across Algeria</div>
                </div>
                <div className="absolute bottom-20 right-12 w-80 h-52 glass-card rounded-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="text-blue-400 text-sm font-bold mb-2">Secure Payment</div>
                  <div className="text-white text-2xl font-bold">Cash on Delivery</div>
                  <div className="text-slate-400 text-sm mt-2">Pay when you receive</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category: any) => (
            <Link
              href={`/#products`}
              key={category.id}
              className="group relative h-64 rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />
              {/* Placeholder backgrounds based on slug - in a real app these would be dynamic */}
              <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 ${category.slug === 'laptops' ? "bg-[url('https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80')]" :
                category.slug === 'desktops' ? "bg-[url('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80')]" :
                  "bg-[url('https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&q=80')]"
                }`} />

              <div className="absolute bottom-0 left-0 p-8 z-20">
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-slate-400 text-sm">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2 text-gradient-animated font-[family-name:var(--font-orbitron)]">
              Just Landed 🚀
            </h2>
            <p className="text-slate-400">
              Be the first to experience our latest tech arrivals.
            </p>
          </div>
          <Link href="/products?sort=newest" className="text-purple-400 hover:text-purple-300 font-medium hidden md:flex items-center gap-2 group">
            View All New Arrivals
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestProducts.slice(0, 4).map((product: any) => (
            <div key={product.id} className="h-[400px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Hot Deals Section */}
      {discountedProducts.length > 0 && (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2 text-gradient-animated font-[family-name:var(--font-orbitron)]">Hot Deals 🔥</h2>
              <p className="text-slate-400">Grab these limited-time offers before they're gone.</p>
            </div>
            <Link href="/products?filter=deals" className="text-purple-400 hover:text-purple-300 font-medium hidden md:flex items-center gap-2 group">
              View All Deals
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {discountedProducts.map((product: any) => (
              <div key={product.id} className="h-[400px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers / Featured Section */}
      <section id="products" className="py-20 px-4 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2 text-gradient-animated font-[family-name:var(--font-orbitron)]">Best Sellers</h2>
            <p className="text-slate-400">Our most popular products loved by customers.</p>
          </div>
          <Link href="/products" className="text-purple-400 hover:text-purple-300 font-medium hidden md:flex items-center gap-2 group">
            View All Products
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Uniform Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product: any) => (
            <div key={product.id} className="h-[400px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link href="/products" className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-2">
            View All Products →
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-xl opacity-20 animate-pulse-glow"></div>
          <div className="relative glass-card rounded-3xl p-8 md:p-12 text-center border-white/10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-orbitron)]">
                Stay Ahead of the Game
              </h2>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Subscribe to our newsletter for exclusive deals, new arrivals, and tech news.
                Join <span className="text-purple-400 font-bold">5000+</span> tech enthusiasts.
              </p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-105"
                >
                  Subscribe
                </button>
              </form>

              <p className="text-slate-500 text-xs mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
