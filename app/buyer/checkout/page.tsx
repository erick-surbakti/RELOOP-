"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, CreditCard, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Profile, CartItem } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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
  const shipping = 15000;
  const total = subtotal + shipping;

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

    setPlacing(true);
    const supabase = createClient();
    const groups = groupBySeller();

    try {
      for (const [sellerId, sellerItems] of Object.entries(groups)) {
        const orderTotal = sellerItems.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) + shipping;
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            buyer_id: profile.id,
            seller_id: sellerId,
            status: "order_received",
            total_price: orderTotal,
            shipping_address: profile.address,
            shipping_city: profile.city,
            payment_method: "cod",
          })
          .select("id")
          .single();

        if (orderError || !order) throw orderError;

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

      // Clear cart
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
          <p className="text-stone-500 text-sm mb-8">Your order has been received. The seller will prepare your items shortly.</p>
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
          {/* Left — Address + Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <h2 className="text-sm tracking-widest uppercase text-stone-600 font-medium">Shipping Address</h2>
                </div>
                <button onClick={() => router.push("/buyer/profile")} className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1 transition-colors">
                  Edit <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {profile?.address && profile?.city ? (
                <div>
                  <p className="font-medium text-stone-800">{profile.full_name}</p>
                  {profile.phone && <p className="text-stone-500 text-sm mt-1">{profile.phone}</p>}
                  <p className="text-stone-600 text-sm mt-1">{profile.address}</p>
                  <p className="text-stone-600 text-sm">{profile.city}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-warm-50 border border-warm-200">
                  <AlertCircle className="w-5 h-5 text-warm-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-warm-700 font-medium">Address required</p>
                    <p className="text-xs text-warm-500 mt-0.5">Please complete your profile before checkout.</p>
                  </div>
                  <button onClick={() => router.push("/buyer/profile")} className="ml-auto text-xs text-warm-700 underline underline-offset-2">
                    Add Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-stone-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-stone-400" />
                <h2 className="text-sm tracking-widest uppercase text-stone-600 font-medium">Payment Method</h2>
              </div>
              <div className="flex items-center gap-3 border border-stone-800 p-4 bg-stone-50">
                <div className="w-4 h-4 rounded-full border-2 border-stone-800 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-stone-800" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">Cash on Delivery (COD)</p>
                  <p className="text-xs text-stone-400 mt-0.5">Pay when your order arrives</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-stone-100 p-6">
              <h2 className="text-sm tracking-widest uppercase text-stone-600 font-medium mb-4">Your Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 relative flex-shrink-0 bg-stone-100 overflow-hidden">
                      <Image
                        src={item.product?.image_url || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&q=80"}
                        alt={item.product?.name || ""}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] text-stone-400 tracking-widest uppercase">{item.product?.brand}</p>
                      <p className="text-sm font-medium text-stone-800 mt-0.5 line-clamp-2">{item.product?.name}</p>
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

          {/* Right — Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-100 p-6 sticky top-28">
              <h2 className="font-display text-xl text-stone-900 font-light mb-6">Order Total</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Shipping (COD)</span>
                  <span>Rp {shipping.toLocaleString("id-ID")}</span>
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
                  <span className="w-4 h-4 border-2 border-ivory-300/40 border-t-ivory-300 rounded-full animate-spin" />
                ) : "Confirm Order"}
              </button>

              {!profile?.address && (
                <p className="text-xs text-stone-400 text-center mt-3">
                  Complete your profile address to proceed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
