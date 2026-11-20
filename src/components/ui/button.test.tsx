import { describe, expect, mock, test } from "bun:test";
import { Truck } from "lucide-react-native";

import { iconNames, render, screen, userEvent } from "@/test/render";

import { Button, buttonTextVariants } from "./button";
import { Icon } from "./icon";
import { Text } from "./text";

describe("Button", () => {
  test("is a button named by its text", async () => {
    await render(
      <Button>
        <Text>Tour starten</Text>
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Tour starten" })).toBeOnTheScreen();
  });

  test("calls onPress", async () => {
    const onPress = mock(() => {});
    await render(
      <Button onPress={onPress}>
        <Text>Tour starten</Text>
      </Button>,
    );
    await userEvent.setup().press(screen.getByRole("button", { name: "Tour starten" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("can't be pressed when disabled", async () => {
    const onPress = mock(() => {});
    await render(
      <Button disabled onPress={onPress}>
        <Text>Tour starten</Text>
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Tour starten" });
    await userEvent.setup().press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  test("styles its text for the variant", async () => {
    await render(
      <Button variant="outline">
        <Icon as={Truck} />
        <Text>Fahrzeug wählen</Text>
      </Button>,
    );
    expect(screen.getByText("Fahrzeug wählen").props.className).toContain(buttonTextVariants({ variant: "outline" }));
    expect(iconNames(screen.getByRole("button"))).toEqual(["Truck"]);
  });
});
