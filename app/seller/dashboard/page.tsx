"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ShoppingBag, TrendingUp, Eye, PlusSquare, ArrowRight, Clock, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Order, Product } from "@/types";

const ORDER_STATUS_LABELS: Record<string, string> = {
  order_received: "Order Received",
  being_prepared: "Being Prepared",
  packed: "Packed",
  sent: "Sent",
  on_the_way: "On the Way",
  delivered: "Delivered",
};

const statusColors: Record<string, string> = {
  order_received: "bg-stone-100 text-stone-600",
  being_prepared: "bg-warm-100 text-warm-600",
  packed: "bg-warm-100 text-warm-600",
  sent: "bg-sage-100 text-sage-600",
  on_the_way: "bg-sage-100 text-sage-600",
  delivered: "bg-sage-100 text-sage-600",
};

export default function SellerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, views: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profileData);

      const [{ count: productCount }, { data: orders }, { data: products }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact" }).eq("seller_id", user.id),
        supabase.from("orders").select("*, order_items(*, product:products(name, image_url, price)), buyer:profiles!buyer_id(full_name)")
          .eq("seller_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(4),
      ]);

      const revenue = (orders || []).reduce((sum, o) => sum + o.total_price, 0);
      setStats({ products: productCount || 0, orders: orders?.length || 0, revenue, views: 0 });
      setRecentOrders(orders || []);
      setRecentProducts(products || []);
      setLoading(false);
    };
    init();
  }, []);

  const statCards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "bg-stone-100 text-stone-600" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "bg-warm-100 text-warm-600" },
    { label: "Revenue (IDR)", value: `Rp ${stats.revenue.toLocaleString("id-ID")}`, icon: TrendingUp, color: "bg-sage-100 text-sage-600" },
    { 
      label: "AI Assistant", 
      value: "Ask Me", 
      icon: MessageCircle, 
      color: "bg-ivory-100 text-stone-600",
      onClick: () => window.dispatchEvent(new CustomEvent("open-chatbot"))
    },
  ];

  return (
    <div className="pt-14 lg:pt-0 min-h-screen bg-stone-50">
      <div className="p-6 lg:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between"
        >
          <div>
            <p className="text-stone-400 text-xs tracking-widest uppercase mb-1">Welcome back</p>
            <h1 className="font-display text-3xl text-stone-900 font-light">
              {profile?.full_name || "Seller"}
            </h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
              className="hidden sm:flex items-center gap-2 text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors border border-stone-200 px-4 py-2"
            >
              <MessageCircle className="w-4 h-4" />
              Assistant
            </button>
            <Link href="/seller/add-product" className="btn-primary flex items-center gap-2 text-xs">
              <PlusSquare className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map(({ label, value, icon: Icon, color, onClick }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={onClick}
              className={`bg-white border border-stone-100 p-6 shadow-elegant ${onClick ? "cursor-pointer hover:border-stone-300 transition-colors" : ""}`}
            >
              <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-display text-2xl text-stone-900">{loading ? "—" : value}</div>
              <div className="text-xs tracking-widest uppercase text-stone-400 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium tracking-widest uppercase text-stone-600">Recent Orders</h2>
              <Link href="/seller/orders" className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="bg-white border border-stone-100 p-8 text-center">
                <ShoppingBag className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                <p className="text-stone-400 text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-100 overflow-hidden divide-y divide-stone-100">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-4 h-4 text-stone-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800">
                        {(order as any).buyer?.full_name || "Buyer"}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-stone-800">Rp {order.total_price.toLocaleString("id-ID")}</p>
                      <span className={`status-badge text-[10px] mt-1 ${statusColors[order.status] || "bg-stone-100 text-stone-600"}`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Products */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium tracking-widest uppercase text-stone-600">My Products</h2>
              <Link href="/seller/manage-products" className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded" />)}
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="bg-white border border-stone-100 p-8 text-center">
                <Package className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                <p className="text-stone-400 text-sm mb-4">No products listed</p>
                <Link href="/seller/add-product" className="text-xs text-stone-600 underline underline-offset-2">
                  Add your first product
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-stone-100 overflow-hidden divide-y divide-stone-100">
                {recentProducts.map((product) => (
                  <div key={product.id} className="p-3 flex items-center gap-3 hover:bg-stone-50 transition-colors">
                    <div className="w-12 h-14 relative flex-shrink-0 bg-stone-100 overflow-hidden">
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&q=60"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">Rp {product.price.toLocaleString("id-ID")}</p>
                      <p className="text-[11px] text-stone-300 mt-0.5">Stock: {product.stock}</p>
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
