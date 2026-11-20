import * as Location from "expo-location";

import type { Position } from "@/lib/api/vehicles";

import { getActiveTour, setActiveTour } from "./active-tour";
import { prepareNotifications } from "./arrival-notification";
import { GEOFENCE_TASK, LOCATION_TASK, REPORT_INTERVAL_MS } from "./tasks";

/** Radius around the destination that counts as arrived. */
export const ARRIVAL_RADIUS_M = 50;

export type TrackingResult =
  | { ok: true }
  | { ok: false; reason: "foreground-denied" | "background-denied" | "unsupported" };

/** Native apps track; the web build can't (see tracking.web.ts). */
export const isBackgroundTrackingSupported = true;

type Tour = { tourId: string; vehicleId: string; destination: Position; destinationAddress: string };

/**
 * Starts reporting the vehicle's position every 10 seconds and watching the destination geofence,
 * both as background tasks that keep running with the app in the background or the screen off.
 * Call while the app is in the foreground (permission prompts, starting the foreground service).
 */
export async function startTracking(tour: Tour): Promise<TrackingResult> {
  if (!isBackgroundTrackingSupported) return { ok: false, reason: "unsupported" };
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) return { ok: false, reason: "foreground-denied" };
  // Android 11+ sends the user to the system settings ("Allow all the time").
  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) return { ok: false, reason: "background-denied" };
  // Without notification permission the tour still runs; arrival is then only asked in the app.
  await prepareNotifications();

  const previous = getActiveTour();
  setActiveTour({
    ...tour,
    position: previous?.tourId === tour.tourId ? previous.position : null,
    reportedAt: null,
    reportError: null,
    askArrival: previous?.tourId === tour.tourId ? previous.askArrival : false,
  });

  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: REPORT_INTERVAL_MS,
    distanceInterval: 0,
    activityType: Location.ActivityType.AutomotiveNavigation,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    // Android keeps tracking through a foreground service, which needs a visible notification.
    foregroundService: {
      notificationTitle: "Tour läuft",
      notificationBody: `Ziel: ${tour.destinationAddress}`,
      notificationColor: "#174f3e",
    },
  });
  // Replaces the regions of an already running geofence task.
  await Location.startGeofencingAsync(GEOFENCE_TASK, [
    {
      identifier: tour.tourId,
      ...tour.destination,
      radius: ARRIVAL_RADIUS_M,
      notifyOnEnter: true,
      notifyOnExit: true,
    },
  ]);
  return { ok: true };
}

/** Stops both tasks and forgets the active tour. Safe to call when nothing runs. */
export async function stopTracking() {
  setActiveTour(null);
  await Promise.all([
    Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
      .then((started) => (started ? Location.stopLocationUpdatesAsync(LOCATION_TASK) : undefined))
      .catch(() => undefined),
    Location.hasStartedGeofencingAsync(GEOFENCE_TASK)
      .then((started) => (started ? Location.stopGeofencingAsync(GEOFENCE_TASK) : undefined))
      .catch(() => undefined),
  ]);
}

/** Whether the background tasks for this tour are running (e.g. after the app was restarted). */
export async function isTracking(tourId: string) {
  if (getActiveTour()?.tourId !== tourId) return false;
  return Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false);
}
