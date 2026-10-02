import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: "#2B1B33",
        plumSoft: "#6B5570",
        plumMid: "#8B6B9E",
        rose: "#C1666B",
        moss: "#6B7F5E",
        gold: "#D4A94A",
        cream: "#FBF6EF",
        sage: "#A8C5A2",
        mist: "#E4D9E8",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Public Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 12px 32px rgba(43, 27, 51, 0.08)",
        nav: "0 12px 32px rgba(43, 27, 51, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
