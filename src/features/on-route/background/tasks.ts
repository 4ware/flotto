// Background tasks for a running tour. Imported at the top of src/app/_layout.tsx:
// TaskManager.defineTask must run at module load, also when Android starts the app only for a task.
import "@/state/install-local-storage";

import { AppState } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { apiFetch } from "@/lib/api/client";
import type { Position } from "@/lib/api/vehicles";

import { getActiveTour, updateActiveTour } from "./active-tour";
import { notifyArrival } from "./arrival-notification";

export const LOCATION_TASK = "flotto.location";
export const GEOFENCE_TASK = "flotto.geofence";

/** Android delivers every 10 s (timeInterval); iOS by distance, so reports are throttled here too. */
export const REPORT_INTERVAL_MS = 10_000;

// ~1 m: smaller differences are GPS jitter, not movement.
const PRECISION = 1e5;
const samePlace = (a: Position, b: Position) =>
  Math.round(a.latitude * PRECISION) === Math.round(b.latitude * PRECISION) &&
  Math.round(a.longitude * PRECISION) === Math.round(b.longitude * PRECISION);

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(LOCATION_TASK, async ({ data, error }) => {
  const tour = getActiveTour();
  if (error || !tour || !data?.locations.length) return;

  const { coords } = data.locations[data.locations.length - 1];
  const position = { latitude: coords.latitude, longitude: coords.longitude };
  if (tour.position && samePlace(tour.position, position)) return;
  if (tour.reportedAt && Date.now() - tour.reportedAt < REPORT_INTERVAL_MS - 1_000) return;

  updateActiveTour({ position, reportedAt: Date.now() });
  try {
    await apiFetch(`/api/vehicles/${encodeURIComponent(tour.vehicleId)}/position`, { method: "PATCH", body: position });
    updateActiveTour({ reportError: null });
  } catch (reportError) {
    updateActiveTour({ reportError: reportError instanceof Error ? reportError.message : String(reportError) });
  }
});

TaskManager.defineTask<{ eventType: Location.GeofencingEventType; region: Location.LocationRegion }>(
  GEOFENCE_TASK,
  async ({ data, error }) => {
    const tour = getActiveTour();
    if (error || !tour || data?.region.identifier !== tour.tourId) return;

    if (data.eventType === Location.GeofencingEventType.Enter) {
      updateActiveTour({ askArrival: true });
      // In the foreground the on-route screen asks with a modal instead.
      if (AppState.currentState !== "active") await notifyArrival(tour.tourId, tour.destinationAddress);
    } else if (data.eventType === Location.GeofencingEventType.Exit) {
      // Leaving re-arms the question after a "not yet".
      updateActiveTour({ askArrival: false });
    }
  },
);
