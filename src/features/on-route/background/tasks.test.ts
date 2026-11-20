import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { AppState } from "react-native";

import { notifications, runTask } from "@/test/native-mocks";
import { bodyOf, mockApi } from "@/test/render";

import { getActiveTour, setActiveTour } from "./active-tour";
import { GEOFENCE_TASK, LOCATION_TASK } from "./tasks";

const destination = { latitude: 53.2905, longitude: 9.8705 };
const at = (latitude: number, longitude: number) => ({ locations: [{ coords: { latitude, longitude }, timestamp: 0 }] });

beforeEach(() => {
  setActiveTour({
    tourId: "tour-1",
    vehicleId: "vehicle-1",
    destination,
    destinationAddress: "Bahnhofsweg 1",
    position: null,
    reportedAt: null,
    reportError: null,
    askArrival: false,
  });
});
afterEach(() => (AppState as unknown as { __set: (s: string) => void }).__set("active"));

describe("task names", () => {
  test("match the web module's (tasks.web.test.ts)", () => {
    expect(LOCATION_TASK).toBe("flotto.location");
    expect(GEOFENCE_TASK).toBe("flotto.geofence");
  });
});

describe("location task", () => {
  test("reports a new position to the API", async () => {
    const fetch = mockApi({ "PATCH /api/vehicles/vehicle-1/position": { body: { moved: true } } });

    await runTask(LOCATION_TASK, at(53.327, 9.8715));

    expect(bodyOf(fetch.mock.calls[0])).toEqual({ latitude: 53.327, longitude: 9.8715 });
    expect(getActiveTour()).toMatchObject({ position: { latitude: 53.327, longitude: 9.8715 }, reportError: null });
  });

  test("uses the newest of several locations", async () => {
    const fetch = mockApi({ "PATCH /api/vehicles/vehicle-1/position": { body: { moved: true } } });
    await runTask(LOCATION_TASK, {
      locations: [{ coords: { latitude: 1, longitude: 1 } }, { coords: { latitude: 53.3, longitude: 9.9 } }],
    });
    expect(bodyOf(fetch.mock.calls[0])).toEqual({ latitude: 53.3, longitude: 9.9 });
  });

  test("skips GPS jitter below about a metre", async () => {
    const fetch = mockApi({ "PATCH /api/vehicles/vehicle-1/position": { body: { moved: true } } });
    await runTask(LOCATION_TASK, at(53.327, 9.8715));
    await runTask(LOCATION_TASK, at(53.327000004, 9.871500004));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("reports at most every 10 seconds (iOS delivers by distance)", async () => {
    const fetch = mockApi({ "PATCH /api/vehicles/vehicle-1/position": { body: { moved: true } } });
    await runTask(LOCATION_TASK, at(53.327, 9.8715));
    await runTask(LOCATION_TASK, at(53.32, 9.87));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("keeps a failed report's error for the screen", async () => {
    mockApi({ "PATCH /api/vehicles/vehicle-1/position": { status: 500 } });
    await runTask(LOCATION_TASK, at(53.327, 9.8715));
    expect(getActiveTour()?.reportError).toBe("Das hat leider nicht geklappt. Bitte versuchen Sie es erneut.");
  });

  test("does nothing without an active tour or on errors", async () => {
    const fetch = mockApi({});
    await runTask(LOCATION_TASK, at(53.327, 9.8715), { message: "no fix" });
    setActiveTour(null);
    await runTask(LOCATION_TASK, at(53.327, 9.8715));
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("geofence task", () => {
  const event = (eventType: number, identifier = "tour-1") => ({ eventType, region: { identifier, ...destination, radius: 50 } });

  test("entering asks about arrival; in the foreground without a notification", async () => {
    await runTask(GEOFENCE_TASK, event(1));
    expect(getActiveTour()?.askArrival).toBe(true);
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test("entering in the background also sends a notification", async () => {
    (AppState as unknown as { __set: (s: string) => void }).__set("background");
    await runTask(GEOFENCE_TASK, event(1));
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  test("leaving re-arms the question", async () => {
    await runTask(GEOFENCE_TASK, event(1));
    await runTask(GEOFENCE_TASK, event(2));
    expect(getActiveTour()?.askArrival).toBe(false);
  });

  test("ignores other tours' fences", async () => {
    await runTask(GEOFENCE_TASK, event(1, "tour-2"));
    expect(getActiveTour()?.askArrival).toBe(false);
  });
});
