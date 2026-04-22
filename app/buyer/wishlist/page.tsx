"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { WishlistItem } from "@/types";
import Footer from "@/components/shared/Footer";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("wishlists")
      .select("*, product:products(*, seller:profiles!seller_id(full_name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const removeFromWishlist = async (itemId: string) => {
    const supabase = createClient();
    await supabase.from("wishlists").delete().eq("id", itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    toast.success("Removed from wishlist");
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const moveToCart = async (item: WishlistItem) => {
    if (!item.product) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
    if (!cart) {
      const { data: newCart } = await supabase.from("carts").insert({ user_id: user.id }).select("id").single();
      cart = newCart;
    }
    if (!cart) return;

    const { data: existing } = await supabase.from("cart_items")
      .select("id, quantity").eq("cart_id", cart.id).eq("product_id", item.product.id).single();
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ cart_id: cart.id, product_id: item.product.id, quantity: 1 });
    }

    await removeFromWishlist(item.id);
    toast.success("Moved to cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-ivory-50">
      <div className="section-container py-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs tracking-widest uppercase text-stone-400 block mb-1">My</span>
            <h1 className="font-display text-4xl text-stone-900 font-light">Wishlist</h1>
          </div>
          {items.length > 0 && (
            <span className="text-stone-400 text-sm">{items.length} {items.length === 1 ? "piece" : "pieces"}</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-100">
                <div className="skeleton aspect-[3/4]" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-3 w-16 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-5 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-5">
              <Heart className="w-7 h-7 text-stone-300" />
            </div>
            <h3 className="font-display text-2xl text-stone-700 font-light mb-2">Your wishlist is empty</h3>
            <p className="text-stone-400 text-sm mb-8">Save pieces you love and come back to them anytime.</p>
            <Link href="/buyer/homepage" className="btn-primary flex items-center gap-2">
              Discover Pieces <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-stone-100 group overflow-hidden"
                >
                  {/* Image */}
                  <div className="img-zoom relative aspect-[3/4] bg-stone-100">
                    <Link href={`/buyer/product/${item.product?.id}`}>
                      <Image
                        src={item.product?.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80"}
                        alt={item.product?.name || ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors translate-x-8 group-hover:translate-x-0 duration-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[11px] text-stone-400 tracking-widest uppercase mb-1">{item.product?.brand}</p>
                    <h3 className="text-stone-800 text-sm font-medium line-clamp-2 leading-snug mb-2">
                      {item.product?.name}
                    </h3>
                    <div className="font-display text-base text-stone-900 mb-3">
                      Rp {item.product?.price.toLocaleString("id-ID")}
                    </div>
                    <button
                      onClick={() => moveToCart(item)}
                      className="w-full flex items-center justify-center gap-2 bg-stone-900 text-ivory-100 py-2.5 text-xs tracking-widest uppercase hover:bg-stone-800 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Move to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
