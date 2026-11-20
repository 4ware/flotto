import { describe, expect, test } from "bun:test";

import { makeTour } from "@/test/fixtures";
import { location, router } from "@/test/native-mocks";
import { act, mockApi, renderWithProviders, screen, userEvent, waitFor } from "@/test/render";
import { Linking } from "react-native";

import { getActiveTour, updateActiveTour } from "./background/active-tour";
import { OnRouteScreen } from "./on-route-screen";

const denied = { granted: false, status: "denied", canAskAgain: true, expires: "never" };
const position = { latitude: 53.327, longitude: 9.8715 };

async function renderRunning(tour = makeTour({ status: "started" })) {
  const fetch = mockApi({
    "GET /api/tours/tour-1": { body: tour },
    "PATCH /api/tours/tour-1/status": { body: { id: "tour-1" } },
  });
  await renderWithProviders(<OnRouteScreen id="tour-1" />);
  await waitFor(() => expect(getActiveTour()?.tourId).toBe("tour-1"));
  return fetch;
}

describe("OnRouteScreen", () => {
  test("shows the tour in the header and waits for the first position", async () => {
    await renderRunning();

    expect(await screen.findByText("Bahnhofsweg 1, 21244 Buchholz")).toBeOnTheScreen();
    expect(screen.getByText("16:35 – 17:00 · WL-FD 509 · Kalle Schumpk")).toBeOnTheScreen();
    expect(screen.getByText("Von Hermann-Burgdorf-Str. 94, 21244 Buchholz")).toBeOnTheScreen();
    expect(screen.getByText("Standort wird ermittelt …")).toBeOnTheScreen();
  });

  test("shows the map once the location task reports a position", async () => {
    await renderRunning();
    await act(() => updateActiveTour({ position }));

    expect(screen.container.queryAll((node) => node.type === "MapView")).toHaveLength(1);
    expect(screen.queryByText("Standort wird ermittelt …")).not.toBeOnTheScreen();
  });

  test("shows failed position reports", async () => {
    await renderRunning();
    await act(() => updateActiveTour({ position, reportError: "Netzwerkfehler" }));
    expect(screen.getByText("Position konnte nicht gemeldet werden: Netzwerkfehler")).toBeOnTheScreen();
  });

  test("arriving asks; confirming completes the tour, stops tracking and goes to Heute", async () => {
    const fetch = await renderRunning();
    await act(() => updateActiveTour({ position, askArrival: true }));

    await userEvent.setup().press(screen.getByRole("button", { name: "Ja, Tour abschließen" }));

    await waitFor(() => expect(router.dismissTo).toHaveBeenCalledWith("/"));
    const patch = fetch.mock.calls.find(([, init]) => (init as RequestInit)?.method === "PATCH")!;
    expect(JSON.parse(String((patch[1] as RequestInit).body))).toEqual({ status: "complete" });
    expect(getActiveTour()).toBeNull();
  });

  test("'not yet' closes the question", async () => {
    await renderRunning();
    await act(() => updateActiveTour({ position, askArrival: true }));

    await userEvent.setup().press(screen.getByRole("button", { name: "Noch nicht" }));

    expect(getActiveTour()?.askArrival).toBe(false);
    expect(screen.queryByText("Ziel erreicht?")).not.toBeOnTheScreen();
  });

  test("explains a denied permission and links to the settings", async () => {
    location.requestBackgroundPermissionsAsync.mockImplementationOnce(async () => denied);
    mockApi({ "GET /api/tours/tour-1": { body: makeTour({ status: "started" }) } });
    await renderWithProviders(<OnRouteScreen id="tour-1" />);

    expect(await screen.findByText(/„Immer zulassen“/)).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole("button", { name: "Einstellungen öffnen" }));
    expect(Linking.openSettings).toHaveBeenCalled();
  });

  test("an unknown destination can be retried", async () => {
    location.geocodeAsync.mockImplementationOnce(async () => []);
    mockApi({ "GET /api/tours/tour-1": { body: makeTour({ status: "started" }) } });
    await renderWithProviders(<OnRouteScreen id="tour-1" />);

    expect(await screen.findByText("Das Ziel wurde auf der Karte nicht gefunden.")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Einstellungen öffnen" })).not.toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole("button", { name: "Erneut versuchen" }));

    await waitFor(() => expect(getActiveTour()?.tourId).toBe("tour-1"));
  });

  test("shows a tour that can't load, with a retry", async () => {
    mockApi({ "GET /api/tours/tour-1": { status: 500 } });
    await renderWithProviders(<OnRouteScreen id="tour-1" />);
    expect(await screen.findByRole("button", { name: "Erneut versuchen" })).toBeOnTheScreen();
  });

  test("the back button goes back, or home without history", async () => {
    await renderRunning();
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Zurück" }));
    expect(router.back).toHaveBeenCalled();

    router.canGoBack.mockImplementation(() => false);
    await user.press(screen.getByRole("button", { name: "Zurück" }));
    expect(router.replace).toHaveBeenCalledWith("/");
  });
});
