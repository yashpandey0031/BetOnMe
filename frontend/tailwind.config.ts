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
        bg: "#07080d",
        panel: "#111425",
        panelSoft: "#161b32",
        primary: "#7c3aed",
        primarySoft: "#4f46e5",
        positive: "#39ff90",
        negative: "#ff4d61",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124, 58, 237, 0.35), 0 8px 40px rgba(56, 24, 120, 0.35)",
      },
      backgroundImage: {
        heroGrid:
          "radial-gradient(circle at 1px 1px, rgba(124, 58, 237, 0.17) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
