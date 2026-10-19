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
      fontFamily: {
        kumbh: ["KumbhSans_400Regular"],
        "kumbh-light": ["KumbhSans_300Light"],
        "kumbh-medium": ["KumbhSans_500Medium"],
        "kumbh-semibold": ["KumbhSans_600SemiBold"],
        "kumbh-bold": ["KumbhSans_700Bold"],
        "kumbh-extrabold": ["KumbhSans_800ExtraBold"],
      },
      colors: {
        primary: "#155D5F", // Wealthconomy teal
        gold: "#FFCF65", // Wealthconomy gold/yellow
        dark: "#1A1A1A", // Dark text
        slate: "#454C59", // Slate secondary
        background: "#FFFFFF", // White background
        surface: "#F8F8F8", // Light surface for segments
        muted: "#F3F4F6", // Muted light grey
        border: "#E5E5E5", // Standard border
        secondary: "#6B7280", // Muted text for light mode
      },
    },
  },
  plugins: [],
};
