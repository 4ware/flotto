import { describe, expect, test } from "bun:test";
import { renderHook } from "@testing-library/react-native";

import { act, renderHookWithProviders } from "@/test/render";

import { defaultAppState, useAppState } from "./app-state";

const STORAGE_KEY = "flotto.app-state";

describe("useAppState", () => {
  test("starts with the defaults", async () => {
    const { result } = await renderHookWithProviders(() => useAppState());
    expect(result.current.choosenVehicleId).toBe(defaultAppState.choosenVehicleId);
  });

  test("restores the saved state, filling in new fields with defaults", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choosenVehicleId: "vehicle-1" }));
    const { result } = await renderHookWithProviders(() => useAppState());
    expect(result.current.choosenVehicleId).toBe("vehicle-1");
  });

  test("ignores broken saved state", async () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    const { result } = await renderHookWithProviders(() => useAppState());
    expect(result.current.choosenVehicleId).toBeNull();
  });

  test("saves changes", async () => {
    const { result } = await renderHookWithProviders(() => useAppState());
    await act(() => result.current.setChoosenVehicleId("vehicle-2"));

    expect(result.current.choosenVehicleId).toBe("vehicle-2");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ choosenVehicleId: "vehicle-2" });
  });

  test("update merges and reset goes back to the defaults", async () => {
    const { result } = await renderHookWithProviders(() => useAppState());
    await act(() => result.current.update({ choosenVehicleId: "vehicle-3" }));
    expect(result.current.choosenVehicleId).toBe("vehicle-3");

    await act(() => result.current.reset());
    expect(result.current.choosenVehicleId).toBeNull();
  });

  test("throws outside the provider", async () => {
    await expect(renderHook(() => useAppState())).rejects.toThrow("inside <AppStateProvider>");
  });
});
