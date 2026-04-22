"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, PlusSquare, Package, ShoppingBag,
  LogOut, Menu, X, Truck, User
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const navItems = [
  { href: "/seller/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/seller/add-product", icon: PlusSquare, label: "Add Product" },
  { href: "/seller/manage-products", icon: Package, label: "My Products" },
  { href: "/seller/orders", icon: ShoppingBag, label: "Orders" },
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/auth/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-stone-800">
        <span className="font-display text-xl tracking-[0.3em] text-ivory-100 uppercase">Reloop</span>
        <div className="mt-1 text-xs tracking-widest uppercase text-stone-500">Seller Studio</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-all duration-200 ${
                active
                  ? "bg-stone-800 text-ivory-100"
                  : "text-stone-400 hover:text-ivory-200 hover:bg-stone-800/50"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-stone-800 space-y-1">
        <Link
          href="/buyer/homepage"
          className="flex items-center gap-3 px-4 py-3 text-sm text-stone-500 hover:text-stone-300 transition-colors tracking-wide"
        >
          <User className="w-4 h-4" />
          Buyer View
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone-500 hover:text-stone-300 transition-colors tracking-wide"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-stone-950 flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-stone-950 border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <span className="font-display text-lg tracking-[0.3em] text-ivory-100 uppercase">Reloop</span>
        <button onClick={() => setMobileOpen(true)} className="text-stone-400">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-stone-950 z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-stone-500 hover:text-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
