import { afterEach, beforeEach, describe, expect, test, setSystemTime } from "bun:test";

import { makeTour, makeVehicle, toursBody, vehiclesBody } from "@/test/fixtures";
import { mockApi, renderWithProviders, screen } from "@/test/render";

import { ToursScreen } from "./tours-screen";

const chooseVehicle = (id: string) => localStorage.setItem("flotto.app-state", JSON.stringify({ choosenVehicleId: id }));

beforeEach(() => setSystemTime(new Date("2026-11-20T09:00:00Z")));
afterEach(() => setSystemTime());

const tours = [
  makeTour({ id: "past", startsAt: "2026-11-18T08:00:00Z", endsAt: "2026-11-18T09:00:00Z", customerName: "Alt" }),
  makeTour({ id: "today", startsAt: "2026-11-20T08:00:00Z", endsAt: "2026-11-20T09:00:00Z", customerName: "Heute GmbH" }),
  makeTour({ id: "tomorrow", startsAt: "2026-11-21T08:00:00Z", endsAt: "2026-11-21T09:00:00Z", customerName: "Morgen AG" }),
  makeTour({ id: "other", vehicleId: "vehicle-2", customerName: "Fremd" }),
];

describe("ToursScreen", () => {
  test("groups the chosen vehicle's tours by day: upcoming first, then the past", async () => {
    chooseVehicle("vehicle-1");
    mockApi({
      "GET /api/tours/": { body: toursBody(tours) },
      "GET /api/vehicles/": { body: vehiclesBody([makeVehicle()]) },
    });
    await renderWithProviders(<ToursScreen />);

    expect(await screen.findByText("Fahrzeug WL-FD 509")).toBeOnTheScreen();
    const headings = ["Heute", "Morgen", "Mi., 18.11.2026"].map((label) => screen.getByText(label));
    const order = screen.getAllByText(/^(Heute|Morgen|Mi\., 18\.11\.2026)$/);
    expect(order).toEqual(headings);
    expect(screen.queryByText("Kunde · Fremd")).not.toBeOnTheScreen();
  });

  test("lists every vehicle's tours without a chosen vehicle", async () => {
    mockApi({ "GET /api/tours/": { body: toursBody(tours) }, "GET /api/vehicles/": { body: vehiclesBody([]) } });
    await renderWithProviders(<ToursScreen />);

    expect(await screen.findByText("Kunde · Fremd")).toBeOnTheScreen();
    expect(screen.getByText("Alle Fahrzeuge")).toBeOnTheScreen();
  });

  test("says when there are no tours", async () => {
    chooseVehicle("vehicle-1");
    mockApi({ "GET /api/tours/": { body: toursBody([]) }, "GET /api/vehicles/": { body: vehiclesBody([makeVehicle()]) } });
    await renderWithProviders(<ToursScreen />);
    expect(await screen.findByText("Für dieses Fahrzeug sind keine Touren geplant.")).toBeOnTheScreen();
  });

  test("shows errors with a retry button", async () => {
    mockApi({ "GET /api/tours/": { status: 500 }, "GET /api/vehicles/": { body: vehiclesBody([]) } });
    await renderWithProviders(<ToursScreen />);
    expect(await screen.findByText("Das hat leider nicht geklappt. Bitte versuchen Sie es erneut.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeOnTheScreen();
  });
});
