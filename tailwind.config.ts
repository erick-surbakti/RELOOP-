import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#FDFCFA",
          100: "#F9F7F2",
          200: "#F2EFE8",
          300: "#E8E3D8",
          400: "#D6CFBF",
        },
        stone: {
          850: "#2A2520",
          950: "#1A1714",
        },
        sage: {
          100: "#E8EDE6",
          200: "#D1DBCC",
          300: "#A8BBA0",
          400: "#7A9970",
          500: "#5A7852",
          600: "#3E5A38",
        },
        warm: {
          100: "#F5EFE6",
          200: "#E8D9C4",
          300: "#D4B896",
          400: "#B8936A",
          500: "#9A7450",
          600: "#7A5A3A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-in": "slideIn 0.5s ease forwards",
        "scale-in": "scaleIn 0.3s ease forwards",
        shimmer: "shimmer 2s infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      boxShadow: {
        elegant: "0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)",
        "elegant-md": "0 8px 40px -8px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.06)",
        "elegant-lg": "0 16px 64px -12px rgba(0, 0, 0, 0.16), 0 4px 16px -4px rgba(0, 0, 0, 0.08)",
        warm: "0 8px 32px -8px rgba(90, 74, 50, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
