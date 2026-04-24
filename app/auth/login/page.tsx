"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setErrorMsg("Email atau password salah. Coba lagi.");
      } else if (error.message.includes("Email not confirmed")) {
        setErrorMsg('Email belum dikonfirmasi. Buka Supabase → Authentication → Settings → matikan "Enable email confirmations".');
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
      return;
    }

    if (!data.user) {
      setErrorMsg("Login gagal. Cek .env.local kamu.");
      setLoading(false);
      return;
    }

    // Fetch role
    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("role").eq("id", data.user.id).single();

    if (profileError || !profile) {
      // Profile belum ada — buat dari metadata auth
      const meta = data.user.user_metadata;
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: meta?.full_name || "User",
        email: data.user.email || email,
        role: meta?.role || "buyer",
        updated_at: new Date().toISOString(),
      });
      const role = meta?.role || "buyer";
      toast.success("Welcome back!");
      router.push(role === "seller" ? "/seller/dashboard" : "/buyer/homepage");
    } else {
      toast.success("Welcome back!");
      router.push(profile.role === "seller" ? "/seller/dashboard" : "/buyer/homepage");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Image */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/30 to-stone-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <ArrowLeft className="w-4 h-4 text-ivory-200 group-hover:-translate-x-1 transition-transform" />
            <span className="font-display text-2xl tracking-[0.3em] text-ivory-100 uppercase">Reloop</span>
          </Link>
          <div>
            <blockquote className="font-display text-3xl text-ivory-100 font-light italic leading-relaxed mb-4">
              "Fashion is the armor to survive everyday life."
            </blockquote>
            <cite className="text-ivory-400 text-sm tracking-widest not-italic">— Bill Cunningham</cite>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-[45%] bg-ivory-50 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-12">
            <Link href="/" className="font-display text-2xl tracking-[0.3em] text-stone-900 uppercase">Reloop</Link>
          </div>

          <div className="mb-10">
            <h1 className="font-display text-4xl text-stone-900 font-light mb-2">Welcome back</h1>
            <p className="text-stone-500 text-sm">Sign in to continue your fashion journey.</p>
          </div>

          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 flex gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-xs leading-relaxed">{errorMsg}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required className="input-elegant" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  required className="input-elegant pr-12" />
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
                : "Sign In"}
            </button>
          </form>

          <div className="divider-text my-8"><span>or</span></div>

          <p className="text-center text-sm text-stone-500">
            Belum punya akun?{" "}
            <Link href="/auth/signup" className="text-stone-900 font-medium hover:underline underline-offset-4">Daftar sekarang</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
