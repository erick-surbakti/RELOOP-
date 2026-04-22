"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, ShoppingBag, Store } from "lucide-react";
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email,
        role,
      });

      if (profileError) {
        toast.error("Failed to create profile");
        setLoading(false);
        return;
      }

      toast.success("Account created! Welcome to Reloop.");
      if (role === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/buyer/homepage");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="w-full lg:w-[45%] bg-ivory-50 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="font-display text-2xl tracking-[0.3em] text-stone-900 uppercase">
              Reloop
            </Link>
            <Link href="/auth/login" className="flex items-center gap-2 text-stone-500 text-sm hover:text-stone-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Sign in
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl text-stone-900 font-light mb-2">
              Join Reloop
            </h1>
            <p className="text-stone-500 text-sm">
              Create your account and start your fashion journey.
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-3">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "buyer" as UserRole, label: "Shop & Buy", icon: ShoppingBag, desc: "Discover curated fashion" },
                { value: "seller" as UserRole, label: "Sell Items", icon: Store, desc: "List your pre-loved pieces" },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`relative p-4 text-left border transition-all duration-300 ${
                    role === value
                      ? "border-stone-800 bg-stone-900 text-ivory-100"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${role === value ? "text-warm-300" : "text-stone-400"}`} />
                  <div className="font-medium text-sm">{label}</div>
                  <div className={`text-xs mt-0.5 ${role === value ? "text-stone-400" : "text-stone-400"}`}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="input-elegant"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-elegant"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="input-elegant pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-ivory-300/30 border-t-ivory-300 rounded-full animate-spin" />
              ) : (
                `Create ${role === "buyer" ? "Buyer" : "Seller"} Account`
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-6 leading-relaxed">
            By creating an account, you agree to our{" "}
            <span className="text-stone-600 hover:underline cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-stone-600 hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>

      {/* Right — Image */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-stone-950/20 to-stone-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-12 w-full">
          <div className="space-y-4">
            {[
              "Curated pre-loved fashion from trusted sellers",
              "Sustainable shopping for a better planet",
              "Premium pieces at accessible prices",
            ].map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3"
              >
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
