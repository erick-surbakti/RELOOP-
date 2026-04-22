"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";
import Footer from "@/components/shared/Footer";
import Link from "next/link";

const ORDER_STATUSES = [
  { key: "order_received", label: "Order Received", desc: "We've received your order" },
  { key: "being_prepared", label: "Being Prepared", desc: "Seller is preparing your items" },
  { key: "packed", label: "Packed", desc: "Your order has been packed" },
  { key: "sent", label: "Sent", desc: "Order handed to courier" },
  { key: "on_the_way", label: "On the Way", desc: "Your package is en route" },
  { key: "delivered", label: "Delivered", desc: "Order successfully delivered" },
];

const STATUS_INDEX: Record<string, number> = Object.fromEntries(
  ORDER_STATUSES.map((s, i) => [s.key, i])
);

const statusColors: Record<string, string> = {
  order_received: "bg-stone-100 text-stone-600",
  being_prepared: "bg-warm-100 text-warm-600",
  packed: "bg-warm-100 text-warm-600",
  sent: "bg-sage-100 text-sage-600",
  on_the_way: "bg-sage-100 text-sage-600",
  delivered: "bg-sage-100 text-sage-600",
};

function OrderTracker({ status }: { status: string }) {
  const currentIdx = STATUS_INDEX[status] ?? 0;
  return (
    <div className="py-4">
      <div className="relative">
        {/* Line */}
        <div className="absolute top-3.5 left-0 right-0 h-px bg-stone-200" />
        <div
          className="absolute top-3.5 left-0 h-px bg-stone-800 transition-all duration-700"
          style={{ width: `${(currentIdx / (ORDER_STATUSES.length - 1)) * 100}%` }}
        />
        {/* Dots */}
        <div className="relative flex justify-between">
          {ORDER_STATUSES.map((s, i) => (
            <div key={s.key} className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                i <= currentIdx
                  ? "bg-stone-900 border-stone-900"
                  : "bg-white border-stone-200"
              }`}>
                {i < currentIdx && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {i === currentIdx && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
              <span className={`text-[10px] mt-2 text-center leading-tight max-w-[60px] ${
                i <= currentIdx ? "text-stone-700 font-medium" : "text-stone-400"
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="bg-white border border-stone-100 overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-stone-500" />
          </div>
          <div>
            <p className="text-xs text-stone-400 tracking-wider mb-0.5">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="font-display text-lg text-stone-900">
              Rp {order.total_price.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`status-badge text-[10px] ${statusColors[order.status] || "bg-stone-100 text-stone-600"}`}>
            {ORDER_STATUSES.find((s) => s.key === order.status)?.label || order.status}
          </span>
          <div className="text-stone-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 px-5 pb-5 pt-4 space-y-5">
              {/* Tracking */}
              <div>
                <h3 className="text-xs tracking-widest uppercase text-stone-400 mb-4">Order Tracking</h3>
                <OrderTracker status={order.status} />
              </div>

              {/* Items */}
              {order.order_items && order.order_items.length > 0 && (
                <div>
                  <h3 className="text-xs tracking-widest uppercase text-stone-400 mb-3">Items</h3>
                  <div className="space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="w-14 h-16 relative bg-stone-100 overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product?.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&q=60"}
                            alt={item.product?.name || ""}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.product?.name}</p>
                          <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity} · Size: {item.product?.size}</p>
                          <p className="text-sm text-stone-700 mt-1">Rp {item.price_at_purchase.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping info */}
              <div className="bg-stone-50 p-4">
                <h3 className="text-xs tracking-widest uppercase text-stone-400 mb-2">Shipping To</h3>
                <p className="text-sm text-stone-700">{order.shipping_address}</p>
                <p className="text-sm text-stone-700">{order.shipping_city}</p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-stone-400 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Ordered {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(*))")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();

    // Real-time updates
    const supabase = createClient();
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-ivory-50">
      <div className="section-container py-12">
        <div className="mb-10">
          <span className="text-xs tracking-widest uppercase text-stone-400 block mb-1">My</span>
          <h1 className="font-display text-4xl text-stone-900 font-light">Orders</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-5">
              <Package className="w-7 h-7 text-stone-300" />
            </div>
            <h3 className="font-display text-2xl text-stone-700 font-light mb-2">No orders yet</h3>
            <p className="text-stone-400 text-sm mb-8">Start shopping to see your orders here.</p>
            <Link href="/buyer/homepage" className="btn-primary">Browse Collection</Link>
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
