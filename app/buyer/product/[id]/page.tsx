"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowLeft, Package, Tag, Ruler, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Product } from "@/types";

const conditionLabels: Record<string, string> = {
  new: "New", like_new: "Like New", good: "Good", fair: "Fair",
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*, seller:profiles!seller_id(id, full_name, avatar_url, city)")
        .eq("id", id)
        .single();
      setProduct(data);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const { data: wItem } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", data.id)
          .single();
        setWishlisted(!!wItem);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const toggleWishlist = async () => {
    if (!product) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in"); return; }

    if (wishlisted) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", product.id);
      setWishlisted(false);
      toast.success("Removed from wishlist");
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: product.id });
      setWishlisted(true);
      toast.success("Added to wishlist");
    }
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addToCart = async () => {
    if (!product) return;
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
      await supabase.from("cart_items").update({ quantity: existingItem.quantity + quantity }).eq("id", existingItem.id);
    } else {
      await supabase.from("cart_items").insert({ cart_id: cart.id, product_id: product.id, quantity });
    }

    toast.success("Added to cart");
    window.dispatchEvent(new Event("cartUpdated"));
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen section-container py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-[3/4] w-full" />
          <div className="space-y-4 pt-4">
            {[80, 60, 40, 100, 70].map((w, i) => (
              <div key={i} className={`skeleton h-6 rounded`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-3xl text-stone-700 font-light mb-2">Product not found</h2>
          <Link href="/buyer/homepage" className="btn-secondary mt-4 inline-block">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-ivory-50">
      <div className="section-container py-8 lg:py-12">
        {/* Breadcrumb */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-stone-400 text-sm hover:text-stone-800 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="img-zoom relative aspect-[3/4] bg-stone-100 overflow-hidden"
          >
            <Image
              src={product.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-start py-2"
          >
            <div className="mb-2">
              <span className="text-xs tracking-widest uppercase text-warm-500 font-medium">{product.brand}</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl text-stone-900 font-light leading-tight mb-4">
              {product.name}
            </h1>
            <div className="font-display text-3xl text-stone-900 mb-6">
              Rp {product.price.toLocaleString("id-ID")}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: Tag, label: "Condition", value: conditionLabels[product.condition] || product.condition },
                { icon: Ruler, label: "Size", value: product.size },
                { icon: Package, label: "Category", value: product.category },
                { icon: Star, label: "Stock", value: `${product.stock} available` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white border border-stone-100 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-[11px] tracking-widest uppercase text-stone-400">{label}</span>
                  </div>
                  <span className="text-sm text-stone-800 font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h3 className="text-xs tracking-widest uppercase text-stone-400 mb-3">Description</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs tracking-widest uppercase text-stone-400">Qty</span>
              <div className="flex items-center border border-stone-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
                >−</button>
                <span className="w-10 text-center text-sm font-medium text-stone-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
                >+</button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={addingToCart || product.stock === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <span className="w-4 h-4 border-2 border-ivory-300/40 border-t-ivory-300 rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={toggleWishlist}
                className={`w-14 h-14 border flex items-center justify-center transition-all duration-300 ${
                  wishlisted ? "bg-stone-900 border-stone-900 text-ivory-100" : "border-stone-200 text-stone-600 hover:border-stone-800"
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Seller info */}
            {product.seller && (
              <div className="mt-8 pt-6 border-t border-stone-100">
                <span className="text-[11px] tracking-widest uppercase text-stone-400 block mb-3">Seller</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                    {product.seller.avatar_url ? (
                      <Image src={product.seller.avatar_url} alt={product.seller.full_name} width={40} height={40} className="object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-stone-600">
                        {product.seller.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{product.seller.full_name}</p>
                    {product.seller.city && (
                      <p className="text-xs text-stone-400">{product.seller.city}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
