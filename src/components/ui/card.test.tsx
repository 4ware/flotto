import { describe, expect, test } from "bun:test";
import { Text } from "react-native";

import { render, screen } from "@/test/render";

import { Card } from "./card";

describe("Card", () => {
  test("renders its children and passes props through", async () => {
    await render(
      <Card testID="card" className="gap-3">
        <Text>Inhalt</Text>
      </Card>,
    );
    expect(screen.getByText("Inhalt")).toBeOnTheScreen();
    expect(screen.getByTestId("card").props.className).toContain("gap-3");
  });
});
