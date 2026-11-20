import { describe, expect, test } from "bun:test";

import { makeVehicle, vehiclesBody } from "@/test/fixtures";
import { mockApi, renderHookWithProviders, waitFor } from "@/test/render";

import { useVehicles } from "./vehicles";

describe("useVehicles", () => {
  test("returns the company's vehicles", async () => {
    const vehicles = [makeVehicle(), makeVehicle({ id: "vehicle-2", licensePlate: "HH-AB 1" })];
    mockApi({ "GET /api/vehicles/": { body: vehiclesBody(vehicles) } });
    const { result } = await renderHookWithProviders(() => useVehicles());
    await waitFor(() => expect(result.current.data).toEqual(vehicles));
  });
});
