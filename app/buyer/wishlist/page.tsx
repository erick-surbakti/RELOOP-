"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ArrowRight, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { WishlistItem } from "@/types";
import Footer from "@/components/shared/Footer";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const s = createClient();
      const { data: { user } } = await s.auth.getUser();
      if (!user) return;
      const { data } = await s.from("wishlists").select("*, product:products(*, seller:profiles!seller_id(full_name))").eq("user_id", user.id).order("created_at", { ascending: false });
      setItems(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const remove = async (id: string) => {
    await createClient().from("wishlists").delete().eq("id", id);
    setItems(p => p.filter(i => i.id !== id));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const moveToCart = async (item: WishlistItem) => {
    if (!item.product) return;
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return;
    let { data: cart } = await s.from("carts").select("id").eq("user_id", user.id).single();
    if (!cart) { const { data: nc } = await s.from("carts").insert({ user_id: user.id }).select("id").single(); cart = nc; }
    if (!cart) return;
    const { data: ex } = await s.from("cart_items").select("id,quantity").eq("cart_id", cart.id).eq("product_id", item.product.id).single();
    if (ex) await s.from("cart_items").update({ quantity: ex.quantity + 1 }).eq("id", ex.id);
    else await s.from("cart_items").insert({ cart_id: cart.id, product_id: item.product.id, quantity: 1 });
    await remove(item.id);
    toast.success("Moved to cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="pt-16 lg:pt-20" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="section-container py-14">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6, fontFamily: "var(--font-body)" }}>My</p>
            <h1 className="font-display font-light" style={{ fontSize: "3rem", color: "var(--text)" }}>Wishlist</h1>
          </div>
          {items.length > 0 && (
            <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 300 }}>{items.length} {items.length === 1 ? "piece" : "pieces"}</span>
          )}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[1,2,3,4].map(i => <div key={i}><div className="skeleton" style={{ aspectRatio: "2/3" }} /><div style={{ padding: "14px 0" }}><div className="skeleton" style={{ height: 10, width: "60%", marginBottom: 8 }} /><div className="skeleton" style={{ height: 14, width: "90%" }} /></div></div>)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "96px 0" }}>
            <Heart className="w-10 h-10 mx-auto mb-5" strokeWidth={1} style={{ color: "#D4CFC8" }} />
            <h3 className="font-display font-light" style={{ fontSize: "1.75rem", color: "var(--text-2)", marginBottom: 8 }}>Nothing saved yet</h3>
            <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 32, fontWeight: 300 }}>Save pieces you love and come back to them anytime.</p>
            <Link href="/buyer/homepage" className="btn-primary flex items-center gap-2 inline-flex">
              Discover Pieces <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }} className="md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                  style={{ background: "white", overflow: "hidden" }} className="group">
                  <div className="img-zoom relative" style={{ aspectRatio: "2/3", background: "#F5F3EF" }}>
                    <Link href={`/buyer/product/${item.product?.id}`}>
                      <Image src={item.product?.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80"}
                        alt={item.product?.name || ""} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                    </Link>
                    <button onClick={() => remove(item.id)}
                      style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s, color 0.2s", color: "#B0A89E" }}
                      className="group-hover:opacity-100"
                      onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#B0A89E")}>
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4, fontFamily: "var(--font-body)" }}>{item.product?.brand}</p>
                    <p style={{ fontSize: 13, fontWeight: 300, color: "var(--text)", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product?.name}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="font-display" style={{ fontSize: 15, color: "var(--text)" }}>
                        Rp {item.product?.price.toLocaleString("id-ID")}
                      </span>
                      <button onClick={() => moveToCart(item)}
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)", cursor: "pointer", background: "none", border: "none", fontFamily: "var(--font-body)", transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
                        <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} /> Add
                      </button>
                    </div>
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
