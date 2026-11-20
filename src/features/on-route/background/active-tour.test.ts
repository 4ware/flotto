import { describe, expect, mock, test } from "bun:test";

import { act, renderHook } from "@/test/render";

import { getActiveTour, setActiveTour, updateActiveTour, useActiveTour, type ActiveTour } from "./active-tour";

const tour: ActiveTour = {
  tourId: "tour-1",
  vehicleId: "vehicle-1",
  destination: { latitude: 53.29, longitude: 9.87 },
  destinationAddress: "Bahnhofsweg 1",
  position: null,
  reportedAt: null,
  reportError: null,
  askArrival: false,
};

describe("active tour", () => {
  test("is saved so the background tasks find it after a restart", () => {
    setActiveTour(tour);
    expect(getActiveTour()).toEqual(tour);
    expect(JSON.parse(localStorage.getItem("flotto.active-tour")!)).toEqual(tour);
  });

  test("clearing removes it from storage", () => {
    setActiveTour(tour);
    setActiveTour(null);
    expect(getActiveTour()).toBeNull();
    expect(localStorage.getItem("flotto.active-tour")).toBeNull();
  });

  test("updates merge, and are ignored without an active tour", () => {
    updateActiveTour({ askArrival: true });
    expect(getActiveTour()).toBeNull();

    setActiveTour(tour);
    updateActiveTour({ askArrival: true });
    expect(getActiveTour()).toEqual({ ...tour, askArrival: true });
  });

  test("keeps working when storage fails", () => {
    const setItem = mock(() => {
      throw new Error("full");
    });
    const original = localStorage.setItem;
    localStorage.setItem = setItem;
    try {
      setActiveTour(tour);
      expect(getActiveTour()).toEqual(tour);
    } finally {
      localStorage.setItem = original;
    }
  });

  test("useActiveTour re-renders on changes", async () => {
    const { result } = await renderHook(() => useActiveTour());
    expect(result.current).toBeNull();

    await act(() => setActiveTour(tour));
    expect(result.current?.tourId).toBe("tour-1");

    await act(() => updateActiveTour({ position: { latitude: 1, longitude: 2 } }));
    expect(result.current?.position).toEqual({ latitude: 1, longitude: 2 });
  });
});
