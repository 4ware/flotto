import { afterEach, describe, expect, test, setSystemTime } from "bun:test";

import { sessionQueryKey } from "@/lib/api/auth";
import { dayBody, makeTour, makeVehicle, session, vehiclesBody } from "@/test/fixtures";
import { router } from "@/test/native-mocks";
import { createTestQueryClient, mockApi, renderWithProviders, screen, userEvent } from "@/test/render";

import { TodayScreen } from "./today-screen";

afterEach(() => setSystemTime());

const chooseVehicle = (id: string) => localStorage.setItem("flotto.app-state", JSON.stringify({ choosenVehicleId: id }));

function signedIn() {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(sessionQueryKey, session);
  return { queryClient };
}

describe("TodayScreen", () => {
  test("greets the driver and lists the vehicle's tours for today", async () => {
    setSystemTime(new Date(2026, 10, 20, 9, 0));
    chooseVehicle("vehicle-1");
    mockApi({
      "GET /api/tours/day": { body: dayBody([makeTour(), makeTour({ id: "x", vehicleId: "vehicle-2", customerName: "Fremd" })]) },
      "GET /api/vehicles/": { body: vehiclesBody([makeVehicle()]) },
    });
    await renderWithProviders(<TodayScreen />, signedIn());

    expect(screen.getByText("Guten Morgen, Kai")).toBeOnTheScreen();
    expect(await screen.findByText("Heute · 1 Tour")).toBeOnTheScreen();
    expect(await screen.findByText("WL-FD 509")).toBeOnTheScreen();
    expect(screen.getByText("Kunde · Kalle Schumpk")).toBeOnTheScreen();
    expect(screen.queryByText("Kunde · Fremd")).not.toBeOnTheScreen();
  });

  test.each([
    [10, "Guten Morgen"],
    [11, "Guten Tag"],
    [17, "Guten Tag"],
    [18, "Guten Abend"],
  ])("at %i o'clock says %s", async (hour, greeting) => {
    setSystemTime(new Date(2026, 10, 20, hour, 0));
    await renderWithProviders(<TodayScreen />, signedIn());
    expect(screen.getByText(`${greeting}, Kai`)).toBeOnTheScreen();
  });

  test("counts several tours", async () => {
    chooseVehicle("vehicle-1");
    mockApi({
      "GET /api/tours/day": { body: dayBody([makeTour(), makeTour({ id: "t2" })]) },
      "GET /api/vehicles/": { body: vehiclesBody([makeVehicle()]) },
    });
    await renderWithProviders(<TodayScreen />, signedIn());
    expect(await screen.findByText("Heute · 2 Touren")).toBeOnTheScreen();
  });

  test("asks to choose a vehicle first", async () => {
    mockApi({ "GET /api/vehicles/": { body: vehiclesBody([]) } });
    await renderWithProviders(<TodayScreen />, signedIn());

    expect(screen.getByText("Kein Fahrzeug gewählt")).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole("button", { name: "Fahrzeug wählen" }));
    expect(router.navigate).toHaveBeenCalledWith("/fahrzeug");
  });

  test("says when no tours are planned today", async () => {
    chooseVehicle("vehicle-1");
    mockApi({ "GET /api/tours/day": { body: dayBody([]) }, "GET /api/vehicles/": { body: vehiclesBody([makeVehicle()]) } });
    await renderWithProviders(<TodayScreen />, signedIn());
    expect(await screen.findByText("Für dieses Fahrzeug sind heute keine Touren geplant.")).toBeOnTheScreen();
  });

  test("shows errors with a retry that loads again", async () => {
    chooseVehicle("vehicle-1");
    let fail = true;
    mockApi({
      "GET /api/tours/day": () => (fail ? { status: 500 } : { body: dayBody([makeTour()]) }),
      "GET /api/vehicles/": { body: vehiclesBody([makeVehicle()]) },
    });
    await renderWithProviders(<TodayScreen />, signedIn());
    expect(await screen.findByText("Das hat leider nicht geklappt. Bitte versuchen Sie es erneut.")).toBeOnTheScreen();

    fail = false;
    await userEvent.setup().press(screen.getByRole("button", { name: "Erneut versuchen" }));

    expect(await screen.findByText("Kunde · Kalle Schumpk")).toBeOnTheScreen();
  });
});
