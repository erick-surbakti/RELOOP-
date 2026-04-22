import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Reloop — Curated Secondhand Fashion",
  description: "Discover premium secondhand fashion. Buy and sell curated pieces from trusted sellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-ivory-100 text-stone-800 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#2A2520",
              color: "#F9F7F2",
              borderRadius: "0",
              padding: "12px 16px",
              fontSize: "13px",
              letterSpacing: "0.02em",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            },
            success: {
              iconTheme: { primary: "#5A7852", secondary: "#F9F7F2" },
            },
            error: {
              iconTheme: { primary: "#B45309", secondary: "#F9F7F2" },
            },
          }}
        />
      </body>
    </html>
  );
}
