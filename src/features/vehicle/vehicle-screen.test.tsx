import { describe, expect, test } from "bun:test";

import { makeVehicle, vehiclesBody } from "@/test/fixtures";
import { router } from "@/test/native-mocks";
import { mockApi, renderWithProviders, screen, userEvent } from "@/test/render";

import { VehicleScreen } from "./vehicle-screen";

const vehicles = [
  makeVehicle({ id: "v1", licensePlate: "WL-FD 509", mileage: 123456 }),
  makeVehicle({ id: "v2", licensePlate: "HH-AB 12", mileage: null, latitude: 53.3, longitude: 9.9 }),
];

const stored = () => JSON.parse(localStorage.getItem("flotto.app-state") ?? "{}");

describe("VehicleScreen", () => {
  test("lists the vehicles with mileage and position", async () => {
    mockApi({ "GET /api/vehicles/": { body: vehiclesBody(vehicles) } });
    await renderWithProviders(<VehicleScreen />);

    expect(await screen.findByText("WL-FD 509")).toBeOnTheScreen();
    expect(screen.getByText("123.456 km")).toBeOnTheScreen();
    expect(screen.getByText("Kilometerstand unbekannt")).toBeOnTheScreen();
    expect(screen.getByText("Position bekannt")).toBeOnTheScreen();
    expect(screen.getByText("Fahrzeug wählen")).toBeOnTheScreen();
  });

  test("choosing a vehicle remembers it and opens today's overview", async () => {
    mockApi({ "GET /api/vehicles/": { body: vehiclesBody(vehicles) } });
    await renderWithProviders(<VehicleScreen />);

    await userEvent.setup().press(await screen.findByRole("button", { name: /HH-AB 12/ }));

    expect(stored().choosenVehicleId).toBe("v2");
    expect(router.navigate).toHaveBeenCalledWith("/");
    expect(screen.getByRole("button", { name: /HH-AB 12/ })).toBeSelected();
  });

  test("leaving the vehicle forgets it", async () => {
    localStorage.setItem("flotto.app-state", JSON.stringify({ choosenVehicleId: "v1" }));
    mockApi({ "GET /api/vehicles/": { body: vehiclesBody(vehicles) } });
    await renderWithProviders(<VehicleScreen />);
    expect(await screen.findByText("Tippen Sie auf ein anderes Fahrzeug, um zu wechseln.")).toBeOnTheScreen();

    await userEvent.setup().press(screen.getByRole("button", { name: "Fahrzeug verlassen" }));

    expect(stored().choosenVehicleId).toBeNull();
    expect(screen.queryByRole("button", { name: "Fahrzeug verlassen" })).not.toBeOnTheScreen();
  });

  test("says when the company has no vehicles", async () => {
    mockApi({ "GET /api/vehicles/": { body: vehiclesBody([]) } });
    await renderWithProviders(<VehicleScreen />);
    expect(await screen.findByText("Noch keine Fahrzeuge angelegt.")).toBeOnTheScreen();
  });

  test("shows errors with a retry button", async () => {
    mockApi({ "GET /api/vehicles/": { status: 500 } });
    await renderWithProviders(<VehicleScreen />);
    expect(await screen.findByRole("button", { name: "Erneut versuchen" })).toBeOnTheScreen();
  });
});
