"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Product } from "@/types";

const conditionMap: Record<string, { label: string; style: string }> = {
  new:      { label: "New",      style: "bg-sage-100 text-sage-500" },
  like_new: { label: "Like New", style: "bg-sage-100 text-sage-500" },
  good:     { label: "Good",     style: "bg-warm-100 text-warm-500" },
  fair:     { label: "Fair",     style: "bg-stone-100 text-stone-500" },
};

export default function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [inCart, setInCart] = useState(false);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) { toast.error("Sign in first"); return; }
    if (wishlisted) {
      await s.from("wishlists").delete().eq("user_id", user.id).eq("product_id", product.id);
      setWishlisted(false);
    } else {
      await s.from("wishlists").insert({ user_id: user.id, product_id: product.id });
      setWishlisted(true);
      toast.success("Saved");
    }
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) return;
    setInCart(true);
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) { toast.error("Sign in first"); setInCart(false); return; }
    let { data: cart } = await s.from("carts").select("id").eq("user_id", user.id).single();
    if (!cart) { const { data: nc } = await s.from("carts").insert({ user_id: user.id }).select("id").single(); cart = nc; }
    if (!cart) { setInCart(false); return; }
    const { data: ex } = await s.from("cart_items").select("id,quantity").eq("cart_id", cart.id).eq("product_id", product.id).single();
    if (ex) await s.from("cart_items").update({ quantity: ex.quantity + 1 }).eq("id", ex.id);
    else await s.from("cart_items").insert({ cart_id: cart.id, product_id: product.id, quantity: 1 });
    toast.success("Added to cart");
    window.dispatchEvent(new Event("cartUpdated"));
    setTimeout(() => setInCart(false), 1200);
  };

  const cond = conditionMap[product.condition] || { label: product.condition, style: "bg-stone-100 text-stone-500" };

  return (
    <Link href={`/buyer/product/${product.id}`} className="block group">
      <div className="card-product">

        {/* ── Image ── */}
        <div className="img-zoom relative aspect-[2/3] bg-[#EDEAE3] overflow-hidden">
          <Image
            src={product.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&q=80"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/12 transition-all duration-700" />

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2
                          translate-x-12 opacity-0
                          group-hover:translate-x-0 group-hover:opacity-100
                          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <button onClick={toggleWishlist}
              className={`w-9 h-9 flex items-center justify-center shadow-medium transition-all duration-300 ${
                wishlisted ? "bg-stone-950 text-white" : "bg-white text-stone-600 hover:bg-stone-950 hover:text-white"
              }`}>
              <Heart className={`w-[14px] h-[14px]`} strokeWidth={wishlisted ? 2 : 1.5} fill={wishlisted ? "currentColor" : "none"} />
            </button>
            <button onClick={addToCart}
              className="w-9 h-9 flex items-center justify-center bg-white text-stone-600 hover:bg-stone-950 hover:text-white shadow-medium transition-all duration-300">
              {inCart
                ? <span className="w-3.5 h-3.5 border border-stone-400 border-t-stone-800 rounded-full animate-spin" />
                : <ShoppingBag className="w-[14px] h-[14px]" strokeWidth={1.5} />}
            </button>
          </div>

          {/* Condition badge */}
          <div className="absolute bottom-0 left-0 right-0 p-3
                          translate-y-8 opacity-0
                          group-hover:translate-y-0 group-hover:opacity-100
                          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <span className={`status-badge ${cond.style}`}>{cond.label}</span>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="p-4 pt-3.5">
          <p className="text-[10px] text-stone-400 tracking-[0.2em] uppercase mb-1 font-normal" style={{ fontFamily: "var(--font-body)" }}>
            {product.brand}
          </p>
          <h3 className="text-stone-800 text-[13.5px] font-light line-clamp-2 leading-snug mb-3" style={{ letterSpacing: "0.01em" }}>
            {product.name}
          </h3>
          <div className="flex items-end justify-between">
            <span className="font-display text-[17px] text-stone-950 font-normal" style={{ letterSpacing: "0.01em" }}>
              Rp {product.price.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-stone-400 font-light tracking-wider">{product.size}</span>
          </div>
          {product.seller && (
            <p className="text-[10px] text-stone-400 mt-2 font-light tracking-wide truncate">
              by {product.seller.full_name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
