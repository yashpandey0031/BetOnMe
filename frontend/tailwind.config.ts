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
        bg: "#f4f8ff",
        panel: "#ffffff",
        panelSoft: "#eaf2ff",
        primary: "#f97316",
        primarySoft: "#ea580c",
        positive: "#2563eb",
        negative: "#ef4444",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59, 130, 246, 0.24), 0 14px 30px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        heroGrid:
          "radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.2) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
