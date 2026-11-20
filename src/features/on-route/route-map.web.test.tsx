import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { RouteMap } from "./route-map.web";

describe("RouteMap (web)", () => {
  test("shows the coordinates instead of a map", async () => {
    await render(
      <RouteMap
        position={{ latitude: 53.327, longitude: 9.8715 }}
        destination={null}
        destinationLabel="Bahnhofsweg 1"
      />,
    );
    expect(screen.getByText("Die Karte ist nur in der App verfügbar.")).toBeOnTheScreen();
    expect(screen.getByText("Position: 53.32700, 9.87150")).toBeOnTheScreen();
    expect(screen.getByText("Ziel (Bahnhofsweg 1): –")).toBeOnTheScreen();
  });
});
