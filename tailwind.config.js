const { hairlineWidth } = require("nativewind/theme");

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const tokens = [
  "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
  "primary", "primary-foreground", "secondary", "secondary-foreground",
  "muted", "muted-foreground", "accent", "accent-foreground",
  "destructive", "destructive-foreground", "border", "input", "ring", "subtle-foreground",
  "brand", "online", "warning", "warning-soft", "warning-foreground",
  "deep", "deep-foreground", "deep-muted", "deep-accent",
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // "media" can't be overridden on web (NativeWind throws); "class" works on every platform.
  darkMode: "class",
  theme: {
    extend: {
      colors: Object.fromEntries(tokens.map((t) => [t, token(t)])),
      // React Native Reusables components (src/components/ui) size their corners from --radius.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderWidth: { hairline: hairlineWidth() },
      // React Native needs one font family per weight.
      fontFamily: {
        sans: ["DMSans_400Regular"],
        "sans-medium": ["DMSans_500Medium"],
        "sans-semibold": ["DMSans_600SemiBold"],
        "sans-bold": ["DMSans_700Bold"],
        display: ["Manrope_800ExtraBold"],
        heading: ["Manrope_700Bold"],
      },
    },
  },
  future: { hoverOnlyWhenSupported: true },
  plugins: [require("tailwindcss-animate")],
};
