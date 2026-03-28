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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        positive: {
          DEFAULT: "var(--positive)",
          hover: "var(--positive-hover)",
        },
        negative: {
          DEFAULT: "var(--negative)",
          hover: "var(--negative-hover)",
        },
        card: "var(--card-bg)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
};
export default config;
