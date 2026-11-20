import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export type Position = { latitude: number; longitude: number };

/** PATCH /api/vehicles/:id/position (open to drivers); keeps the cached vehicle list in step. */
export function useReportPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, position }: { vehicleId: string; position: Position }) =>
      apiFetch<{ moved: boolean }>(`/api/vehicles/${encodeURIComponent(vehicleId)}/position`, {
        method: "PATCH",
        body: position,
      }),
    onSuccess: (_, { vehicleId, position }) =>
      queryClient.setQueryData<VehiclesResponse>(vehiclesQueryKey, (data) =>
        data && { ...data, vehicles: data.vehicles.map((v) => (v.id === vehicleId ? { ...v, ...position } : v)) },
      ),
  });
}
