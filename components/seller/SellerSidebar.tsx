"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, PlusSquare, Package, ShoppingBag, Settings, LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const NAV = [
  { href: "/seller/dashboard",         icon: LayoutDashboard, label: "Dashboard" },
  { href: "/seller/add-product",       icon: PlusSquare,      label: "Add Product" },
  { href: "/seller/manage-products",   icon: Package,         label: "My Products" },
  { href: "/seller/orders",            icon: ShoppingBag,     label: "Orders" },
  { href: "/seller/profile",           icon: Settings,        label: "Profile & Switch" },
];

function SidebarInner({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await createClient().auth.signOut();
    toast.success("Signed out");
    router.push("/auth/login");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0E0C0A" }}>
      {/* Logo */}
      <div style={{ padding: "28px 28px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="font-display" style={{ fontSize: "1.4rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(247,245,240,0.9)" }}>
          Reloop
        </span>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#3A3530", marginTop: 4, fontFamily: "var(--font-body)" }}>
          Seller Studio
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
                marginBottom: 2, fontSize: 12, letterSpacing: "0.12em",
                color: active ? "rgba(247,245,240,0.9)" : "#4A4540",
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
                textDecoration: "none", transition: "all 0.25s ease",
                borderLeft: active ? "2px solid #C4A882" : "2px solid transparent",
                fontFamily: "var(--font-body)", fontWeight: 300,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(247,245,240,0.7)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#4A4540"; }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 12, letterSpacing: "0.12em", color: "#2E2A26", fontFamily: "var(--font-body)", fontWeight: 300, transition: "color 0.25s ease" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#4A4540")}
          onMouseLeave={e => (e.currentTarget.style.color = "#2E2A26")}
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function SellerSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 flex-col z-30" style={{ width: 240, background: "#0E0C0A" }}>
        <SidebarInner />
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-5 py-4"
        style={{ background: "#0E0C0A", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="font-display" style={{ fontSize: "1.2rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(247,245,240,0.9)" }}>
          Reloop
        </span>
        <button onClick={() => setMobileOpen(true)} style={{ color: "#4A4540", background: "none", border: "none", cursor: "pointer" }}>
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 40 }} />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 240, zIndex: 50 }}
            >
              <button onClick={() => setMobileOpen(false)}
                style={{ position: "absolute", top: 16, right: 16, color: "#4A4540", background: "none", border: "none", cursor: "pointer", zIndex: 1 }}>
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <SidebarInner onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
