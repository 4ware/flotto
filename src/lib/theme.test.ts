import { describe, expect, test } from "bun:test";

import { palette } from "@/theme/palette";

import { NAV_THEME, RADIUS, THEME } from "./theme";

describe("theme", () => {
  test("THEME is our palette, with the tokens React Native Reusables expects", () => {
    expect(THEME).toBe(palette);
    for (const scheme of ["light", "dark"] as const) {
      for (const token of ["background", "foreground", "card", "popover", "primary", "secondary", "muted", "accent", "destructive", "border", "input", "ring"]) {
        expect(THEME[scheme]).toHaveProperty(token);
      }
    }
  });

  test("NAV_THEME colors navigation in our palette, per scheme", () => {
    expect(NAV_THEME.light.dark).toBe(false);
    expect(NAV_THEME.dark.dark).toBe(true);
    expect(NAV_THEME.light.colors).toMatchObject({
      background: palette.light.background,
      card: palette.light.card,
      primary: palette.light.primary,
      text: palette.light.foreground,
      border: palette.light.border,
      notification: palette.light.destructive,
    });
    expect(NAV_THEME.dark.colors.background).toBe(palette.dark.background);
  });

  test("RADIUS matches --radius (0.625rem)", () => {
    expect(RADIUS).toBe(10);
  });
});
