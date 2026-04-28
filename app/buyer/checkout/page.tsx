"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CreditCard, CheckCircle, AlertCircle, ChevronRight, Truck, QrCode, CreditCard as CardIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Profile, CartItem } from "@/types";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: Truck, desc: "Pay when your order arrives" },
  { id: "qris", label: "QRIS", icon: QrCode, desc: "Scan to pay instantly" },
  { id: "mastercard", label: "Mastercard", icon: CardIcon, desc: "Pay with your credit card" },
];

const EXPEDITIONS = [
  { id: "jne", label: "JNE Express", price: 15000, eta: "2-3 days" },
  { id: "jnt", label: "J&T Express", price: 12000, eta: "2-4 days" },
  { id: "dhl", label: "DHL Global", price: 45000, eta: "1-2 days" },
  { id: "sicepat", label: "SiCepat", price: 14000, eta: "2-3 days" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [selectedExpedition, setSelectedExpedition] = useState("jne");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profileData);

      const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
      if (cart) {
        setCartId(cart.id);
        const { data: cartItems } = await supabase
          .from("cart_items")
          .select("*, product:products(*, seller:profiles!seller_id(id, full_name))")
          .eq("cart_id", cart.id);
        setItems(cartItems || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shippingPrice = EXPEDITIONS.find(e => e.id === selectedExpedition)?.price || 0;
  const total = subtotal + shippingPrice;

  const groupBySeller = () => {
    const groups: Record<string, CartItem[]> = {};
    items.forEach((item) => {
      const sellerId = item.product?.seller_id || "unknown";
      if (!groups[sellerId]) groups[sellerId] = [];
      groups[sellerId].push(item);
    });
    return groups;
  };

  const placeOrder = async () => {
    if (!profile?.address || !profile?.city) {
      toast.error("Please complete your profile address first");
      router.push("/buyer/profile");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (selectedPayment === "qris" && !showQR) {
      setShowQR(true);
      toast.success("QRIS Generated! Click Confirm again to complete.");
      return;
    }

    setPlacing(true);
    const supabase = createClient();
    const groups = groupBySeller();

    try {
      console.log("Placing order with data:", { 
        buyer_id: profile.id, 
        payment_method: selectedPayment, 
        expedition: selectedExpedition 
      });

      for (const [sellerId, sellerItems] of Object.entries(groups)) {
        const orderTotal = sellerItems.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) + shippingPrice;
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            buyer_id: profile.id,
            seller_id: sellerId,
            status: "order_received",
            total_price: orderTotal,
            shipping_address: profile.address,
            shipping_city: profile.city,
            payment_method: selectedPayment,
            expedition: selectedExpedition,
          })
          .select("id")
          .single();

        if (orderError) {
          console.error("Supabase Order Error:", orderError);
          throw orderError;
        }

        await supabase.from("order_items").insert(
          sellerItems.map((i) => ({
            order_id: order.id,
            product_id: i.product_id,
            quantity: i.quantity,
            price_at_purchase: i.product?.price || 0,
          }))
        );

        // Update stock
        for (const item of sellerItems) {
          if (item.product) {
            await supabase.from("products")
              .update({ stock: Math.max(0, item.product.stock - item.quantity) })
              .eq("id", item.product.id);
          }
        }
      }

      if (cartId) {
        await supabase.from("cart_items").delete().eq("cart_id", cartId);
      }

      window.dispatchEvent(new Event("cartUpdated"));
      setOrderSuccess(true);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
    setPlacing(false);
  };

  if (orderSuccess) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-ivory-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-4"
        >
          <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-sage-500" />
          </div>
          <h2 className="font-display text-4xl text-stone-900 font-light mb-3">Order Placed!</h2>
          <p className="text-stone-500 text-sm mb-8">Your order has been received via {PAYMENT_METHODS.find(p=>p.id===selectedPayment)?.label}. Tracking will be available once the seller sends the package via {EXPEDITIONS.find(e=>e.id===selectedExpedition)?.label}.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/buyer/orders")} className="btn-primary w-full">
              Track My Order
            </button>
            <button onClick={() => router.push("/buyer/homepage")} className="btn-secondary w-full">
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen section-container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1,2].map((i) => <div key={i} className="skeleton h-32 rounded" />)}
          </div>
          <div className="skeleton h-64 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-ivory-50">
      <div className="section-container py-12">
        <div className="mb-10">
          <span className="text-xs tracking-widest uppercase text-stone-400 block mb-1">Secure</span>
          <h1 className="font-display text-4xl text-stone-900 font-light">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white border border-stone-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <h2 className="text-sm tracking-widest uppercase text-stone-600 font-medium">Shipping Address</h2>
                </div>
                <button onClick={() => router.push("/buyer/profile")} className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1 transition-colors">
                  Edit <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {profile?.address ? (
                <div>
                  <p className="font-medium text-stone-800">{profile.full_name}</p>
                  <p className="text-stone-600 text-sm mt-1">{profile.address}, {profile.city}</p>
                </div>
              ) : (
                <div className="p-4 bg-warm-50 border border-warm-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-warm-500" />
                  <p className="text-sm text-warm-700">Please add your address in profile.</p>
                </div>
              )}
            </div>

            {/* Expedition Choice */}
            <div className="bg-white border border-stone-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-stone-400" />
                <h2 className="text-sm tracking-widest uppercase text-stone-600 font-medium">Shipping Expedition</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {EXPEDITIONS.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedExpedition(exp.id)}
                    className={`p-4 border text-left transition-all ${
                      selectedExpedition === exp.id 
                      ? "border-stone-900 bg-stone-50 ring-1 ring-stone-900" 
                      : "border-stone-100 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-stone-800">{exp.label}</span>
                      <span className="text-sm font-display text-stone-900">Rp {exp.price.toLocaleString("id-ID")}</span>
                    </div>
                    <p className="text-xs text-stone-400">Estimated: {exp.eta}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-stone-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-stone-400" />
                <h2 className="text-sm tracking-widest uppercase text-stone-600 font-medium">Payment Method</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedPayment(method.id);
                        setShowQR(false);
                      }}
                      className={`p-4 border text-left transition-all flex flex-col gap-2 ${
                        selectedPayment === method.id 
                        ? "border-stone-900 bg-stone-50 ring-1 ring-stone-900" 
                        : "border-stone-100 hover:border-stone-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selectedPayment === method.id ? "text-stone-900" : "text-stone-400"}`} />
                      <div>
                        <p className="text-sm font-medium text-stone-800">{method.label}</p>
                        <p className="text-[10px] text-stone-400 leading-tight mt-0.5">{method.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedPayment === "qris" && showQR && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 p-6 border-2 border-dashed border-stone-200 bg-white flex flex-col items-center"
                  >
                    <p className="text-xs tracking-widest uppercase text-stone-400 mb-4">Scan QRIS to Pay</p>
                    <div className="w-48 h-48 bg-stone-100 relative flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-stone-800" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/5 to-transparent pointer-events-none" />
                    </div>
                    <p className="text-sm font-medium text-stone-900 mt-4">Rp {total.toLocaleString("id-ID")}</p>
                    <p className="text-[10px] text-stone-400 mt-1">Payment will be verified automatically</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-stone-100 p-6 shadow-sm">
              <h2 className="text-sm tracking-widest uppercase text-stone-600 font-medium mb-4">Your Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 relative flex-shrink-0 bg-stone-100">
                      <Image src={item.product?.image_url || ""} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-800">{item.product?.name}</p>
                      <p className="text-xs text-stone-400 mt-1">Qty: {item.quantity} · Size: {item.product?.size}</p>
                    </div>
                    <div className="font-display text-stone-900">
                      Rp {((item.product?.price || 0) * item.quantity).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-100 p-6 sticky top-28 shadow-sm">
              <h2 className="font-display text-xl text-stone-900 font-light mb-6">Order Total</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Shipping ({EXPEDITIONS.find(e=>e.id===selectedExpedition)?.label})</span>
                  <span>Rp {shippingPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between">
                  <span className="text-sm tracking-wider uppercase font-medium text-stone-800">Total</span>
                  <span className="font-display text-xl text-stone-900">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing || !profile?.address}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {placing ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (selectedPayment === "qris" && !showQR ? "Generate QRIS" : "Confirm Order")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
