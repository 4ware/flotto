import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Text } from "./text";

describe("Card", () => {
  test("renders its parts", async () => {
    await render(
      <Card testID="card" className="gap-3">
        <CardHeader>
          <CardTitle>Route</CardTitle>
          <CardDescription>Heute</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Inhalt</Text>
        </CardContent>
        <CardFooter>
          <Text>Fuß</Text>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByRole("heading", { name: "Route" })).toBeOnTheScreen();
    expect(screen.getByText("Heute")).toBeOnTheScreen();
    expect(screen.getByText("Inhalt")).toBeOnTheScreen();
    expect(screen.getByText("Fuß")).toBeOnTheScreen();
    // Our className wins over the defaults.
    expect(screen.getByTestId("card").props.className).toContain("gap-3");
    expect(screen.getByTestId("card").props.className).not.toContain("gap-6");
  });

  test("card text uses the card's foreground color", async () => {
    await render(
      <Card>
        <Text>Inhalt</Text>
      </Card>,
    );
    expect(screen.getByText("Inhalt").props.className).toContain("text-card-foreground");
  });
});
