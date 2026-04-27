"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const s = createClient();
    const { data, error: err } = await s.auth.signInWithPassword({ email, password });
    if (err) {
      if (err.message.includes("Invalid login credentials")) setError("Email atau password salah.");
      else if (err.message.includes("Email not confirmed")) setError('Disable "Enable email confirmations" di Supabase → Auth → Settings.');
      else setError(err.message);
      setLoading(false); return;
    }
    if (!data.user) { setError("Login gagal."); setLoading(false); return; }
    const { data: profile } = await s.from("profiles").select("role").eq("id", data.user.id).single();
    if (!profile) {
      const meta = data.user.user_metadata;
      await s.from("profiles").upsert({ id: data.user.id, full_name: meta?.full_name || "User", email: data.user.email || email, role: meta?.role || "buyer", updated_at: new Date().toISOString() });
      router.push(meta?.role === "seller" ? "/seller/dashboard" : "/buyer/homepage");
    } else {
      router.push(profile.role === "seller" ? "/seller/dashboard" : "/buyer/homepage");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* Left Image */}
      <div className="hidden lg:block relative overflow-hidden" style={{ width: "58%" }}>
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85"
          alt=""
          className="w-full h-full object-cover"
          style={{ transition: "transform 12s ease" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,8,5,0.25) 0%, rgba(10,8,5,0.6) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-between p-14">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" style={{ color: "rgba(255,255,255,0.5)" }} strokeWidth={1.5} />
            <span className="font-display text-xl tracking-[0.4em] uppercase" style={{ color: "rgba(255,255,255,0.9)" }}>Reloop</span>
          </Link>
          <div style={{ maxWidth: 380 }}>
            <blockquote className="font-display font-light italic" style={{ fontSize: "clamp(1.5rem,3vw,2.25rem)", color: "rgba(255,255,255,0.88)", lineHeight: 1.35, marginBottom: 20 }}>
              "Fashion is the armor to survive everyday life."
            </blockquote>
            <cite style={{ fontSize: 11, letterSpacing: "0.22em", color: "rgba(255,255,255,0.4)", fontStyle: "normal", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
              — Bill Cunningham
            </cite>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center px-8 py-16" style={{ flex: 1 }}>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: 360 }}
        >
          <div className="lg:hidden mb-12">
            <Link href="/" className="font-display text-xl tracking-[0.4em] uppercase" style={{ color: "var(--text)" }}>Reloop</Link>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h1 className="font-display font-light" style={{ fontSize: "2.75rem", color: "var(--text)", lineHeight: 1.1, marginBottom: 10 }}>
              Welcome back
            </h1>
            <p style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 300 }}>
              Sign in to continue your fashion journey.
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 28, padding: "14px 16px", background: "#FEF2F2", borderLeft: "2px solid #F87171", display: "flex", gap: 10 }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
              <p style={{ color: "#991B1B", fontSize: 12, fontWeight: 300, lineHeight: 1.6 }}>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12, fontFamily: "var(--font-body)" }}>
                Email
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required className="input-elegant" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12, fontFamily: "var(--font-body)" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required className="input-elegant" style={{ paddingRight: 36 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", cursor: "pointer", background: "none", border: "none" }}>
                  {showPw ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
              {loading ? <span className="inline-block w-4 h-4 rounded-full animate-spin" style={{ border: "1.5px solid rgba(255,255,255,0.25)", borderTopColor: "white" }} /> : "Sign In"}
            </button>
          </form>

          <div className="divider-text" style={{ margin: "32px 0" }}><span>or</span></div>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-3)", fontWeight: 300 }}>
            New to Reloop?{" "}
            <Link href="/auth/signup" className="hover-underline" style={{ color: "var(--text)", fontWeight: 400 }}>
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
