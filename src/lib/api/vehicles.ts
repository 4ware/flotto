import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

/** One entry of GET /api/vehicles. */
export type Vehicle = {
  id: string;
  licensePlate: string;
  /** Odometer reading in km. */
  mileage: number | null;
  latitude: number | null;
  longitude: number | null;
};

type VehiclesResponse = { vehicles: Vehicle[]; canAdd: boolean; canEdit: boolean };

export const vehiclesQueryKey = ["vehicles"] as const;

/** The company's vehicles, sorted by licence plate (server-side). */
export function useVehicles() {
  return useQuery({
    queryKey: vehiclesQueryKey,
    queryFn: () => apiFetch<VehiclesResponse>("/api/vehicles/"),
    select: (data) => data.vehicles,
  });
}
