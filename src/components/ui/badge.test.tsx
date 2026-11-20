import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { Badge, badgeTextVariants } from "./badge";
import { Text } from "./text";

describe("Badge", () => {
  test("shows its text, styled for the variant", async () => {
    await render(
      <Badge variant="secondary">
        <Text>Gestartet</Text>
      </Badge>,
    );
    expect(screen.getByText("Gestartet").props.className).toContain(badgeTextVariants({ variant: "secondary" }));
  });
});
