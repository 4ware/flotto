import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { Badge } from "./badge";

describe("Badge", () => {
  test("shows its label", async () => {
    await render(<Badge label="Gestartet" />);
    expect(screen.getByText("Gestartet")).toBeOnTheScreen();
  });
});
