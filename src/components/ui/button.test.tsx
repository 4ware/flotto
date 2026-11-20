import { describe, expect, mock, test } from "bun:test";
import { Truck } from "lucide-react-native";

import { iconNames, render, screen, userEvent } from "@/test/render";

import { Button } from "./button";

describe("Button", () => {
  test("is a button named by its label", async () => {
    await render(<Button label="Tour starten" />);
    expect(screen.getByRole("button", { name: "Tour starten" })).toBeOnTheScreen();
  });

  test("calls onPress", async () => {
    const onPress = mock(() => {});
    await render(<Button label="Tour starten" onPress={onPress} />);
    await userEvent.setup().press(screen.getByRole("button", { name: "Tour starten" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("shows its icon", async () => {
    await render(<Button label="Fahrzeug wählen" icon={Truck} />);
    expect(iconNames(screen.getByRole("button"))).toEqual(["Truck"]);
  });
});
