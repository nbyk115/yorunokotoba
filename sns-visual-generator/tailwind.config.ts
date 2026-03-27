import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sal: {
          black: "#1a1a1a",
          charcoal: "#2d2d2d",
          gold: "#c4a265",
          "gold-light": "#d4b87a",
          cream: "#f5f0e8",
          white: "#fafafa",
          gray: "#8a8a8a",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', "Inter", "sans-serif"],
        serif: ['"Noto Serif JP"', "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
