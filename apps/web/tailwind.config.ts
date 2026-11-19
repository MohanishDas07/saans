import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Locked SAANS Field-Instrument Editorial Tokens
        paper: {
          DEFAULT: "#F3EFE6",
          dark: "#141517",
        },
        surface: {
          DEFAULT: "#FBF8F1",
          card: "#FFFFFF",
          dark: "#1D1E22",
          cardDark: "#24262B",
        },
        ink: {
          DEFAULT: "#17181A",
          muted: "#4A4D52",
          light: "#F3EFE6",
          lightMuted: "#9EA2A8",
        },
        rule: {
          DEFAULT: "#CFC8B8",
          dark: "#33363D",
        },
        // CPCB NAQI Strict Color Scale
        aqi: {
          good: "#1E8E4E",
          satisfactory: "#7FB539",
          moderate: "#F2C200",
          poor: "#F28C28",
          veryPoor: "#D7263D",
          severe: "#7A0F2E",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "Courier New", "monospace"],
        devanagari: ["var(--font-devanagari)", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.9375rem" }],
      },
      borderWidth: {
        hairline: "1px",
      },
    },
  },
  plugins: [],
};

export default config;
