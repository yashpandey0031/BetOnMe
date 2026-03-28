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
        bg: "#050505",
        panel: "#1a1a1a",
        panelSoft: "#131313",
        primary: "#9945ff",
        primarySoft: "#7f33db",
        positive: "#14f195",
        negative: "#ff4b4b",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(153, 69, 255, 0.35), 0 18px 44px rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        heroGrid:
          "radial-gradient(circle at 1px 1px, rgba(153, 69, 255, 0.22) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
