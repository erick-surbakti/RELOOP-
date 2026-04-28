"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "seller") {
          router.push("/seller/dashboard");
        } else {
          router.push("/buyer/homepage");
        }
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-950 text-ivory-100 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/40 to-stone-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-stone-950/40" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-warm-400/5 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-sage-500/5 blur-3xl" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-display text-2xl tracking-[0.3em] text-ivory-100 uppercase">
            Reloop
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-6"
        >
          <Link
            href="/auth/login"
            className="text-ivory-300 text-sm tracking-widest uppercase hover:text-ivory-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-ivory-100 text-stone-900 px-5 py-2.5 text-xs tracking-widest uppercase font-medium hover:bg-white transition-colors"
          >
            Join Now
          </Link>
        </motion.div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <span className="text-warm-300 text-xs tracking-[0.4em] uppercase border border-warm-300/30 px-4 py-2">
            Curated Secondhand Fashion
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-ivory-50 leading-none mb-6"
        >
          Wear the
          <br />
          <em className="italic text-warm-300">Story</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-stone-400 text-lg max-w-lg mb-12 font-light leading-relaxed"
        >
          Discover premium pre-loved fashion. Every piece has a story — 
          find yours in our curated marketplace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/auth/signup"
            className="group flex items-center gap-3 bg-ivory-100 text-stone-900 px-8 py-4 text-sm tracking-widest uppercase font-medium hover:bg-white transition-all duration-300"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/auth/signup"
            className="flex items-center gap-3 border border-ivory-100/30 text-ivory-200 px-8 py-4 text-sm tracking-widest uppercase font-medium hover:border-ivory-100/60 hover:text-ivory-100 transition-all duration-300"
          >
            Sell Your Pieces
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex items-center gap-12 mt-20 text-center"
        >
          {[
            { value: "2,000+", label: "Curated Pieces" },
            { value: "500+", label: "Trusted Sellers" },
            { value: "10,000+", label: "Happy Buyers" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl text-ivory-100 font-light">{stat.value}</div>
              <div className="text-stone-500 text-xs tracking-widest uppercase mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/10 px-8 lg:px-16 py-6 flex items-center justify-between">
        <span className="text-stone-600 text-xs tracking-wider">
          © 2024 Reloop. All rights reserved.
        </span>
        <span className="text-stone-600 text-xs tracking-wider">
          Sustainable Fashion Marketplace
        </span>
      </div>
    </div>
  );
}
