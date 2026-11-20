import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { Label } from "./label";

describe("Label", () => {
  test("shows its text in our medium font", async () => {
    await render(<Label>E-Mail-Adresse</Label>);
    expect(screen.getByText("E-Mail-Adresse").props.className).toContain("font-sans-medium");
  });
});
