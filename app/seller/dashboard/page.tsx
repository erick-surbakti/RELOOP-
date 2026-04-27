"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ShoppingBag, TrendingUp, Plus, ArrowRight, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Order, Product } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  order_received: "Order Received", being_prepared: "Being Prepared",
  packed: "Packed", sent: "Sent", on_the_way: "On the Way", delivered: "Delivered",
};
const STATUS_DOT: Record<string, string> = {
  order_received: "#9CA3AF", being_prepared: "#C4A882", packed: "#C4A882",
  sent: "#7A8C72", on_the_way: "#7A8C72", delivered: "#7A8C72",
};

export default function SellerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const s = createClient();
      const { data: { user } } = await s.auth.getUser();
      if (!user) return;
      const { data: p } = await s.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      const [{ count: pc }, { data: od }, { data: pr }] = await Promise.all([
        s.from("products").select("*", { count: "exact" }).eq("seller_id", user.id),
        s.from("orders").select("*, order_items(*, product:products(name,image_url)), buyer:profiles!buyer_id(full_name)")
          .eq("seller_id", user.id).order("created_at", { ascending: false }).limit(6),
        s.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(4),
      ]);
      const revenue = (od || []).reduce((sum: number, o: any) => sum + o.total_price, 0);
      setStats({ products: pc || 0, orders: od?.length || 0, revenue });
      setOrders(od || []);
      setProducts(pr || []);
      setLoading(false);
    };
    init();
  }, []);

  return (
    <div className="pt-14 lg:pt-0" style={{ minHeight: "100vh", background: "#F5F3EF" }}>
      <div style={{ padding: "40px 32px", maxWidth: 1200 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#9A9590", marginBottom: 6, fontFamily: "var(--font-body)" }}>
              Good day,
            </p>
            <h1 className="font-display font-light" style={{ fontSize: "2.5rem", color: "#171412", lineHeight: 1.1 }}>
              {loading ? "—" : profile?.full_name || "Seller"}
            </h1>
          </div>
          <Link href="/seller/add-product" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            New Product
          </Link>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 48 }}>
          {[
            { label: "Total Products", value: stats.products, icon: Package, accent: "#C4A882" },
            { label: "Total Orders",   value: stats.orders,   icon: ShoppingBag, accent: "#7A8C72" },
            { label: "Revenue",        value: `Rp ${stats.revenue.toLocaleString("id-ID")}`, icon: TrendingUp, accent: "#C4A882", small: true },
          ].map(({ label, value, icon: Icon, accent, small }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: "white", padding: "28px 24px", borderBottom: `2px solid ${accent}` }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: accent }} />
              </div>
              <div className={`font-display font-light`} style={{ fontSize: small ? "1.5rem" : "2.25rem", color: "#171412", lineHeight: 1, marginBottom: 6 }}>
                {loading ? "—" : value}
              </div>
              <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590", fontFamily: "var(--font-body)" }}>
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* Recent Orders */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#9A9590", fontFamily: "var(--font-body)" }}>
                Recent Orders
              </h2>
              <Link href="/seller/orders" className="flex items-center gap-1.5 hover-underline"
                style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A9590" }}>
                View all <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
              </Link>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 68 }} />)}
              </div>
            ) : orders.length === 0 ? (
              <div style={{ background: "white", padding: "48px 24px", textAlign: "center" }}>
                <ShoppingBag className="w-8 h-8 mx-auto mb-3" strokeWidth={1} style={{ color: "#D4CFC8" }} />
                <p style={{ color: "#B0A89E", fontSize: 13, fontWeight: 300 }}>No orders yet</p>
              </div>
            ) : (
              <div style={{ background: "white", overflow: "hidden" }}>
                {orders.map((order, i) => (
                  <div key={order.id} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: i < orders.length - 1 ? "1px solid #F0EDE6" : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F5F3EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ShoppingBag className="w-4 h-4" strokeWidth={1.5} style={{ color: "#B0A89E" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 400, color: "#171412", marginBottom: 3 }}>
                        {(order as any).buyer?.full_name || "Buyer"}
                      </p>
                      <p style={{ fontSize: 11, color: "#B0A89E", fontWeight: 300 }}>
                        #{order.id.slice(0,8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 13, fontWeight: 400, color: "#171412", marginBottom: 5 }}>
                        Rp {order.total_price.toLocaleString("id-ID")}
                      </p>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_DOT[order.status] || "#9CA3AF" }} />
                        <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B0A89E", fontFamily: "var(--font-body)" }}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Products */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#9A9590", fontFamily: "var(--font-body)" }}>
                My Products
              </h2>
              <Link href="/seller/manage-products" className="flex items-center gap-1.5 hover-underline"
                style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9A9590" }}>
                All <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
              </Link>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72 }} />)}
              </div>
            ) : products.length === 0 ? (
              <div style={{ background: "white", padding: "40px 20px", textAlign: "center" }}>
                <Package className="w-7 h-7 mx-auto mb-3" strokeWidth={1} style={{ color: "#D4CFC8" }} />
                <p style={{ color: "#B0A89E", fontSize: 12, fontWeight: 300, marginBottom: 16 }}>No products yet</p>
                <Link href="/seller/add-product" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#171412", textDecoration: "underline", textUnderlineOffset: 3, fontFamily: "var(--font-body)" }}>
                  Add first product
                </Link>
              </div>
            ) : (
              <div style={{ background: "white", overflow: "hidden" }}>
                {products.map((product, i) => (
                  <div key={product.id} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < products.length - 1 ? "1px solid #F0EDE6" : "none" }}>
                    <div style={{ width: 44, height: 52, flexShrink: 0, overflow: "hidden", background: "#F5F3EF" }}>
                      <img src={product.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&q=60"}
                        alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 400, color: "#171412", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: 11, color: "#B0A89E", fontWeight: 300 }}>
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                      <p style={{ fontSize: 10, color: "#C8C3BB", marginTop: 2 }}>Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
