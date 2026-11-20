import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { Input } from "./input";

describe("Input", () => {
  test("is a text input that merges classes", async () => {
    await render(<Input accessibilityLabel="Name" className="h-11" editable={false} />);
    const input = screen.getByLabelText("Name");
    expect(input.props.className).toContain("h-11");
    expect(input.props.className).not.toContain("h-10 ");
    expect(input.props.className).toContain("opacity-50");
  });
});
