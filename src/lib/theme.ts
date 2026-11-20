import { DarkTheme, DefaultTheme, type Theme } from "expo-router";

import { palette } from "@/theme/palette";

/**
 * The design tokens as color values, for props that can't take a className (React Native Reusables' THEME):
 * background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring,
 * plus our own (brand, warning, deep, ...). Defined in src/theme/palette.ts, mirroring src/global.css.
 */
export const THEME = palette;

/** --radius in src/global.css (0.625rem) in pixels, for rounded corners outside className. */
export const RADIUS = 10;

/** React Navigation's theme in our colors, per scheme (headers, tab bar, screen backgrounds). */
export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
