"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronDown, ChevronUp, Clock, MapPin, Navigation } from "lucide-react";
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

function MapTracker({ status }: { status: string }) {
  if (status !== "on_the_way" && status !== "sent" && status !== "delivered") return null;

  return (
    <div className="relative w-full h-48 bg-stone-100 overflow-hidden border border-stone-200 mt-4">
      {/* Fake Map Grid */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* Road */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2" />
      <div className="absolute top-1/2 left-0 right-0 h-1 border-t border-dashed border-stone-400 -translate-y-1/2" />

      {/* Destination */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center">
        <MapPin className="w-6 h-6 text-stone-800 fill-stone-800" />
        <span className="text-[9px] font-bold uppercase tracking-tighter mt-1">Home</span>
      </div>

      {/* Origin */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-40">
        <div className="w-3 h-3 rounded-full bg-stone-400" />
        <span className="text-[9px] font-bold uppercase tracking-tighter mt-1">Seller</span>
      </div>

      {/* Motorcycle Animation */}
      {status === "on_the_way" && (
        <motion.div
          animate={{ x: [0, 200, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute left-16 top-1/2 -translate-y-1/2 z-10"
        >
          <div className="relative">
            <Navigation className="w-5 h-5 text-warm-600 rotate-90 fill-warm-600" />
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -left-2 top-0 w-1 h-5 bg-warm-200 blur-sm" 
            />
          </div>
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-warm-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest shadow-lg">
            Courier
          </span>
        </motion.div>
      )}

      {status === "delivered" && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10">
           <Navigation className="w-5 h-5 text-sage-600 rotate-90 fill-sage-600" />
        </div>
      )}

      <div className="absolute bottom-3 left-4 bg-white/80 backdrop-blur-sm px-2 py-1 border border-stone-200">
        <p className="text-[10px] font-bold text-stone-800 tracking-widest uppercase">Live Tracking</p>
      </div>
    </div>
  );
}

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
      className="bg-white border border-stone-100 overflow-hidden shadow-sm"
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
            <p className="text-xs text-stone-400 tracking-wider mb-0.5 uppercase">
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
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 px-5 pb-5 pt-4 space-y-5">
              {/* Status Tracker */}
              <div>
                <h3 className="text-[10px] tracking-widest uppercase font-bold text-stone-400 mb-4">Order Progress</h3>
                <OrderTracker status={order.status} />
              </div>

              {/* Map Tracker */}
              <MapTracker status={order.status} />

              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-4 border border-stone-100">
                  <h3 className="text-[10px] tracking-widest uppercase font-bold text-stone-400 mb-2">Shipping Details</h3>
                  <p className="text-sm font-medium text-stone-800 uppercase">{order.expedition || 'Standard'} Express</p>
                  <p className="text-xs text-stone-500 mt-1">{order.shipping_address}</p>
                  <p className="text-xs text-stone-500">{order.shipping_city}</p>
                </div>
                <div className="bg-stone-50 p-4 border border-stone-100">
                  <h3 className="text-[10px] tracking-widest uppercase font-bold text-stone-400 mb-2">Payment Info</h3>
                  <p className="text-sm font-medium text-stone-800 uppercase">{order.payment_method}</p>
                  <p className="text-xs text-stone-500 mt-1">Transaction ID: {order.id.slice(-6).toUpperCase()}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                    <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider">Payment Verified</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-[10px] tracking-widest uppercase font-bold text-stone-400 mb-3">Purchased Items</h3>
                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-14 relative bg-stone-100 flex-shrink-0">
                        <Image src={item.product?.image_url || ""} alt="" fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.product?.name}</p>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">{item.product?.brand} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-display text-stone-900">Rp {item.price_at_purchase.toLocaleString("id-ID")}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>Placed {new Date(order.created_at).toLocaleDateString("id-ID")}</span>
                </div>
                {order.status === "on_the_way" && (
                  <button className="text-[10px] font-bold text-warm-600 uppercase tracking-widest border border-warm-200 px-3 py-1 hover:bg-warm-50 transition-colors">
                    Contact Courier
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

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchOrders();

    const supabase = createClient();
    const channel = supabase
      .channel("orders-realtime-buyer")
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
          <span className="text-xs tracking-widest uppercase text-stone-400 block mb-1">Account</span>
          <h1 className="font-display text-4xl text-stone-900 font-light">My Orders</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Package className="w-12 h-12 text-stone-200 mb-4" />
            <p className="text-stone-400 text-sm mb-8 tracking-widest uppercase">No orders found</p>
            <Link href="/buyer/homepage" className="btn-primary">Start Shopping</Link>
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
