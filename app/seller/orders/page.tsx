"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronDown, ChevronUp, ChevronRight, Truck, Hash, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "@/types";

const ORDER_STATUSES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "order_received", label: "Order Received", desc: "New order has arrived" },
  { key: "being_prepared", label: "Being Prepared", desc: "Seller is preparing the items" },
  { key: "packed", label: "Packed", desc: "Items are packed and ready for pickup" },
  { key: "sent", label: "Sent", desc: "Order handed over to courier" },
  { key: "on_the_way", label: "On the Way", desc: "Package is en route to buyer" },
  { key: "delivered", label: "Delivered", desc: "Buyer has received the package" },
];

const statusColors: Record<string, string> = {
  order_received: "bg-stone-100 text-stone-600",
  being_prepared: "bg-warm-100 text-warm-600",
  packed: "bg-warm-100 text-warm-600",
  sent: "bg-sage-100 text-sage-600",
  on_the_way: "bg-sage-100 text-sage-600",
  delivered: "bg-sage-100 text-sage-600",
};

function OrderRow({ order, onUpdate }: { order: Order; onUpdate: (id: string, updates: Partial<Order>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [trackingNo, setTrackingNo] = useState(order.tracking_number || "");

  const currentIdx = ORDER_STATUSES.findIndex((s) => s.key === order.status);

  const updateOrder = async (updates: Partial<Order>) => {
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    
    if (error) {
      toast.error("Update failed");
    } else {
      onUpdate(order.id, updates);
      toast.success("Order status updated");
    }
    setUpdating(false);
  };

  const handleStatusClick = (statusKey: OrderStatus) => {
    if (statusKey === order.status || updating) return;
    updateOrder({ status: statusKey });
  };

  const saveTracking = () => {
    if (!trackingNo.trim()) return;
    updateOrder({ tracking_number: trackingNo.trim() });
  };

  return (
    <motion.div layout className="bg-white border border-stone-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div
        className="p-5 flex items-center gap-4 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center flex-shrink-0 border border-stone-100">
          <ShoppingBag className="w-6 h-6 text-stone-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-stone-800 uppercase tracking-tight">
              {(order as any).buyer?.full_name || "Buyer"}
            </p>
            <span className="text-[10px] text-stone-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Placed {new Date(order.created_at).toLocaleDateString("id-ID")} · {order.order_items?.length} Items
          </p>
        </div>
        <div className="text-right mr-4">
          <p className="text-sm font-bold text-stone-900">Rp {order.total_price.toLocaleString("id-ID")}</p>
          <div className="flex items-center justify-end gap-1.5 mt-1">
             <div className={`w-1.5 h-1.5 rounded-full ${statusColors[order.status]?.replace('bg-', 'bg-').split(' ')[0]}`} />
             <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                {ORDER_STATUSES.find((s) => s.key === order.status)?.label || order.status}
             </span>
          </div>
        </div>
        <div className="text-stone-300">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Staging Area */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden bg-stone-50/30"
          >
            <div className="border-t border-stone-100 p-6 space-y-8">
              
              {/* Order Staging Pipeline */}
              <div className="relative">
                <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-stone-400 mb-6 flex items-center gap-2">
                  <Navigation className="w-3 h-3" /> Order Staging Pipeline
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {ORDER_STATUSES.map((s, i) => {
                    const isActive = i === currentIdx;
                    const isDone = i < currentIdx;
                    return (
                      <button
                        key={s.key}
                        onClick={() => handleStatusClick(s.key)}
                        disabled={updating}
                        className={`relative p-3 border transition-all text-left flex flex-col justify-between h-24 ${
                          isActive 
                          ? "bg-white border-stone-800 ring-1 ring-stone-800 shadow-md z-10" 
                          : isDone
                          ? "bg-stone-100 border-stone-200 opacity-60"
                          : "bg-white border-stone-100 hover:border-stone-400"
                        }`}
                      >
                        <div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-2 ${
                            isDone ? "bg-stone-800 text-white" : isActive ? "bg-stone-800 text-white" : "border border-stone-200 text-stone-300"
                          }`}>
                            {isDone ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                          </div>
                          <p className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${isActive ? "text-stone-900" : "text-stone-500"}`}>
                            {s.label}
                          </p>
                        </div>
                        {isActive && (
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipping & Expedition */}
                <div className="bg-white border border-stone-100 p-5 shadow-sm">
                  <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-stone-400 mb-4 flex items-center gap-2">
                    <Truck className="w-3 h-3" /> Logistics Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">Expedition</p>
                        <p className="text-sm font-bold text-stone-800 uppercase">{order.expedition || 'Not specified'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">Payment</p>
                        <p className="text-sm font-bold text-stone-800 uppercase">{order.payment_method}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-2">Tracking Number</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400" />
                          <input 
                            type="text" 
                            placeholder="Enter AWB / Tracking #" 
                            value={trackingNo}
                            onChange={(e) => setTrackingNo(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 px-8 py-2 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                          />
                        </div>
                        <button 
                          onClick={saveTracking}
                          disabled={updating || trackingNo === order.tracking_number}
                          className="bg-stone-800 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-stone-900 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">Ship To Address</p>
                      <p className="text-sm text-stone-700 leading-relaxed">
                        <span className="font-bold text-stone-800">{(order as any).buyer?.full_name}</span><br />
                        {order.shipping_address}, {order.shipping_city}<br />
                        <span className="text-stone-400 text-xs">{(order as any).buyer?.phone || ''}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-white border border-stone-100 p-5 shadow-sm flex flex-col">
                  <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-stone-400 mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-3 h-3" /> Manifest
                  </h3>
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-48 pr-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center border-b border-stone-50 pb-2 last:border-0">
                        <div className="w-10 h-12 relative bg-stone-100 flex-shrink-0">
                          <Image src={item.product?.image_url || ""} alt="" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">{item.product?.name}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-tighter">
                            Size: {item.product?.size} · Qty: {item.quantity} · Rp {item.price_at_purchase.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Total Payout</span>
                    <span className="text-lg font-bold text-stone-900">Rp {order.total_price.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => window.open(`https://wa.me/${(order as any).buyer?.phone?.replace(/\D/g, '')}`, '_blank')}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-stone-200 text-stone-600 hover:border-stone-800 hover:text-stone-900 transition-all"
                >
                  Contact Buyer
                </button>
                {currentIdx < ORDER_STATUSES.length - 1 && (
                  <button 
                    onClick={() => handleStatusClick(ORDER_STATUSES[currentIdx + 1].key)}
                    disabled={updating}
                    className="bg-stone-900 text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg flex items-center gap-2"
                  >
                    Advance to "{ORDER_STATUSES[currentIdx + 1].label}"
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdate = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, ...updates } : o));
  };

  return (
    <div className="pt-14 lg:pt-0 min-h-screen bg-stone-50">
      <div className="p-6 lg:p-10">
        <div className="mb-10">
          <p className="text-stone-400 text-[10px] tracking-[0.3em] uppercase font-bold mb-1">Fulfillment Center</p>
          <h1 className="font-display text-4xl text-stone-900 font-light tracking-tight">Incoming Orders</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-24 rounded shadow-sm" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-stone-100 rounded-lg shadow-sm">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-stone-200" />
            </div>
            <h3 className="font-display text-2xl text-stone-700 font-light mb-2">No active orders</h3>
            <p className="text-stone-400 text-sm tracking-widest uppercase">When buyers purchase your items, they'll appear here.</p>
          </div>
        ) : (
          <div className="max-w-4xl space-y-6">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Add Navigation icon from lucide-react if missing or use a placeholder
import { Navigation } from "lucide-react";
