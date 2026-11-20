import { afterEach, describe, expect, test, setSystemTime } from "bun:test";

import { makeTour } from "@/test/fixtures";
import { router } from "@/test/native-mocks";
import { render, screen, userEvent } from "@/test/render";

import { dayKey, dayLabel, formatTime, TourCard } from "./tour-card";

afterEach(() => setSystemTime());

describe("formatTime", () => {
  test("shows German time, whatever the device's zone", () => {
    expect(formatTime("2026-11-20T15:35:00.000Z")).toBe("16:35"); // CET
    expect(formatTime("2026-07-01T15:35:00.000Z")).toBe("17:35"); // CEST
  });
});

describe("dayKey", () => {
  test("is the German calendar day", () => {
    expect(dayKey(new Date("2026-11-20T22:30:00Z"))).toBe("2026-11-20");
    // 00:30 in Germany is already the next day.
    expect(dayKey(new Date("2026-11-20T23:30:00Z"))).toBe("2026-11-21");
  });
});

describe("dayLabel", () => {
  const now = new Date("2026-11-20T12:00:00Z");

  test("names today, tomorrow and yesterday", () => {
    expect(dayLabel("2026-11-20", now)).toBe("Heute");
    expect(dayLabel("2026-11-21", now)).toBe("Morgen");
    expect(dayLabel("2026-11-19", now)).toBe("Gestern");
  });

  test("writes out other days", () => {
    expect(dayLabel("2026-11-24", now)).toBe("Di., 24.11.2026");
  });
});

describe("TourCard", () => {
  test("shows times, route, customer and status", async () => {
    await render(<TourCard tour={makeTour({ status: "started" })} />);

    expect(screen.getByText("16:35 – 17:00")).toBeOnTheScreen();
    expect(screen.getByText("Hermann-Burgdorf-Str. 94, 21244 Buchholz")).toBeOnTheScreen();
    expect(screen.getByText("Bahnhofsweg 1, 21244 Buchholz")).toBeOnTheScreen();
    expect(screen.getByText("Kunde · Kalle Schumpk")).toBeOnTheScreen();
    expect(screen.getByText("Gestartet")).toBeOnTheScreen();
  });

  test("opens the tour when pressed", async () => {
    await render(<TourCard tour={makeTour({ id: "tour-7" })} />);
    await userEvent.setup().press(screen.getByRole("button"));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/tour/[id]", params: { id: "tour-7" } });
  });
});
