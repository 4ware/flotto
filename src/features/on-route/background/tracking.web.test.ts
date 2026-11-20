import { describe, expect, test } from "bun:test";

import { getActiveTour, setActiveTour } from "./active-tour";
import { isBackgroundTrackingSupported, isTracking, startTracking, stopTracking } from "./tracking.web";

describe("tracking (web)", () => {
  test("is unsupported", async () => {
    expect(isBackgroundTrackingSupported).toBe(false);
    expect(await startTracking()).toEqual({ ok: false, reason: "unsupported" });
    expect(await isTracking("tour-1")).toBe(false);
  });

  test("stopping still forgets a tour", async () => {
    setActiveTour({
      tourId: "tour-1",
      vehicleId: "v",
      destination: { latitude: 0, longitude: 0 },
      destinationAddress: "",
      position: null,
      reportedAt: null,
      reportError: null,
      askArrival: false,
    });
    await stopTracking();
    expect(getActiveTour()).toBeNull();
  });
});
