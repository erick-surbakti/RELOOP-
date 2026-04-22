"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, ArrowRight, Plus, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { CartItem } from "@/types";
import Footer from "@/components/shared/Footer";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
    if (!cart) {
      const { data: newCart } = await supabase.from("carts").insert({ user_id: user.id }).select("id").single();
      cart = newCart;
    }
    if (!cart) { setLoading(false); return; }
    setCartId(cart.id);

    const { data } = await supabase
      .from("cart_items")
      .select("*, product:products(*)")
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) { removeItem(itemId); return; }
    const supabase = createClient();
    await supabase.from("cart_items").update({ quantity: newQty }).eq("id", itemId);
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity: newQty } : i));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = async (itemId: string) => {
    const supabase = createClient();
    await supabase.from("cart_items").delete().eq("id", itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    toast.success("Item removed");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-ivory-50">
      <div className="section-container py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs tracking-widest uppercase text-stone-400 block mb-1">My</span>
            <h1 className="font-display text-4xl text-stone-900 font-light">Cart</h1>
          </div>
          {items.length > 0 && (
            <span className="text-stone-400 text-sm">{items.length} {items.length === 1 ? "item" : "items"}</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-100 p-4 flex gap-4">
                <div className="skeleton w-24 h-32 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-5 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-5">
              <ShoppingBag className="w-7 h-7 text-stone-300" />
            </div>
            <h3 className="font-display text-2xl text-stone-700 font-light mb-2">Your cart is empty</h3>
            <p className="text-stone-400 text-sm mb-8">Add some pieces to get started.</p>
            <Link href="/buyer/homepage" className="btn-primary flex items-center gap-2">
              Browse Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white border border-stone-100 p-4 flex gap-5"
                  >
                    {/* Image */}
                    <Link href={`/buyer/product/${item.product?.id}`} className="flex-shrink-0">
                      <div className="w-24 h-32 relative overflow-hidden bg-stone-100">
                        <Image
                          src={item.product?.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&q=80"}
                          alt={item.product?.name || ""}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="96px"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-stone-400 tracking-widest uppercase mb-0.5">{item.product?.brand}</p>
                      <h3 className="text-stone-800 font-medium text-sm leading-snug mb-1 line-clamp-2">
                        {item.product?.name}
                      </h3>
                      <p className="text-xs text-stone-400 mb-3">
                        Size: {item.product?.size} · {item.product?.condition?.replace("_", " ")}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Qty */}
                        <div className="flex items-center border border-stone-200">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm text-stone-800">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-display text-base text-stone-900">
                            Rp {((item.product?.price || 0) * item.quantity).toLocaleString("id-ID")}
                          </span>
                          <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-stone-100 p-6 sticky top-28">
                <h2 className="font-display text-xl text-stone-900 font-light mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Shipping (COD)</span>
                    <span>Rp {shipping.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t border-stone-100 pt-3 flex justify-between font-medium text-stone-900">
                    <span className="text-sm tracking-wider uppercase">Total</span>
                    <span className="font-display text-xl">Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/buyer/checkout")}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <Link href="/buyer/homepage" className="block text-center text-xs text-stone-400 hover:text-stone-700 mt-4 transition-colors tracking-wider">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
