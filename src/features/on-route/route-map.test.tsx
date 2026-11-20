import { describe, expect, test } from "bun:test";
import { Platform } from "react-native";

import { setColorSchemePreference } from "@/theme/color-scheme";
import { constants, expo, mapCamera } from "@/test/native-mocks";
import { act, iconNames, render, screen } from "@/test/render";

import { RouteMap } from "./route-map";

const start = { latitude: 53.327, longitude: 9.8715 };
const moved = { latitude: 53.31, longitude: 9.879 };
const destination = { latitude: 53.2905, longitude: 9.8705 };
const map = () => screen.container.queryAll((node) => node.type === "MapView")[0];

describe("RouteMap", () => {
  test("shows the truck and the destination, both in view", async () => {
    await render(<RouteMap position={start} destination={destination} destinationLabel="Bahnhofsweg 1" />);

    expect(iconNames(map())).toEqual(["Truck"]);
    expect(screen.container.queryAll((n) => n.type === "Marker").map((m) => m.props.title)).toEqual([
      "Ihr Fahrzeug",
      "Ziel",
    ]);
    expect(mapCamera.fitToCoordinates).toHaveBeenCalledWith([start, destination], expect.anything());
  });

  test("zooms to a single point", async () => {
    await render(<RouteMap position={start} destination={null} destinationLabel="Bahnhofsweg 1" />);
    expect(mapCamera.animateToRegion).toHaveBeenCalledWith(expect.objectContaining(start));
  });

  test("follows the vehicle once it moves", async () => {
    const { rerender } = await render(<RouteMap position={start} destination={destination} destinationLabel="Ziel" />);
    expect(mapCamera.animateCamera).not.toHaveBeenCalled();

    await rerender(<RouteMap position={moved} destination={destination} destinationLabel="Ziel" />);

    expect(mapCamera.animateCamera).toHaveBeenLastCalledWith({ center: moved, zoom: 16 }, { duration: 800 });
  });

  test("uses the app's color scheme", async () => {
    await act(() => setColorSchemePreference("light"));
    await render(<RouteMap position={start} destination={destination} destinationLabel="Ziel" />);
    expect(map().props.userInterfaceStyle).toBe("light");

    await act(() => setColorSchemePreference("dark"));
    expect(map().props.userInterfaceStyle).toBe("dark");
  });

  test("explains a missing Google Maps key on Android instead of crashing", async () => {
    constants.expoConfig.extra = { hasAndroidMapsKey: false };
    await render(<RouteMap position={start} destination={destination} destinationLabel="Ziel" />);

    expect(screen.getByText("Karte nicht verfügbar")).toBeOnTheScreen();
    expect(screen.getByText("53.32700, 9.87150")).toBeOnTheScreen();
  });

  test("Expo Go brings its own key", async () => {
    constants.expoConfig.extra = { hasAndroidMapsKey: false };
    expo.isRunningInExpoGo.mockImplementation(() => true);
    await render(<RouteMap position={start} destination={destination} destinationLabel="Ziel" />);
    expect(screen.queryByText("Karte nicht verfügbar")).not.toBeOnTheScreen();
  });

  test("iOS needs no key", async () => {
    constants.expoConfig.extra = { hasAndroidMapsKey: false };
    Platform.OS = "ios";
    await render(<RouteMap position={start} destination={destination} destinationLabel="Ziel" />);
    expect(screen.queryByText("Karte nicht verfügbar")).not.toBeOnTheScreen();
  });
});
