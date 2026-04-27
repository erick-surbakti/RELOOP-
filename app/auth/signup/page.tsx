"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShoppingBag, Store, AlertCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { UserRole } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<UserRole>("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const s = createClient();
    const { data, error: err } = await s.auth.signUp({ email, password, options: { data: { full_name: fullName, role } } });
    if (err) {
      if (err.message.includes("rate limit") || err.message.includes("too many")) setError("Terlalu banyak percobaan. Tunggu 1 menit atau pakai email lain.");
      else setError(err.message);
      setLoading(false); return;
    }
    if (data.user && !data.session) { setError('Email confirmation masih aktif. Buka Supabase → Auth → Settings → matikan "Enable email confirmations".'); setLoading(false); return; }
    if (!data.user) { setError("Signup gagal. Cek .env.local."); setLoading(false); return; }
    const { error: pe } = await s.from("profiles").upsert({ id: data.user.id, full_name: fullName, email, role, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (pe?.code === "42501") { setError("RLS error — run supabase-schema.sql dulu."); setLoading(false); return; }
    toast.success("Akun berhasil dibuat!");
    router.push(role === "seller" ? "/seller/dashboard" : "/buyer/homepage");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* Left Form */}
      <div className="flex items-center justify-center px-8 py-16 overflow-y-auto" style={{ flex: 1 }}>
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: 360 }}
        >
          <div style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" className="font-display text-xl tracking-[0.4em] uppercase" style={{ color: "var(--text)" }}>Reloop</Link>
            <Link href="/auth/login" className="flex items-center gap-2 hover-underline" style={{ color: "var(--text-3)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              <ArrowLeft className="w-3 h-3" strokeWidth={1.5} /> Sign in
            </Link>
          </div>

          <div style={{ marginBottom: 36 }}>
            <h1 className="font-display font-light" style={{ fontSize: "2.75rem", color: "var(--text)", lineHeight: 1.1, marginBottom: 10 }}>Join Reloop</h1>
            <p style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 300 }}>Create your account and start your fashion journey.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 24, padding: "14px 16px", background: "#FEF2F2", borderLeft: "2px solid #F87171", display: "flex", gap: 10 }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
              <p style={{ color: "#991B1B", fontSize: 12, fontWeight: 300, lineHeight: 1.6 }}>{error}</p>
            </motion.div>
          )}

          {/* Role selector */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12, fontFamily: "var(--font-body)" }}>
              I want to
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { value: "buyer" as UserRole, label: "Shop & Buy", icon: ShoppingBag, desc: "Discover curated fashion" },
                { value: "seller" as UserRole, label: "Sell Items", icon: Store, desc: "List your pre-loved pieces" },
              ].map(({ value, label, icon: Icon, desc }) => {
                const active = role === value;
                return (
                  <button key={value} type="button" onClick={() => setRole(value)}
                    style={{
                      padding: "16px 14px",
                      textAlign: "left",
                      border: `1px solid ${active ? "var(--text)" : "var(--border)"}`,
                      background: active ? "var(--text)" : "white",
                      cursor: "pointer",
                      transition: "all 0.35s ease",
                    }}>
                    <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: active ? "#C4A882" : "var(--text-3)", marginBottom: 10 }} />
                    <div style={{ fontSize: 13, fontWeight: 400, color: active ? "var(--bg)" : "var(--text)", fontFamily: "var(--font-body)", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 11, color: active ? "rgba(247,245,240,0.5)" : "var(--text-3)", fontFamily: "var(--font-body)", fontWeight: 300 }}>{desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { label: "Full Name", type: "text", value: fullName, set: setFullName, placeholder: "Your full name" },
              { label: "Email",     type: "email", value: email,    set: setEmail,    placeholder: "your@email.com" },
            ].map(({ label, type, value, set, placeholder }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12, fontFamily: "var(--font-body)" }}>
                  {label}
                </label>
                <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} required className="input-elegant" />
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12, fontFamily: "var(--font-body)" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" required minLength={8} className="input-elegant" style={{ paddingRight: 36 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", cursor: "pointer", background: "none", border: "none" }}>
                  {showPw ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
              {loading
                ? <span className="inline-block w-4 h-4 rounded-full animate-spin" style={{ border: "1.5px solid rgba(255,255,255,0.25)", borderTopColor: "white" }} />
                : `Create ${role === "buyer" ? "Buyer" : "Seller"} Account`}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: "14px 16px", background: "white", border: "1px solid var(--border-2)" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8, fontFamily: "var(--font-body)" }}>Checklist</p>
            {[".env.local → SUPABASE_URL + ANON_KEY", "SQL Editor → run schema.sql", "Auth → matikan email confirmation"].map(item => (
              <div key={item} style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--text-3)", marginBottom: 6, fontWeight: 300 }}>
                <span style={{ flexShrink: 0 }}>→</span>{item}
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-3)", fontWeight: 300, marginTop: 20 }}>
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="hover-underline" style={{ color: "var(--text)", fontWeight: 400 }}>Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Image */}
      <div className="hidden lg:block relative overflow-hidden" style={{ width: "58%" }}>
        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=85" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(225deg, rgba(10,8,5,0.1) 0%, rgba(10,8,5,0.55) 100%)" }} />
        <div className="absolute bottom-14 left-14 right-14 space-y-4">
          {["Curated pre-loved fashion from trusted sellers", "Sustainable shopping for a better planet", "Premium pieces at accessible prices"].map((text, i) => (
            <motion.div key={text} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C4A882", flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 300 }}>{text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
