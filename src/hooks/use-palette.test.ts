import { describe, expect, test } from "bun:test";

import { setColorSchemePreference } from "@/theme/color-scheme";
import { palette } from "@/theme/palette";
import { act, renderHook } from "@/test/render";

import { usePalette } from "./use-palette";

describe("usePalette", () => {
  test("returns the colors of the scheme on screen", async () => {
    const { result } = await renderHook(() => usePalette());
    expect(result.current).toBe(palette.light);

    await act(() => setColorSchemePreference("dark"));
    expect(result.current).toBe(palette.dark);
  });
});
