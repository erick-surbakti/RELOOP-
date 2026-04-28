"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Sparkles, CheckCircle } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Chat",
      href: "/buyer/chat",
      icon: MessageCircle,
    },
    {
      label: "AI Recommendation",
      href: "/buyer/ai-recommendation",
      icon: Sparkles,
    },
    {
      label: "Original Checker",
      href: "/buyer/original-checker",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200">
      <div className="section-container">
        <div className="flex items-center justify-around h-16 px-4 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-stone-100" : ""}`} />
                <span className="text-[10px] font-medium tracking-wider uppercase text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
