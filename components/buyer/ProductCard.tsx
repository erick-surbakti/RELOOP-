"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Product } from "@/types";

const conditionLabels: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

const conditionColors: Record<string, string> = {
  new: "bg-sage-100 text-sage-600",
  like_new: "bg-sage-100 text-sage-600",
  good: "bg-warm-100 text-warm-600",
  fair: "bg-stone-100 text-stone-500",
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in"); return; }

    if (wishlisted) {
      await supabase.from("wishlists").delete()
        .eq("user_id", user.id).eq("product_id", product.id);
      setWishlisted(false);
      toast.success("Removed from wishlist");
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: product.id });
      setWishlisted(true);
      toast.success("Added to wishlist");
    }
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAddingToCart(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in"); setAddingToCart(false); return; }

    let { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
    if (!cart) {
      const { data: newCart } = await supabase.from("carts").insert({ user_id: user.id }).select("id").single();
      cart = newCart;
    }
    if (!cart) { setAddingToCart(false); return; }

    const { data: existingItem } = await supabase.from("cart_items")
      .select("id, quantity").eq("cart_id", cart.id).eq("product_id", product.id).single();

    if (existingItem) {
      await supabase.from("cart_items").update({ quantity: existingItem.quantity + 1 }).eq("id", existingItem.id);
    } else {
      await supabase.from("cart_items").insert({ cart_id: cart.id, product_id: product.id, quantity: 1 });
    }

    toast.success("Added to cart");
    window.dispatchEvent(new Event("cartUpdated"));
    setAddingToCart(false);
  };

  return (
    <Link href={`/buyer/product/${product.id}`} className="block group">
      <div className="card-product">
        {/* Image */}
        <div className="img-zoom relative aspect-[3/4] bg-stone-100">
          <Image
            src={product.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/10 transition-all duration-500" />
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-8 group-hover:translate-x-0 transition-transform duration-300">
            <button
              onClick={toggleWishlist}
              className={`w-9 h-9 flex items-center justify-center shadow-elegant transition-all duration-300 ${
                wishlisted ? "bg-stone-900 text-ivory-100" : "bg-white/90 text-stone-700 hover:bg-stone-900 hover:text-ivory-100"
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={addToCart}
              disabled={addingToCart}
              className="w-9 h-9 flex items-center justify-center bg-white/90 text-stone-700 hover:bg-stone-900 hover:text-ivory-100 shadow-elegant transition-all duration-300"
            >
              {addingToCart ? (
                <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </button>
          </div>
          {/* Condition badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`status-badge text-[10px] ${conditionColors[product.condition] || "bg-stone-100 text-stone-500"}`}>
              {conditionLabels[product.condition] || product.condition}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] text-stone-400 tracking-widest uppercase mb-1">{product.brand}</p>
          <h3 className="text-stone-800 text-sm font-medium line-clamp-2 leading-snug mb-2 group-hover:text-stone-900 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-stone-900">
              Rp {product.price.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-stone-400">{product.size}</span>
          </div>
          {product.seller && (
            <p className="text-[11px] text-stone-400 mt-1.5 truncate">by {product.seller.full_name}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
