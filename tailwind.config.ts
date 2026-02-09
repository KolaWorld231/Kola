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
        // Fresh Color Palette
        fresh: {
          dark: "#290907",
          brown: "#57473A",
          green: "#6E8658",
          blue: "#73A1B2",
          sage: "#D0D5CE",
          cream: "#EFE9E1",
        },
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
        // Kola Brand Palette Colors
        kola: {
          primary: "#4daa9f",
          bronze: "#f57a58",
          accent: "#75af56",
          deep: "#4daa9f",
          cream: "#f6efea",
        },
        "brand": {
          primary: "#4daa9f",
          gold: "#eecb57",
          coral: "#f57a58",
          green: "#75af56",
          cream: "#f6efea",
        },
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
        "wiggle": "wiggle 0.5s ease-in-out",
        "shake": "shake 0.5s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "heart-beat": "heartBeat 1s ease-in-out",
        "fire-flicker": "fireFlicker 0.5s ease-in-out infinite",
        "letter-bounce": "letterBounce 0.6s ease-out",
      },
      keyframes: {
        xpGain: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px currentColor" },
          "50%": { boxShadow: "0 0 20px currentColor, 0 0 30px currentColor" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        heartBeat: {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.2)" },
          "50%": { transform: "scale(1)" },
          "75%": { transform: "scale(1.2)" },
        },
        fireFlicker: {
          "0%, 100%": { opacity: "1", transform: "scale(1) rotate(-2deg)" },
          "50%": { opacity: "0.8", transform: "scale(1.1) rotate(2deg)" },
        },
        letterBounce: {
          "0%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-20px)" },
          "60%": { transform: "translateY(-10px)" },
          "80%": { transform: "translateY(-5px)" },
          "100%": { transform: "translateY(0)" },
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
