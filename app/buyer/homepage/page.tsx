"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product, ProductFilters, ProductCategory, ProductCondition } from "@/types";
import ProductCard from "@/components/buyer/ProductCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import Footer from "@/components/shared/Footer";

const CATEGORIES: { value: ProductCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "outerwear", label: "Outerwear" },
  { value: "shoes", label: "Shoes" },
  { value: "bags", label: "Bags" },
  { value: "accessories", label: "Accessories" },
  { value: "activewear", label: "Activewear" },
  { value: "formal", label: "Formal" },
];

const CONDITIONS: { value: ProductCondition | ""; label: string }[] = [
  { value: "", label: "Any Condition" },
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const SIZES = ["", "XS", "S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42"];

export default function BuyerHomepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "",
    size: "",
    condition: "",
    sortBy: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("*, seller:profiles!seller_id(id, full_name, avatar_url)")
      .gt("stock", 0);

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.size) query = query.eq("size", filters.size);
    if (filters.condition) query = query.eq("condition", filters.condition);

    if (filters.sortBy === "newest") query = query.order("created_at", { ascending: false });
    else if (filters.sortBy === "price_asc") query = query.order("price", { ascending: true });
    else if (filters.sortBy === "price_desc") query = query.order("price", { ascending: false });

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  };

  const hasFilters = filters.category || filters.size || filters.condition || filters.search;

  const clearFilters = () => {
    setFilters({ search: "", category: "", size: "", condition: "", sortBy: "newest" });
  };

  return (
    <div className="pt-16 lg:pt-20">
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/20 via-stone-950/30 to-stone-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end h-full section-container pb-16 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-warm-300 text-xs tracking-[0.4em] uppercase mb-4 block">
              Curated Collection · SS 2024
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-ivory-50 font-light leading-none mb-6">
              Pre-Loved,
              <br />
              <em className="italic">Reimagined</em>
            </h1>
            <p className="text-ivory-300/80 text-lg max-w-md font-light">
              Discover carefully curated secondhand fashion from trusted sellers across Indonesia.
            </p>
          </motion.div>
        </div>

        {/* Floating search */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 w-full max-w-2xl px-4"
        >
          <div className="bg-white shadow-elegant-lg flex items-center border border-stone-100">
            <Search className="w-5 h-5 text-stone-400 ml-5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, brand, or category..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="flex-1 px-4 py-4 text-stone-800 placeholder:text-stone-400 text-sm outline-none bg-transparent"
            />
            {filters.search && (
              <button onClick={() => setFilters((f) => ({ ...f, search: "" }))} className="p-2 mr-2">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Category Pills */}
      <section className="mt-20 section-container">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilters((f) => ({ ...f, category: cat.value }))}
              className={`flex-shrink-0 px-5 py-2.5 text-xs tracking-widest uppercase transition-all duration-300 ${
                filters.category === cat.value
                  ? "bg-stone-900 text-ivory-100"
                  : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Filter Bar */}
      <section className="section-container mt-6 mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-widest uppercase border transition-all duration-300 ${
                showFilters ? "bg-stone-900 text-ivory-100 border-stone-900" : "border-stone-200 text-stone-600 hover:border-stone-500"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {hasFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-warm-400 ml-1" />
              )}
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}

            <span className="text-stone-400 text-xs">
              {loading ? "Loading..." : `${products.length} pieces`}
            </span>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as any }))}
              className="appearance-none bg-white border border-stone-200 text-stone-700 text-xs tracking-wider uppercase px-4 py-2.5 pr-8 outline-none cursor-pointer hover:border-stone-400 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-white border border-stone-100"
          >
            <div>
              <label className="text-xs tracking-widest uppercase text-stone-400 block mb-2">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters((f) => ({ ...f, condition: e.target.value as any }))}
                className="w-full text-sm text-stone-700 border border-stone-200 px-3 py-2 outline-none focus:border-stone-500 bg-transparent"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-stone-400 block mb-2">Size</label>
              <select
                value={filters.size}
                onChange={(e) => setFilters((f) => ({ ...f, size: e.target.value }))}
                className="w-full text-sm text-stone-700 border border-stone-200 px-3 py-2 outline-none focus:border-stone-500 bg-transparent"
              >
                <option value="">All Sizes</option>
                {SIZES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-stone-400 block mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as any }))}
                className="w-full text-sm text-stone-700 border border-stone-200 px-3 py-2 outline-none focus:border-stone-500 bg-transparent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </section>

      {/* Product Grid */}
      <section className="section-container mb-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-stone-300" />
            </div>
            <h3 className="font-display text-2xl text-stone-700 font-light mb-2">No pieces found</h3>
            <p className="text-stone-400 text-sm mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Editorial Banner */}
      <section className="bg-stone-900 py-20 px-4">
        <div className="section-container text-center">
          <span className="text-warm-300 text-xs tracking-[0.4em] uppercase block mb-4">Circular Fashion</span>
          <h2 className="font-display text-4xl md:text-5xl text-ivory-50 font-light mb-4">
            Fashion that doesn't<br />cost the earth
          </h2>
          <p className="text-stone-400 text-sm max-w-md mx-auto">
            Every secondhand purchase reduces waste and extends the lifecycle of quality pieces.
            Shop mindfully with Reloop.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
