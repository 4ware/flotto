import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Our font families (tailwind.config.js): one family per weight, because React Native can't
// pick a weight of a custom font. Registered so a later font class replaces an earlier one.
const twMerge = extendTailwindMerge({
  extend: {
    theme: { font: ["sans", "sans-medium", "sans-semibold", "sans-bold", "display", "heading"] },
  },
});

/** Joins class names; later Tailwind classes win over conflicting earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
