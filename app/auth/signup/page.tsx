"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, ShoppingBag, Store, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { UserRole } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("buyer");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (error) {
      if (error.message.includes("rate limit") || error.message.includes("too many")) {
        setErrorMsg("Terlalu banyak percobaan. Tunggu 1 menit atau pakai email lain.");
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      setErrorMsg(
        'Email confirmation masih aktif. Buka Supabase → Authentication → Settings → matikan "Enable email confirmations" → Save. Lalu coba lagi.'
      );
      setLoading(false);
      return;
    }

    if (!data.user) {
      setErrorMsg("Signup gagal. Cek .env.local apakah SUPABASE_URL dan ANON_KEY sudah benar.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      { id: data.user.id, full_name: fullName, email, role, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

    if (profileError) {
      if (profileError.code === "42501" || profileError.message.includes("policy")) {
        setErrorMsg("RLS policy error — pastikan sudah run supabase-schema.sql di SQL Editor.");
        setLoading(false);
        return;
      }
      console.warn("Profile warning:", profileError.message);
    }

    toast.success("Akun berhasil dibuat!");
    router.push(role === "seller" ? "/seller/dashboard" : "/buyer/homepage");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[45%] bg-ivory-50 flex items-center justify-center px-6 py-16 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="font-display text-2xl tracking-[0.3em] text-stone-900 uppercase">Reloop</Link>
            <Link href="/auth/login" className="flex items-center gap-2 text-stone-500 text-sm hover:text-stone-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Sign in
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl text-stone-900 font-light mb-2">Join Reloop</h1>
            <p className="text-stone-500 text-sm">Create your account and start your fashion journey.</p>
          </div>

          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 flex gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-xs leading-relaxed">{errorMsg}</p>
            </motion.div>
          )}

          <div className="mb-6">
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-3">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "buyer" as UserRole, label: "Shop & Buy", icon: ShoppingBag, desc: "Discover curated fashion" },
                { value: "seller" as UserRole, label: "Sell Items", icon: Store, desc: "List your pre-loved pieces" },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button key={value} type="button" onClick={() => setRole(value)}
                  className={`relative p-4 text-left border transition-all duration-300 ${
                    role === value ? "border-stone-800 bg-stone-900 text-ivory-100" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                  }`}>
                  <Icon className={`w-5 h-5 mb-2 ${role === value ? "text-warm-300" : "text-stone-400"}`} />
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs mt-0.5 text-stone-400">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name" required className="input-elegant" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required className="input-elegant" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                  required minLength={8} className="input-elegant pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-ivory-300/30 border-t-ivory-300 rounded-full animate-spin" />
                : `Create ${role === "buyer" ? "Buyer" : "Seller"} Account`}
            </button>
          </form>

          <div className="mt-6 p-4 bg-stone-50 border border-stone-100">
            <p className="text-[11px] text-stone-400 font-medium tracking-widest uppercase mb-2">Checklist setup:</p>
            <ul className="space-y-1.5">
              {[
                ".env.local → isi SUPABASE_URL + ANON_KEY",
                "SQL Editor → run supabase-schema.sql",
                "Auth → Settings → matikan email confirmation",
                "Auth → Rate Limits → naikkan ke 100/hour",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[11px] text-stone-400 leading-relaxed">
                  <span className="text-stone-300 flex-shrink-0">→</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-xs text-stone-400 mt-4">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-stone-600 hover:underline underline-offset-4">Sign in</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-l from-stone-950/20 to-stone-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 w-full">
          <div className="space-y-4">
            {["Curated pre-loved fashion from trusted sellers", "Sustainable shopping for a better planet", "Premium pieces at accessible prices"].map((text, i) => (
              <motion.div key={text} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-warm-300 flex-shrink-0" />
                <span className="text-ivory-200 text-sm">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
