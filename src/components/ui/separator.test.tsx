import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { Separator } from "./separator";

describe("Separator", () => {
  test("draws a horizontal or vertical line, hidden from screen readers", async () => {
    await render(<Separator testID="h" />);
    expect(screen.getByTestId("h", { includeHiddenElements: true }).props.className).toContain("h-[1px]");

    await render(<Separator testID="v" orientation="vertical" />);
    expect(screen.getByTestId("v", { includeHiddenElements: true }).props.className).toContain("w-[1px]");
    expect(screen.queryByTestId("h")).not.toBeOnTheScreen();
  });
});
