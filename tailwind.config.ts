import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#e8eef5",
          100: "#c5d3e5",
          200: "#9fb5d3",
          300: "#7897c1",
          400: "#5880b4",
          500: "#3869a6",
          600: "#2d5a92",
          700: "#1e4070",
          800: "#132c52",
          900: "#0B1F3A",
          950: "#071525",
        },
        gold: {
          50: "#fdf8ec",
          100: "#f9edca",
          200: "#f3d98a",
          300: "#ecc04a",
          400: "#e4a81e",
          500: "#C8921A",
          600: "#a87218",
          700: "#855514",
          800: "#624012",
          900: "#432d0f",
        },
        slate: {
          850: "#1e293b",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
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
      },
    },
  },
  plugins: [],
};

export default config;
