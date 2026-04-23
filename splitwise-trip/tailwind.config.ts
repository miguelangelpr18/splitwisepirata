import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Splitwise-inspired palette
        brand: {
          DEFAULT: "#1CC29F", // Splitwise teal-green
          dark: "#17A98A",
          light: "#E6F9F5",
        },
        owed: "#1CC29F",     // green — someone owes you
        owes: "#FF652F",     // orange — you owe
        ink: "#2B2B2B",
        muted: "#6B7280",
        cream: "#F7F7F5",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
