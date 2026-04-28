"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, X, Menu, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function BuyerNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (cart) {
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact" })
          .eq("cart_id", cart.id);
        setCartCount(count || 0);
      }

      const { count: wCount } = await supabase
        .from("wishlists")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);
      setWishlistCount(wCount || 0);
    };

    fetchCounts();

    // Listen for custom events to update counts
    const handler = () => fetchCounts();
    window.addEventListener("cartUpdated", handler);
    window.addEventListener("wishlistUpdated", handler);
    return () => {
      window.removeEventListener("cartUpdated", handler);
      window.removeEventListener("wishlistUpdated", handler);
    };
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/auth/login");
  };

  const navLinks = [
    { href: "/buyer/homepage", label: "Shop" },
    { href: "/buyer/wishlist", label: "Wishlist" },
    { href: "/buyer/orders", label: "My Orders" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass border-b border-stone-200/60 shadow-elegant" : "bg-transparent"
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/buyer/homepage">
              <span className="font-display text-xl tracking-[0.3em] text-stone-900 uppercase hover:text-stone-700 transition-colors">
                Reloop
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs tracking-widest uppercase transition-colors duration-300 ${
                    pathname === link.href
                      ? "text-stone-900 font-medium"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1 lg:gap-2">
              <Link
                href="/buyer/wishlist"
                className="relative p-2.5 text-stone-600 hover:text-stone-900 transition-colors group"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-warm-500 text-white text-[10px] flex items-center justify-center rounded-full font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/buyer/cart"
                className="relative p-2.5 text-stone-600 hover:text-stone-900 transition-colors group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-stone-800 text-white text-[10px] flex items-center justify-center rounded-full font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/profile"
                className="p-2.5 text-stone-600 hover:text-stone-900 transition-colors group"
              >
                <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>

              <button
                onClick={handleLogout}
                className="hidden lg:flex p-2.5 text-stone-400 hover:text-stone-900 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2.5 text-stone-600"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/40 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-ivory-50 z-50 flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="font-display text-xl tracking-[0.3em] text-stone-900 uppercase">Reloop</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5 text-stone-600" />
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-stone-700 text-sm tracking-widest uppercase hover:text-stone-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto border-t border-stone-200 pt-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-stone-500 text-sm hover:text-stone-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
