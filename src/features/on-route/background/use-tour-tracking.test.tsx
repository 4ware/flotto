import { describe, expect, test } from "bun:test";

import { makeTour } from "@/test/fixtures";
import { location } from "@/test/native-mocks";
import { act, renderHook, waitFor } from "@/test/render";

import { setActiveTour } from "./active-tour";
import { useTourTracking } from "./use-tour-tracking";

const denied = { granted: false, status: "denied", canAskAgain: true, expires: "never" };

describe("useTourTracking", () => {
  test("geocodes the destination and starts tracking", async () => {
    const { result } = await renderHook(() => useTourTracking(makeTour()));

    await waitFor(() => expect(result.current.status).toBe("running"));
    expect(location.geocodeAsync).toHaveBeenCalledWith("Bahnhofsweg 1, 21244 Buchholz");
    expect(result.current.active).toMatchObject({ tourId: "tour-1", destination: { latitude: 53.2905, longitude: 9.8705 } });
  });

  test("picks up tracking that already runs for the tour", async () => {
    setActiveTour({
      tourId: "tour-1",
      vehicleId: "vehicle-1",
      destination: { latitude: 1, longitude: 2 },
      destinationAddress: "Ziel",
      position: null,
      reportedAt: null,
      reportError: null,
      askArrival: false,
    });
    location.hasStartedLocationUpdatesAsync.mockImplementationOnce(async () => true);

    const { result } = await renderHook(() => useTourTracking(makeTour()));

    await waitFor(() => expect(result.current.status).toBe("running"));
    expect(location.geocodeAsync).not.toHaveBeenCalled();
    expect(location.startLocationUpdatesAsync).not.toHaveBeenCalled();
  });

  test("reports a denied foreground permission", async () => {
    location.requestForegroundPermissionsAsync.mockImplementationOnce(async () => denied);
    const { result } = await renderHook(() => useTourTracking(makeTour()));
    await waitFor(() => expect(result.current.status).toBe("foreground-denied"));
  });

  test("reports a denied background permission", async () => {
    location.requestBackgroundPermissionsAsync.mockImplementationOnce(async () => denied);
    const { result } = await renderHook(() => useTourTracking(makeTour()));
    await waitFor(() => expect(result.current.status).toBe("background-denied"));
  });

  test("reports an address the geocoder can't find", async () => {
    location.geocodeAsync.mockImplementationOnce(async () => []);
    const { result } = await renderHook(() => useTourTracking(makeTour()));
    await waitFor(() => expect(result.current.status).toBe("destination-not-found"));
  });

  test("reports unexpected errors, and retry tries again", async () => {
    location.startLocationUpdatesAsync.mockImplementationOnce(() => Promise.reject(new Error("service failed")));
    const { result } = await renderHook(() => useTourTracking(makeTour()));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("service failed");

    await act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("running"));
  });

  test("does nothing for a completed tour or before the tour loads", async () => {
    await renderHook(() => useTourTracking(makeTour({ status: "complete" })));
    await renderHook(() => useTourTracking(undefined));
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  test("hides another tour's state", async () => {
    setActiveTour({
      tourId: "tour-2",
      vehicleId: "vehicle-1",
      destination: { latitude: 1, longitude: 2 },
      destinationAddress: "Ziel",
      position: null,
      reportedAt: null,
      reportError: null,
      askArrival: true,
    });
    // Still geocoding: the new tour hasn't replaced the old one yet.
    location.geocodeAsync.mockImplementationOnce(() => new Promise(() => {}));
    const { result } = await renderHook(() => useTourTracking(makeTour()));
    expect(result.current.active).toBeNull();
  });
});
