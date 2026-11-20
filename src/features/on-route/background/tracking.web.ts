import { setActiveTour } from "./active-tour";

export const ARRIVAL_RADIUS_M = 50;

export type TrackingResult =
  | { ok: true }
  | { ok: false; reason: "foreground-denied" | "background-denied" | "unsupported" };

/** The web app can't track in the background; the driver uses the mobile app for tours. */
export const isBackgroundTrackingSupported = false;

export async function startTracking(): Promise<TrackingResult> {
  return { ok: false, reason: "unsupported" };
}

export async function stopTracking() {
  setActiveTour(null);
}

export async function isTracking(_tourId: string) {
  return false;
}
