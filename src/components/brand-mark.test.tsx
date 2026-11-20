import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { BrandMark } from "./brand-mark";

describe("BrandMark", () => {
  test("shows the flot.to wordmark", async () => {
    await render(<BrandMark />);
    expect(screen.getByText("flot.to")).toBeOnTheScreen();
  });
});
