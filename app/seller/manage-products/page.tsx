"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PlusSquare, Edit2, Trash2, Package, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Product } from "@/types";

const conditionLabels: Record<string, string> = {
  new: "New", like_new: "Like New", good: "Good", fair: "Fair",
};

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("products").select("*")
      .eq("seller_id", user.id).order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    }
    setDeleting(null);
  };

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-14 lg:pt-0 min-h-screen bg-stone-50">
      <div className="p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-stone-400 text-xs tracking-widest uppercase mb-1">Seller Studio</p>
            <h1 className="font-display text-3xl text-stone-900 font-light">My Products</h1>
          </div>
          <Link href="/seller/add-product" className="btn-primary flex items-center gap-2 w-fit">
            <PlusSquare className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-elegant pl-11"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-100">
                <div className="skeleton aspect-[3/4]" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-12 h-12 text-stone-200 mb-4" />
            <h3 className="font-display text-2xl text-stone-600 font-light mb-2">
              {search ? "No products found" : "No products listed"}
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              {search ? "Try a different search term." : "Start by adding your first piece."}
            </p>
            {!search && (
              <Link href="/seller/add-product" className="btn-primary">Add First Product</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-white border border-stone-100 group overflow-hidden hover:shadow-elegant transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                    <Image
                      src={product.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
                        <span className="text-white text-xs tracking-widest uppercase font-medium bg-stone-900 px-3 py-1">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {/* Actions overlay */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={deleting === product.id}
                        className="w-8 h-8 bg-white/90 text-stone-600 hover:bg-red-50 hover:text-red-500 flex items-center justify-center shadow-elegant transition-colors"
                      >
                        {deleting === product.id ? (
                          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[11px] text-stone-400 tracking-widest uppercase mb-1">{product.brand}</p>
                    <h3 className="text-stone-800 font-medium text-sm line-clamp-2 leading-snug mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-base text-stone-900">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-stone-400">Stock: {product.stock}</span>
                      <span className="text-stone-200">·</span>
                      <span className="text-[11px] text-stone-400 capitalize">{product.size}</span>
                      <span className="text-stone-200">·</span>
                      <span className="text-[11px] text-stone-400">{conditionLabels[product.condition]}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Summary bar */}
        {!loading && products.length > 0 && (
          <div className="mt-8 text-center">
            <span className="text-stone-400 text-xs">
              {filtered.length} of {products.length} products shown
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
