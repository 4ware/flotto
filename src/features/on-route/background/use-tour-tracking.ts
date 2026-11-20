import { useEffect, useState } from "react";
import * as Location from "expo-location";

import type { Tour } from "@/lib/api/tours";

import { useActiveTour } from "./active-tour";
import { isBackgroundTrackingSupported, isTracking, startTracking } from "./tracking";

export type TrackingStatus =
  | "unsupported"
  | "starting"
  | "running"
  | "foreground-denied"
  | "background-denied"
  | "destination-not-found"
  | "error";

/**
 * Makes sure the background tasks run for this tour: geocodes the destination (needs the
 * foreground permission on Android, and shouldn't run in the background) and starts tracking,
 * unless it already runs for this tour, e.g. after the app was closed and reopened.
 */
export function useTourTracking(tour: Tour | undefined) {
  const active = useActiveTour();
  const [status, setStatus] = useState<TrackingStatus>("starting");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const tourId = tour?.id;
  const runnable = !!tour && tour.status !== "complete";

  useEffect(() => {
    if (!tour || !runnable) return;
    let cancelled = false;
    const set = (next: TrackingStatus) => !cancelled && setStatus(next);

    void (async () => {
      try {
        if (!isBackgroundTrackingSupported) return set("unsupported");
        set("starting");
        if (await isTracking(tour.id)) return set("running");

        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (!granted) return set("foreground-denied");

        const [found] = await Location.geocodeAsync(tour.destinationAddress);
        if (!found) return set("destination-not-found");

        const result = await startTracking({
          tourId: tour.id,
          vehicleId: tour.vehicleId,
          destination: { latitude: found.latitude, longitude: found.longitude },
          destinationAddress: tour.destinationAddress,
        });
        set(result.ok ? "running" : result.reason);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
    // Restart only for another tour or an explicit retry, not for every refetch of the same tour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, runnable, attempt]);

  return {
    status,
    error,
    retry: () => setAttempt((n) => n + 1),
    /** The task-fed state, only when it belongs to this tour. */
    active: active?.tourId === tourId ? active : null,
  };
}
