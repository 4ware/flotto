import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { Eyebrow } from "./eyebrow";

describe("Eyebrow", () => {
  test("shows its text", async () => {
    await render(<Eyebrow>Heute</Eyebrow>);
    expect(screen.getByText("Heute")).toBeOnTheScreen();
  });
});
