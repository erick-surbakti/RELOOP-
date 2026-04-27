"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product, ProductFilters, ProductCategory, ProductCondition } from "@/types";
import ProductCard from "@/components/buyer/ProductCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import Footer from "@/components/shared/Footer";

const CATEGORIES: { value: ProductCategory | ""; label: string }[] = [
  { value: "", label: "Everything" },
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
  { value: "", label: "Any" },
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const TICKER = ["Pre-Loved", "Curated", "Sustainable", "Circular Fashion", "Reloop", "Trusted Sellers", "Premium Pieces", "Conscious Living"];

export default function BuyerHomepage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get("search") || "",
    category: "", size: "", condition: "", sortBy: "newest",
  });

  useEffect(() => {
    setFilters((f) => ({ ...f, search: searchParams.get("search") || "" }));
  }, [searchParams]);

  useEffect(() => { fetchProducts(); }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    const s = createClient();
    let q = s.from("products").select("*, seller:profiles!seller_id(id,full_name,avatar_url)").gt("stock", 0);
    if (filters.search) q = q.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
    if (filters.category) q = q.eq("category", filters.category);
    if (filters.size) q = q.eq("size", filters.size);
    if (filters.condition) q = q.eq("condition", filters.condition);
    if (filters.sortBy === "newest") q = q.order("created_at", { ascending: false });
    else if (filters.sortBy === "price_asc") q = q.order("price", { ascending: true });
    else if (filters.sortBy === "price_desc") q = q.order("price", { ascending: false });
    const { data } = await q;
    setProducts(data || []);
    setLoading(false);
  };

  const hasFilters = !!(filters.category || filters.size || filters.condition || filters.search);
  const clearFilters = () => setFilters({ search: "", category: "", size: "", condition: "", sortBy: "newest" });

  return (
    <div style={{ background: "var(--bg)" }}>

      {/* ══════════ HERO ══════════ */}
      <section className="relative h-screen min-h-[640px] max-h-[960px] overflow-hidden noise">
        {/* BG Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85"
            alt=""
            className="w-full h-full object-cover"
            style={{ transition: "transform 12s ease", transform: "scale(1.02)" }}
          />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(10,8,6,0.15) 0%, rgba(10,8,6,0.55) 60%, rgba(10,8,6,0.85) 100%)" }} />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end section-container pb-20 lg:pb-32">
          <div className="max-w-4xl">

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex items-center gap-3 mb-7"
            >
              <div style={{ width: 32, height: 1, background: "rgba(196,168,130,0.7)" }} />
              <span style={{ color: "rgba(196,168,130,0.85)", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                Curated Collection · 2024
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-light text-white leading-[0.92] mb-8"
              style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)" }}
            >
              Pre-Loved,
              <br />
              <em className="italic" style={{ color: "rgba(247,245,240,0.82)" }}>Reimagined</em>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45 }}
              style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: 300, maxWidth: 420, lineHeight: 1.7, marginBottom: 40 }}
            >
              Discover carefully curated secondhand fashion from trusted sellers across Indonesia.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex items-center gap-3 btn-primary"
                style={{ background: "white", color: "#171412" }}
              >
                Shop the Edit
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
            </motion.div>
          </div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="absolute bottom-10 right-12 hidden lg:flex flex-col items-center gap-4"
          >
            <div style={{ width: 1, height: 56, background: "rgba(255,255,255,0.12)", position: "relative", overflow: "hidden" }}>
              <motion.div
                style={{ position: "absolute", top: 0, left: 0, width: "100%", background: "rgba(255,255,255,0.5)" }}
                animate={{ height: ["0%","100%"], top:["0%","100%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", writingMode: "vertical-lr" }}>
              Scroll
            </span>
          </motion.div>
        </div>
      </section>

      {/* ══════════ TICKER ══════════ */}
      <div style={{ background: "#111009", padding: "14px 0", overflow: "hidden" }}>
        <div className="marquee-track whitespace-nowrap">
          {[...TICKER, ...TICKER, ...TICKER].map((item, i) => (
            <span key={i} style={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: "#3A3530", padding: "0 28px", fontFamily: "var(--font-body)", fontWeight: 300 }}>
              {item}
              <span style={{ color: "#C4A882", marginLeft: 28, opacity: 0.4 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ EDITORIAL STRIP ══════════ */}
      <div className="section-container py-16 border-b" style={{ borderColor: "var(--border-2)" }}>
        <div className="grid grid-cols-3 gap-8 text-center">
          {[
            { num: "2,000+", label: "Curated Pieces" },
            { num: "500+",   label: "Trusted Sellers" },
            { num: "100%",   label: "Pre-Loved" },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="font-display font-light" style={{ fontSize: "clamp(2rem,4vw,3.5rem)", color: "var(--text)", lineHeight: 1.1 }}>
                {num}
              </div>
              <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-3)", marginTop: 8, fontFamily: "var(--font-body)", fontWeight: 300 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ CATEGORY PILLS ══════════ */}
      <div className="section-container pt-14 pb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const active = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setFilters((f) => ({ ...f, category: cat.value }))}
                className="flex-shrink-0 transition-all duration-300"
                style={{
                  padding: "8px 18px",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  background: active ? "var(--text)" : "white",
                  color: active ? "var(--bg)" : "var(--text-2)",
                  border: `1px solid ${active ? "var(--text)" : "var(--border)"}`,
                  cursor: "pointer",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════ FILTER + SORT BAR ══════════ */}
      <div id="collection" className="section-container mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 transition-all duration-300"
              style={{
                padding: "8px 16px",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontFamily: "var(--font-body)",
                border: `1px solid ${showFilters || hasFilters ? "var(--text)" : "var(--border)"}`,
                background: showFilters || hasFilters ? "var(--text)" : "transparent",
                color: showFilters || hasFilters ? "var(--bg)" : "var(--text-2)",
                cursor: "pointer",
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              Filter
              {hasFilters && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C4A882", marginLeft: 2 }} />}
            </button>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)", cursor: "pointer" }}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}

            <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-3)" }}>
              {loading ? "—" : `${products.length} pieces`}
            </span>
          </div>

          <div className="relative flex items-center gap-1.5">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as any }))}
              style={{
                appearance: "none",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                padding: "6px 20px 6px 0",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--text-2)",
                fontFamily: "var(--font-body)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-0 pointer-events-none" style={{ color: "var(--text-3)" }} strokeWidth={1.5} />
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: 16, padding: "24px 28px", background: "white", border: "1px solid var(--border-2)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
          >
            {[
              { label: "Condition", key: "condition", options: CONDITIONS },
              { label: "Size", key: "size", options: [{ value: "", label: "All sizes" }, ...["XS","S","M","L","XL","XXL","38","39","40","41","42"].map(s => ({ value: s, label: s }))] },
              { label: "Category", key: "category", options: CATEGORIES.map(c => ({ value: c.value, label: c.label })) },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10, fontFamily: "var(--font-body)" }}>
                  {label}
                </label>
                <select
                  value={(filters as any)[key]}
                  onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", padding: "8px 0", fontSize: 13, color: "var(--text)", fontFamily: "var(--font-body)", fontWeight: 300, outline: "none", cursor: "pointer" }}
                >
                  {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ══════════ PRODUCT GRID ══════════ */}
      <div className="section-container mb-28">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-36 text-center">
            <div className="font-display font-light mb-5" style={{ fontSize: "5rem", color: "var(--bg-2)" }}>∅</div>
            <h3 className="font-display font-light mb-2" style={{ fontSize: "1.75rem", color: "var(--text-2)" }}>No pieces found</h3>
            <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 32 }}>Try adjusting your filters.</p>
            <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: Math.min(i * 0.05, 0.35), ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════ MISSION BANNER ══════════ */}
      <section className="noise" style={{ background: "#111009", padding: "112px 0" }}>
        <div className="section-container text-center" style={{ position: "relative", zIndex: 1 }}>
          <div className="flex items-center justify-center gap-4 mb-7">
            <div style={{ width: 40, height: 1, background: "rgba(196,168,130,0.4)" }} />
            <span style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(196,168,130,0.7)", fontFamily: "var(--font-body)" }}>
              Our Mission
            </span>
            <div style={{ width: 40, height: 1, background: "rgba(196,168,130,0.4)" }} />
          </div>
          <h2 className="font-display font-light" style={{ fontSize: "clamp(2.25rem,6vw,5rem)", color: "rgba(247,245,240,0.9)", lineHeight: 1.1, marginBottom: 24 }}>
            Fashion that doesn't<br />
            <em className="italic" style={{ color: "rgba(196,168,130,0.8)" }}>cost the earth</em>
          </h2>
          <p style={{ color: "#3A3530", fontSize: 14, maxWidth: 380, margin: "0 auto", fontWeight: 300, lineHeight: 1.8 }}>
            Every secondhand purchase extends the lifecycle of quality pieces and reduces fashion's environmental impact.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
