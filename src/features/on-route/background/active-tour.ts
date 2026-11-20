import { useSyncExternalStore } from "react";

import type { Position } from "@/lib/api/vehicles";

/**
 * The tour being driven, shared between the background tasks (no React there) and the screens.
 * Persisted, because Android may restart the app just to run a task.
 */
export type ActiveTour = {
  tourId: string;
  vehicleId: string;
  destination: Position;
  destinationAddress: string;
  /** Last position read by the location task. */
  position: Position | null;
  /** When `position` was last sent to the API (ms since epoch). */
  reportedAt: number | null;
  /** The last report's error, cleared by the next success. */
  reportError: string | null;
  /** Inside the destination geofence and not yet answered with "not yet". */
  askArrival: boolean;
};

const STORAGE_KEY = "flotto.active-tour";

function read(): ActiveTour | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActiveTour) : null;
  } catch {
    return null;
  }
}

let current = read();
const listeners = new Set<() => void>();

export const getActiveTour = () => current;

export function setActiveTour(next: ActiveTour | null) {
  current = next;
  try {
    if (next) globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next));
    else globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: keep working from memory.
  }
  listeners.forEach((listener) => listener());
}

/** Merge into the active tour; ignored when none is active (e.g. a late task event after finishing). */
export function updateActiveTour(patch: Partial<ActiveTour>) {
  if (current) setActiveTour({ ...current, ...patch });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useActiveTour() {
  return useSyncExternalStore(subscribe, getActiveTour, getActiveTour);
}
