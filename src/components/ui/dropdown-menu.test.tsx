import { useState } from "react";
import { describe, expect, mock, test } from "bun:test";

import { renderWithProviders, screen, userEvent } from "@/test/render";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Text } from "./text";

function Menu({ onSelect }: { onSelect: () => void }) {
  const [value, setValue] = useState("a");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button accessibilityLabel="Menü">
          <Text>Menü</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onPress={onSelect}>
          <Text>Aktion</Text>
        </DropdownMenuItem>
        <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
          <DropdownMenuRadioItem value="a">
            <Text>Eins</Text>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="b">
            <Text>Zwei</Text>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  test("opens from its trigger into the portal and closes after choosing", async () => {
    const onSelect = mock(() => {});
    await renderWithProviders(<Menu onSelect={onSelect} />);
    const user = userEvent.setup();
    expect(screen.queryByText("Aktion")).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Menü" }));
    await user.press(screen.getByText("Aktion"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Aktion")).not.toBeOnTheScreen();
  });

  test("radio items show and change the checked value", async () => {
    await renderWithProviders(<Menu onSelect={() => {}} />);
    const user = userEvent.setup();

    await user.press(screen.getByRole("button", { name: "Menü" }));
    expect(screen.getByRole("radio", { name: "Eins" })).toBeChecked();
    await user.press(screen.getByRole("radio", { name: "Zwei" }));

    await user.press(screen.getByRole("button", { name: "Menü" }));
    expect(screen.getByRole("radio", { name: "Zwei" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Eins" })).not.toBeChecked();
  });
});
