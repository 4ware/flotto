import { describe, expect, test } from "bun:test";

import { act, renderHook } from "@/test/render";
import { asyncStorage, nativewind } from "@/test/native-mocks";

import {
  loadColorSchemePreference,
  setColorSchemePreference,
  useColorSchemePreference,
  useResolvedColorScheme,
} from "./color-scheme";

const STORAGE_KEY = "flotto.color-scheme";

describe("color scheme preference", () => {
  test("setting it applies it to NativeWind and saves it", async () => {
    const { result } = await renderHook(() => useColorSchemePreference());

    await act(() => setColorSchemePreference("dark"));

    expect(result.current).toBe("dark");
    expect(nativewind.colorScheme.set).toHaveBeenCalledWith("dark");
    expect(await asyncStorage.getItem(STORAGE_KEY)).toBe("dark");
  });

  test("loading restores the saved choice", async () => {
    await asyncStorage.setItem(STORAGE_KEY, "light");
    await loadColorSchemePreference();
    expect(nativewind.colorScheme.set).toHaveBeenCalledWith("light");
  });

  test("loading ignores invalid saved values", async () => {
    await asyncStorage.setItem(STORAGE_KEY, "purple");
    await loadColorSchemePreference();
    // On native, "system" is already in effect and nothing needs applying.
    expect(nativewind.colorScheme.set).not.toHaveBeenCalled();
  });

  test("loading survives unavailable storage", async () => {
    asyncStorage.getItem.mockImplementationOnce(() => Promise.reject(new Error("no storage")));
    await expect(loadColorSchemePreference()).resolves.toBeUndefined();
  });
});

describe("useResolvedColorScheme", () => {
  test("follows the scheme on screen", async () => {
    const { result } = await renderHook(() => useResolvedColorScheme());
    expect(result.current).toBe("light");

    await act(() => setColorSchemePreference("dark"));
    expect(result.current).toBe("dark");
  });

  test("resolves 'system' to the device scheme (light in tests)", async () => {
    const { result } = await renderHook(() => useResolvedColorScheme());
    await act(() => setColorSchemePreference("system"));
    expect(result.current).toBe("light");
  });
});
