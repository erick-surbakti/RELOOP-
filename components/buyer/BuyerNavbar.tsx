"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, X, Menu, LogOut, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function BuyerNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const isHome = pathname === "/buyer/homepage";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const s = createClient();
      const { data: { user } } = await s.auth.getUser();
      if (!user) return;
      const { data: cart } = await s.from("carts").select("id").eq("user_id", user.id).single();
      if (cart) {
        const { count } = await s.from("cart_items").select("*", { count: "exact" }).eq("cart_id", cart.id);
        setCartCount(count || 0);
      }
      const { count: wc } = await s.from("wishlists").select("*", { count: "exact" }).eq("user_id", user.id);
      setWishlistCount(wc || 0);
    };
    fetch();
    window.addEventListener("cartUpdated", fetch);
    window.addEventListener("wishlistUpdated", fetch);
    return () => { window.removeEventListener("cartUpdated", fetch); window.removeEventListener("wishlistUpdated", fetch); };
  }, [pathname]);

  const handleLogout = async () => {
    await createClient().auth.signOut();
    toast.success("Signed out");
    router.push("/auth/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buyer/homepage?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/buyer/homepage", label: "Shop" },
    { href: "/buyer/wishlist", label: "Wishlist" },
    { href: "/buyer/orders", label: "Orders" },
  ];

  const textColor = !scrolled && isHome ? "text-white/90" : "text-stone-700";
  const hoverColor = !scrolled && isHome ? "hover:text-white" : "hover:text-stone-950";

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${scrolled ? "glass" : "bg-transparent"}`}
      >
        <div className="section-container flex items-center justify-between h-16 lg:h-[72px]">

          {/* Logo */}
          <Link href="/buyer/homepage">
            <span className={`font-display text-[22px] tracking-[0.4em] uppercase transition-colors duration-500 ${!scrolled && isHome ? "text-white" : "text-stone-950"}`}>
              Reloop
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className={`text-[11px] tracking-[0.22em] uppercase transition-all duration-300 hover-underline ${
                  pathname === l.href
                    ? (!scrolled && isHome ? "text-white" : "text-stone-950")
                    : `${textColor} ${hoverColor}`
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center">
            {[
              { icon: Search, onClick: () => setSearchOpen(true), label: "Search" },
            ].map(({ icon: Icon, onClick, label }) => (
              <button key={label} onClick={onClick}
                className={`p-3 transition-colors duration-300 ${textColor} ${hoverColor}`}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
            ))}

            <Link href="/buyer/wishlist"
              className={`relative p-3 transition-colors duration-300 ${textColor} ${hoverColor}`}>
              <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-2.5 right-2 w-3.5 h-3.5 bg-stone-950 text-white text-[8px] flex items-center justify-center rounded-full font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/buyer/cart"
              className={`relative p-3 transition-colors duration-300 ${textColor} ${hoverColor}`}>
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-2.5 right-2 w-3.5 h-3.5 bg-stone-950 text-white text-[8px] flex items-center justify-center rounded-full font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/buyer/profile"
              className={`p-3 transition-colors duration-300 ${textColor} ${hoverColor}`}>
              <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>

            <button onClick={handleLogout}
              className={`hidden lg:flex p-3 transition-colors duration-300 ${!scrolled && isHome ? "text-white/50 hover:text-white" : "text-stone-400 hover:text-stone-700"}`}>
              <LogOut className="w-[16px] h-[16px]" strokeWidth={1.5} />
            </button>

            <button onClick={() => setMobileOpen(true)}
              className={`lg:hidden p-3 transition-colors duration-300 ${textColor}`}>
              <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center px-6"
            onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
          >
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl"
            >
              <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-6">Search</p>
              <form onSubmit={handleSearch} className="relative border-b border-white/20">
                <input autoFocus type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pieces, brands, categories..."
                  className="w-full bg-transparent text-white text-3xl font-display font-light pb-4 pr-12 outline-none placeholder:text-white/25"
                />
                <button type="submit"
                  className="absolute right-0 bottom-4 text-white/40 hover:text-white transition-colors">
                  <ArrowUpRight className="w-7 h-7" strokeWidth={1} />
                </button>
              </form>
              <button onClick={() => setSearchOpen(false)}
                className="mt-8 text-white/30 hover:text-white/70 text-[10px] tracking-[0.3em] uppercase transition-colors flex items-center gap-2">
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50"
              onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#F7F5F0] z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-7 py-6 border-b border-black/6">
                <span className="font-display text-lg tracking-[0.35em] uppercase text-stone-950">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="text-stone-400 hover:text-stone-800 transition-colors">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex flex-col p-7 gap-7 flex-1">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                    className="text-stone-600 text-sm tracking-[0.22em] uppercase hover:text-stone-950 transition-colors hover-underline">
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="p-7 border-t border-black/6">
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 text-stone-400 text-sm hover:text-stone-800 transition-colors tracking-wider">
                  <LogOut className="w-4 h-4" strokeWidth={1.5} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
