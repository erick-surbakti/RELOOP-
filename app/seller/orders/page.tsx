"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "@/types";

const ORDER_STATUSES: { key: OrderStatus; label: string }[] = [
  { key: "order_received", label: "Order Received" },
  { key: "being_prepared", label: "Being Prepared" },
  { key: "packed", label: "Packed" },
  { key: "sent", label: "Sent" },
  { key: "on_the_way", label: "On the Way" },
  { key: "delivered", label: "Delivered" },
];

const statusColors: Record<string, string> = {
  order_received: "bg-stone-100 text-stone-600",
  being_prepared: "bg-warm-100 text-warm-600",
  packed: "bg-warm-100 text-warm-600",
  sent: "bg-sage-100 text-sage-600",
  on_the_way: "bg-sage-100 text-sage-600",
  delivered: "bg-sage-100 text-sage-600",
};

function OrderRow({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (id: string, status: OrderStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const currentIdx = ORDER_STATUSES.findIndex((s) => s.key === order.status);
  const nextStatus = ORDER_STATUSES[currentIdx + 1];

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders")
      .update({ status: nextStatus.key, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    if (error) { toast.error("Update failed"); }
    else {
      onStatusUpdate(order.id, nextStatus.key);
      toast.success(`Status updated to "${nextStatus.label}"`);
    }
    setUpdating(false);
  };

  return (
    <motion.div layout className="bg-white border border-stone-100 overflow-hidden">
      {/* Header */}
      <div
        className="p-5 flex items-center gap-4 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-stone-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800">
            {(order as any).buyer?.full_name || "Buyer"}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString("id-ID")}
          </p>
        </div>
        <div className="text-right mr-2">
          <p className="text-sm font-medium text-stone-900">Rp {order.total_price.toLocaleString("id-ID")}</p>
          <span className={`status-badge text-[10px] mt-1 ${statusColors[order.status]}`}>
            {ORDER_STATUSES.find((s) => s.key === order.status)?.label || order.status}
          </span>
        </div>
        <div className="text-stone-400 flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 p-5 space-y-5">
              {/* Tracking steps */}
              <div>
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Order Progress</p>
                <div className="space-y-2">
                  {ORDER_STATUSES.map((s, i) => {
                    const done = i <= currentIdx;
                    return (
                      <div key={s.key} className={`flex items-center gap-3 py-2 px-3 ${done ? "bg-stone-50" : ""}`}>
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                          i < currentIdx ? "bg-stone-800" : i === currentIdx ? "border-2 border-stone-800 bg-white" : "border border-stone-200 bg-white"
                        }`}>
                          {i < currentIdx && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {i === currentIdx && <div className="w-2 h-2 rounded-full bg-stone-800" />}
                        </div>
                        <span className={`text-sm ${done ? "text-stone-800 font-medium" : "text-stone-400"}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              {order.order_items && order.order_items.length > 0 && (
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Items</p>
                  <div className="space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="w-12 h-14 relative bg-stone-100 overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product?.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&q=60"}
                            alt={item.product?.name || ""}
                            fill className="object-cover" sizes="48px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.product?.name}</p>
                          <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm text-stone-700">Rp {item.price_at_purchase.toLocaleString("id-ID")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping info */}
              <div className="bg-stone-50 p-4">
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">Ship To</p>
                <p className="text-sm text-stone-700">{(order as any).buyer?.full_name}</p>
                <p className="text-sm text-stone-600">{order.shipping_address}</p>
                <p className="text-sm text-stone-600">{order.shipping_city}</p>
              </div>

              {/* Advance Status */}
              {nextStatus && (
                <button
                  onClick={handleAdvance}
                  disabled={updating}
                  className="btn-primary flex items-center gap-2 text-xs"
                >
                  {updating ? (
                    <span className="w-3.5 h-3.5 border-2 border-ivory-300/40 border-t-ivory-300 rounded-full animate-spin" />
                  ) : (
                    <>
                      <ChevronRight className="w-3.5 h-3.5" />
                      Mark as "{nextStatus.label}"
                    </>
                  )}
                </button>
              )}
              {!nextStatus && (
                <div className="flex items-center gap-2 text-sage-500 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Order completed
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(*)), buyer:profiles!buyer_id(full_name, phone)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="pt-14 lg:pt-0 min-h-screen bg-stone-50">
      <div className="p-6 lg:p-10">
        <div className="mb-10">
          <p className="text-stone-400 text-xs tracking-widest uppercase mb-1">Seller Studio</p>
          <h1 className="font-display text-3xl text-stone-900 font-light">Incoming Orders</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-20 rounded" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="w-12 h-12 text-stone-200 mb-4" />
            <h3 className="font-display text-2xl text-stone-600 font-light mb-2">No orders yet</h3>
            <p className="text-stone-400 text-sm">Orders from buyers will appear here.</p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
