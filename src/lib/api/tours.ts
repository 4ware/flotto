import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

export type TourStatus = "pending" | "started" | "complete";

/** One entry of GET /api/tours/day. */
export type Tour = {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  licensePlate: string;
  startAddress: string;
  destinationAddress: string;
  /** ISO date-time. */
  startsAt: string;
  /** ISO date-time. */
  endsAt: string;
  status: TourStatus;
};

type ToursResponse = { tours: Tour[]; canAdd: boolean; canEdit: boolean };
type DayResponse = ToursResponse & { date: string };

export const toursQueryKey = ["tours", "all"] as const;

/**
 * All of the company's tours, by start. With a vehicle, only that vehicle's;
 * the API has no vehicle filter, so that happens here.
 */
export function useTours(vehicleId: string | null) {
  return useQuery({
    queryKey: toursQueryKey,
    queryFn: () => apiFetch<ToursResponse>("/api/tours/"),
    select: (data) => (vehicleId ? data.tours.filter((tour) => tour.vehicleId === vehicleId) : data.tours),
  });
}

export const todaysToursQueryKey = ["tours", "today"] as const;

/**
 * Today's tours (German time, decided by the server), by start, for one vehicle.
 * The API lists the whole company's tours, so the vehicle is filtered here.
 */
export function useTodaysTours(vehicleId: string | null) {
  return useQuery({
    queryKey: todaysToursQueryKey,
    queryFn: () => apiFetch<DayResponse>("/api/tours/day"),
    enabled: vehicleId !== null,
    select: (data) => data.tours.filter((tour) => tour.vehicleId === vehicleId),
  });
}

export const tourQueryKey = (id: string) => ["tours", "one", id] as const;

/**
 * One tour (GET /api/tours/:id). While it loads, the copy from an already fetched
 * list stands in, so a tour opened from a list shows straight away.
 */
export function useTour(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: tourQueryKey(id),
    queryFn: () => apiFetch<Tour>(`/api/tours/${encodeURIComponent(id)}`),
    placeholderData: () =>
      queryClient
        .getQueriesData<ToursResponse>({ queryKey: ["tours"] })
        .flatMap(([, data]) => data?.tours ?? [])
        .find((tour) => tour.id === id),
  });
}

/** PATCH /api/tours/:id/status, then reload every tour query so lists and the tour itself agree. */
export function useSetTourStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TourStatus }) =>
      apiFetch<{ id: string }>(`/api/tours/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tours"] }),
  });
}
