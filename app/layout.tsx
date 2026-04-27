import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Reloop — Curated Secondhand Fashion",
  description: "Discover premium secondhand fashion. Buy and sell curated pieces from trusted sellers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1C1917",
              color: "#FAFAF8",
              borderRadius: "0",
              padding: "14px 18px",
              fontSize: "12px",
              letterSpacing: "0.05em",
              boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: "300",
            },
            success: { iconTheme: { primary: "#6B7C6E", secondary: "#FAFAF8" } },
            error: { iconTheme: { primary: "#B45309", secondary: "#FAFAF8" } },
          }}
        />
      </body>
    </html>
  );
}
