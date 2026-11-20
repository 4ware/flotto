import { describe, expect, test } from "bun:test";

import { location } from "@/test/native-mocks";

import { getActiveTour, setActiveTour } from "./active-tour";
import { GEOFENCE_TASK, LOCATION_TASK } from "./tasks";
import { isTracking, startTracking, stopTracking } from "./tracking";

const tour = {
  tourId: "tour-1",
  vehicleId: "vehicle-1",
  destination: { latitude: 53.2905, longitude: 9.8705 },
  destinationAddress: "Bahnhofsweg 1",
};
const denied = { granted: false, status: "denied", canAskAgain: true, expires: "never" };

describe("startTracking", () => {
  test("starts 10-second location updates and a 50 m geofence", async () => {
    expect(await startTracking(tour)).toEqual({ ok: true });

    expect(location.startLocationUpdatesAsync).toHaveBeenCalledWith(
      LOCATION_TASK,
      expect.objectContaining({
        timeInterval: 10_000,
        foregroundService: expect.objectContaining({ notificationTitle: "Tour läuft", notificationBody: "Ziel: Bahnhofsweg 1" }),
      }),
    );
    expect(location.startGeofencingAsync).toHaveBeenCalledWith(GEOFENCE_TASK, [
      { identifier: "tour-1", ...tour.destination, radius: 50, notifyOnEnter: true, notifyOnExit: true },
    ]);
    expect(getActiveTour()).toMatchObject({ ...tour, position: null, askArrival: false });
  });

  test("stops at a denied foreground permission", async () => {
    location.requestForegroundPermissionsAsync.mockImplementationOnce(async () => denied);
    expect(await startTracking(tour)).toEqual({ ok: false, reason: "foreground-denied" });
    expect(location.startLocationUpdatesAsync).not.toHaveBeenCalled();
  });

  test("stops at a denied background permission", async () => {
    location.requestBackgroundPermissionsAsync.mockImplementationOnce(async () => denied);
    expect(await startTracking(tour)).toEqual({ ok: false, reason: "background-denied" });
    expect(getActiveTour()).toBeNull();
  });

  test("restarting the same tour keeps its last position and question", async () => {
    setActiveTour({ ...tour, position: { latitude: 1, longitude: 2 }, reportedAt: 5, reportError: "x", askArrival: true });
    await startTracking(tour);
    expect(getActiveTour()).toMatchObject({ position: { latitude: 1, longitude: 2 }, askArrival: true, reportError: null });
  });
});

describe("stopTracking", () => {
  test("stops running tasks and forgets the tour", async () => {
    setActiveTour({ ...tour, position: null, reportedAt: null, reportError: null, askArrival: false });
    location.hasStartedLocationUpdatesAsync.mockImplementationOnce(async () => true);
    location.hasStartedGeofencingAsync.mockImplementationOnce(async () => true);

    await stopTracking();

    expect(location.stopLocationUpdatesAsync).toHaveBeenCalledWith(LOCATION_TASK);
    expect(location.stopGeofencingAsync).toHaveBeenCalledWith(GEOFENCE_TASK);
    expect(getActiveTour()).toBeNull();
  });

  test("is safe when nothing runs or the checks fail", async () => {
    location.hasStartedGeofencingAsync.mockImplementationOnce(() => Promise.reject(new Error("no task manager")));
    await expect(stopTracking()).resolves.toBeUndefined();
    expect(location.stopLocationUpdatesAsync).not.toHaveBeenCalled();
  });
});

describe("isTracking", () => {
  test("only for the active tour with running updates", async () => {
    expect(await isTracking("tour-1")).toBe(false);

    setActiveTour({ ...tour, position: null, reportedAt: null, reportError: null, askArrival: false });
    location.hasStartedLocationUpdatesAsync.mockImplementation(async () => true);
    expect(await isTracking("tour-1")).toBe(true);
    expect(await isTracking("tour-2")).toBe(false);
    location.hasStartedLocationUpdatesAsync.mockImplementation(async () => false);
  });
});
