import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme, useColorScheme } from "nativewind";

export const COLOR_SCHEMES = ["light", "dark", "system"] as const;
export type ColorSchemePreference = (typeof COLOR_SCHEMES)[number];

const STORAGE_KEY = "flotto.color-scheme";

// Same idea as next-themes on the web app: the user's choice ("system" by default),
// applied app-wide and persisted across launches.
let preference: ColorSchemePreference = "system";
const listeners = new Set<() => void>();

// Web, class-based dark mode: NativeWind's "system" just removes the `dark` class (= always light),
// so resolve it against the browser's preference ourselves and follow its changes.
const systemDarkQuery =
  Platform.OS === "web" && typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function applyToNativeWind(value: ColorSchemePreference) {
  // Web server rendering (app.json web.output "server"): no document to style yet.
  if (Platform.OS === "web" && typeof window === "undefined") return;
  if (value === "system" && systemDarkQuery) {
    colorScheme.set(systemDarkQuery.matches ? "dark" : "light");
  } else {
    // Native: overrides Appearance ("system" hands control back to the OS).
    colorScheme.set(value);
  }
}

systemDarkQuery?.addEventListener("change", () => {
  if (preference === "system") applyToNativeWind("system");
});

function apply(value: ColorSchemePreference) {
  preference = value;
  applyToNativeWind(value);
  listeners.forEach((l) => l());
}

const isPreference = (v: unknown): v is ColorSchemePreference =>
  COLOR_SCHEMES.includes(v as ColorSchemePreference);

/** Restore the saved preference. Call before hiding the splash screen to avoid a flash. */
export async function loadColorSchemePreference() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (isPreference(saved)) return apply(saved);
  } catch {
    // Storage unavailable: fall through to the system scheme.
  }
  // On native "system" is already in effect; on web it still has to be resolved.
  if (Platform.OS === "web") apply("system");
}

export function setColorSchemePreference(value: ColorSchemePreference) {
  apply(value);
  AsyncStorage.setItem(STORAGE_KEY, value).catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useColorSchemePreference() {
  return useSyncExternalStore(subscribe, () => preference);
}

/**
 * The scheme actually on screen. Use this instead of React Native's useColorScheme,
 * which doesn't see a manual choice on web.
 */
export function useResolvedColorScheme(): "light" | "dark" {
  return useColorScheme().colorScheme === "dark" ? "dark" : "light";
}
