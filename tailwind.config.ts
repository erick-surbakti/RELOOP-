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
          50:  "#FDFCF9",
          100: "#F7F5F0",
          200: "#EFECE5",
          300: "#E4DFD5",
          400: "#D4CCBE",
        },
        warm: {
          100: "#F5EDE0",
          200: "#E8D5B8",
          300: "#D4B896",
          400: "#C4A882",
          500: "#8B7355",
          600: "#6B5540",
        },
        sage: {
          100: "#EAF0E6",
          200: "#C8D8C0",
          300: "#A0B898",
          400: "#7A8C72",
          500: "#5A6E54",
          600: "#3E5038",
        },
        stone: {
          850: "#252018",
          950: "#171412",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { letterSpacing: "0.12em" }],
        "3xs": ["9px",  { letterSpacing: "0.15em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
      },
      boxShadow: {
        "soft":   "0 2px 20px -4px rgba(0,0,0,0.06)",
        "medium": "0 8px 40px -8px rgba(0,0,0,0.10)",
        "large":  "0 20px 60px -12px rgba(0,0,0,0.15)",
        "warm":   "0 8px 32px -6px rgba(139,115,85,0.18)",
      },
      borderRadius: { "none": "0" },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in-out": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
