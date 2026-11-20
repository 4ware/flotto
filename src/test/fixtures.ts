// Test data shaped like the API's answers.
import type { Session } from "@/lib/api/auth";
import type { Tour } from "@/lib/api/tours";
import type { Vehicle } from "@/lib/api/vehicles";

export const session: Session = {
  user: { name: "Kai Beispiel", email: "kai@example.com" },
  organization: { id: "org-1", name: "Spedition Nord", role: "driver" },
};

export function makeTour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: "tour-1",
    customerId: "customer-1",
    customerName: "Kalle Schumpk",
    vehicleId: "vehicle-1",
    licensePlate: "WL-FD 509",
    startAddress: "Hermann-Burgdorf-Str. 94, 21244 Buchholz",
    destinationAddress: "Bahnhofsweg 1, 21244 Buchholz",
    // 16:35 – 17:00 German time (CET, UTC+1).
    startsAt: "2026-11-20T15:35:00.000Z",
    endsAt: "2026-11-20T16:00:00.000Z",
    status: "pending",
    ...overrides,
  };
}

export function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return { id: "vehicle-1", licensePlate: "WL-FD 509", mileage: 123456, latitude: null, longitude: null, ...overrides };
}

export const toursBody = (tours: Tour[]) => ({ tours, canAdd: false, canEdit: false });
export const dayBody = (tours: Tour[], date = "2026-11-20") => ({ date, ...toursBody(tours) });
export const vehiclesBody = (vehicles: Vehicle[]) => ({ vehicles, canAdd: false, canEdit: false });
