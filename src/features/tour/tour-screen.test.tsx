import { afterEach, beforeEach, describe, expect, test, setSystemTime } from "bun:test";

import { makeTour } from "@/test/fixtures";
import { router } from "@/test/native-mocks";
import { mockApi, renderWithProviders, screen, userEvent } from "@/test/render";

import { TourScreen } from "./tour-screen";

beforeEach(() => setSystemTime(new Date("2026-11-20T09:00:00Z")));
afterEach(() => setSystemTime());

describe("TourScreen", () => {
  test("shows the tour's details", async () => {
    mockApi({ "GET /api/tours/tour-1": { body: makeTour() } });
    await renderWithProviders(<TourScreen id="tour-1" />);

    expect(await screen.findByText("16:35 – 17:00")).toBeOnTheScreen();
    expect(screen.getByText("Heute · WL-FD 509")).toBeOnTheScreen();
    expect(screen.getByText("Ausstehend")).toBeOnTheScreen();
    expect(screen.getByText("Hermann-Burgdorf-Str. 94, 21244 Buchholz")).toBeOnTheScreen();
    expect(screen.getByText("Bahnhofsweg 1, 21244 Buchholz")).toBeOnTheScreen();
    expect(screen.getByText("16:35 Uhr")).toBeOnTheScreen();
    expect(screen.getByText("17:00 Uhr")).toBeOnTheScreen();
    expect(screen.getByText("Kalle Schumpk")).toBeOnTheScreen();
  });

  test("names the end's day when a tour runs past midnight", async () => {
    mockApi({
      "GET /api/tours/tour-1": { body: makeTour({ startsAt: "2026-11-20T22:00:00Z", endsAt: "2026-11-21T01:00:00Z" }) },
    });
    await renderWithProviders(<TourScreen id="tour-1" />);
    expect(await screen.findByText("Morgen, 02:00 Uhr")).toBeOnTheScreen();
  });

  test("starting a pending tour sets it to started and opens the route", async () => {
    const fetch = mockApi({
      "GET /api/tours/tour-1": { body: makeTour() },
      "PATCH /api/tours/tour-1/status": { body: { id: "tour-1" } },
    });
    await renderWithProviders(<TourScreen id="tour-1" />);

    await userEvent.setup().press(await screen.findByRole("button", { name: "Tour starten" }));

    const patch = fetch.mock.calls.find(([, init]) => (init as RequestInit)?.method === "PATCH")!;
    expect(JSON.parse(String((patch[1] as RequestInit).body))).toEqual({ status: "started" });
    expect(router.push).toHaveBeenCalledWith({ pathname: "/on-route/[id]", params: { id: "tour-1" } });
  });

  test("shows the API's error when starting fails", async () => {
    mockApi({
      "GET /api/tours/tour-1": { body: makeTour() },
      "PATCH /api/tours/tour-1/status": { status: 403, body: { message: "Errors.notAllowed" } },
    });
    await renderWithProviders(<TourScreen id="tour-1" />);

    await userEvent.setup().press(await screen.findByRole("button", { name: "Tour starten" }));

    expect(await screen.findByText("Dazu fehlt Ihnen die Berechtigung.")).toBeOnTheScreen();
    expect(router.push).not.toHaveBeenCalled();
  });

  test("a started tour opens its route view", async () => {
    mockApi({ "GET /api/tours/tour-1": { body: makeTour({ status: "started" }) } });
    await renderWithProviders(<TourScreen id="tour-1" />);

    await userEvent.setup().press(await screen.findByRole("button", { name: "Unterwegs-Ansicht öffnen" }));

    expect(router.push).toHaveBeenCalledWith({ pathname: "/on-route/[id]", params: { id: "tour-1" } });
    expect(screen.queryByRole("button", { name: "Tour starten" })).not.toBeOnTheScreen();
  });

  test("a complete tour has no actions", async () => {
    mockApi({ "GET /api/tours/tour-1": { body: makeTour({ status: "complete" }) } });
    await renderWithProviders(<TourScreen id="tour-1" />);

    expect(await screen.findByText("Abgeschlossen")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Tour starten" })).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Unterwegs-Ansicht öffnen" })).not.toBeOnTheScreen();
  });

  test("an unknown tour offers the way back to the list", async () => {
    mockApi({ "GET /api/tours/nope": { status: 404, body: { message: "Errors.tourNotFound" } } });
    router.canGoBack.mockImplementation(() => false);
    await renderWithProviders(<TourScreen id="nope" />);

    expect(await screen.findByText("Diese Tour wurde nicht gefunden.")).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole("button", { name: "Zur Tourenliste" }));
    expect(router.replace).toHaveBeenCalledWith("/touren");
  });

  test("other errors offer a retry", async () => {
    mockApi({ "GET /api/tours/tour-1": { status: 500 } });
    await renderWithProviders(<TourScreen id="tour-1" />);
    expect(await screen.findByRole("button", { name: "Erneut versuchen" })).toBeOnTheScreen();
  });

  test("the back button goes back", async () => {
    mockApi({ "GET /api/tours/tour-1": { body: makeTour() } });
    await renderWithProviders(<TourScreen id="tour-1" />);
    await userEvent.setup().press(screen.getByRole("button", { name: "Zurück" }));
    expect(router.back).toHaveBeenCalled();
  });
});
