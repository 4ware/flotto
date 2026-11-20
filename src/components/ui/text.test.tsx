import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { Text, TextClassContext } from "./text";

describe("Text", () => {
  test("uses our body font and lets className win", async () => {
    await render(<Text className="text-sm text-destructive">Fehler</Text>);
    const className = screen.getByText("Fehler").props.className;
    expect(className).toContain("font-sans");
    expect(className).toContain("text-destructive");
    expect(className).not.toContain("text-foreground");
    expect(className).not.toContain("text-base");
  });

  test("headings use the heading font and role", async () => {
    await render(<Text variant="h3">Touren</Text>);
    const heading = screen.getByRole("heading", { name: "Touren" });
    expect(heading.props.className).toContain("font-heading");
  });

  test("takes classes from a surrounding component", async () => {
    await render(
      <TextClassContext.Provider value="text-primary-foreground">
        <Text>Im Button</Text>
      </TextClassContext.Provider>,
    );
    expect(screen.getByText("Im Button").props.className).toContain("text-primary-foreground");
  });
});
