import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Volo Brand Palette
        primary: {
          DEFAULT: "#D63A3A", // Liberian Red
          dark: "#B32E2E",
          light: "#E85C5C",
          hover: "#C42F2F",
        },
        secondary: {
          DEFAULT: "#1B3F91", // Deep Blue
          dark: "#153274",
          light: "#2A56B8",
          hover: "#1D46A8",
        },
        success: {
          DEFAULT: "#3A9D5A", // Palm Green
          dark: "#2E7D48",
          light: "#4DBD73",
        },
        accent: {
          DEFAULT: "#F3C24F", // Sun Gold
          dark: "#E0B040",
          light: "#F6D47A",
        },
        // Neutrals
        background: {
          DEFAULT: "#F7F4EF", // Off-White
          dark: "#E8E6E1", // Soft Gray
          // Dark mode variants
          darkMode: "#1A1A1A", // Dark background
          darkModeSecondary: "#2A2A2A", // Dark secondary background
        },
        foreground: {
          DEFAULT: "#2E2D2C", // Charcoal
          light: "#6B6A68",
          muted: "#9B9A98",
          // Dark mode variants
          darkMode: "#F7F4EF", // Light text on dark
          darkModeLight: "#B8B6B4", // Muted text on dark
        },
        border: {
          DEFAULT: "#E8E6E1",
          dark: "#D0CEC9",
          // Dark mode variant
          darkMode: "#3A3A3A", // Dark border
        },
        // Liberian theme colors (aliases)
        "liberian-red": "#D63A3A",
        "liberian-blue": "#1B3F91",
        "palm-green": "#3A9D5A",
        "sun-gold": "#F3C24F",
        "liberian-gold": "#F3C24F",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        base: "16px",
      },
      borderRadius: {
        DEFAULT: "12px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s infinite",
        "xp-gain": "xpGain 0.6s ease-out",
      },
      keyframes: {
        xpGain: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
    },
  },
  plugins: [],
};

export default config;
