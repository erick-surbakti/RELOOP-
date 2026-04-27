"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, ArrowRight, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { CartItem } from "@/types";
import Footer from "@/components/shared/Footer";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const s = createClient();
      const { data: { user } } = await s.auth.getUser();
      if (!user) return;
      let { data: cart } = await s.from("carts").select("id").eq("user_id", user.id).single();
      if (!cart) { const { data: nc } = await s.from("carts").insert({ user_id: user.id }).select("id").single(); cart = nc; }
      if (!cart) { setLoading(false); return; }
      setCartId(cart.id);
      const { data } = await s.from("cart_items").select("*, product:products(*)").eq("cart_id", cart.id).order("created_at", { ascending: false });
      setItems(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) { removeItem(id); return; }
    await createClient().from("cart_items").update({ quantity: qty }).eq("id", id);
    setItems(p => p.map(i => i.id === id ? { ...i, quantity: qty } : i));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = async (id: string) => {
    await createClient().from("cart_items").delete().eq("id", id);
    setItems(p => p.filter(i => i.id !== id));
    toast.success("Removed");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal > 0 ? 15000 : 0;

  return (
    <div className="pt-16 lg:pt-20" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="section-container py-14">

        {/* Title */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6, fontFamily: "var(--font-body)" }}>My</p>
          <h1 className="font-display font-light" style={{ fontSize: "3rem", color: "var(--text)" }}>Cart</h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "96px 0" }}>
            <ShoppingBag className="w-10 h-10 mx-auto mb-5" strokeWidth={1} style={{ color: "#D4CFC8" }} />
            <h3 className="font-display font-light" style={{ fontSize: "1.75rem", color: "var(--text-2)", marginBottom: 8 }}>Your cart is empty</h3>
            <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 32, fontWeight: 300 }}>Add some pieces to get started.</p>
            <Link href="/buyer/homepage" className="btn-primary">Browse Collection</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <AnimatePresence>
                {items.map(item => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }}
                    style={{ background: "white", padding: "20px 24px", display: "flex", gap: 20, alignItems: "center" }}>
                    <Link href={`/buyer/product/${item.product?.id}`} style={{ flexShrink: 0 }}>
                      <div style={{ width: 80, height: 100, position: "relative", overflow: "hidden", background: "#F5F3EF" }}>
                        <Image src={item.product?.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&q=80"}
                          alt={item.product?.name || ""} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="80px" />
                      </div>
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4, fontFamily: "var(--font-body)" }}>
                        {item.product?.brand}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 300, color: "var(--text)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.product?.name}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 300 }}>
                        Size: {item.product?.size}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                        {/* Qty */}
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)" }}>
                          <button onClick={() => updateQty(item.id, item.quantity - 1)}
                            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)", cursor: "pointer", background: "none", border: "none" }}>
                            <Minus className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                          <span style={{ width: 32, textAlign: "center", fontSize: 13, color: "var(--text)", fontWeight: 300 }}>{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)}
                            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)", cursor: "pointer", background: "none", border: "none" }}>
                            <Plus className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <span className="font-display" style={{ fontSize: 16, color: "var(--text)" }}>
                            Rp {((item.product?.price || 0) * item.quantity).toLocaleString("id-ID")}
                          </span>
                          <button onClick={() => removeItem(item.id)} style={{ color: "#D4CFC8", cursor: "pointer", background: "none", border: "none", transition: "color 0.2s" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#D4CFC8")}>
                            <X className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div style={{ background: "white", padding: "28px 24px", position: "sticky", top: 100 }}>
              <h2 className="font-display font-light" style={{ fontSize: "1.5rem", color: "var(--text)", marginBottom: 24 }}>Summary</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Subtotal", val: `Rp ${subtotal.toLocaleString("id-ID")}` },
                  { label: "Shipping (COD)", val: `Rp ${shipping.toLocaleString("id-ID")}` },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-2)", fontWeight: 300 }}>
                    <span>{label}</span><span>{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--border-2)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-2)", fontFamily: "var(--font-body)" }}>Total</span>
                  <span className="font-display" style={{ fontSize: "1.5rem", color: "var(--text)" }}>
                    Rp {(subtotal + shipping).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <button onClick={() => router.push("/buyer/checkout")} className="btn-primary w-full flex items-center justify-center gap-2">
                Checkout <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <Link href="/buyer/homepage" style={{ display: "block", textAlign: "center", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)", marginTop: 16, fontFamily: "var(--font-body)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
