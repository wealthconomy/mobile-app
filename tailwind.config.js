// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#155D5F", // Wealthconomy teal
        gold: "#FFCF65", // Wealthconomy gold/yellow
        dark: "#323232", // Dark text
        slate: "#454C59", // Slate secondary
        background: "#FFFFFF", // White background
        muted: "#F5F5F5", // Light grey surface
        border: "#E5E5E5", // Border
        secondary: "#6B7280", // Muted text
      },
    },
  },
  plugins: [],
};
