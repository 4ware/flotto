import { describe, expect, test } from "bun:test";

import { setColorSchemePreference } from "@/theme/color-scheme";
import { act, iconNames, renderWithProviders, screen, userEvent } from "@/test/render";
import { nativewind } from "@/test/native-mocks";

import { ModeToggle } from "./mode-toggle";

const trigger = () => screen.getByRole("button", { name: "Farbschema wählen" });

describe("ModeToggle", () => {
  test("opens a menu with the three choices, the current one checked", async () => {
    await act(() => setColorSchemePreference("system"));
    await renderWithProviders(<ModeToggle />);
    expect(screen.queryByRole("radio")).not.toBeOnTheScreen();

    await userEvent.setup().press(trigger());

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Hell" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Dunkel" })).not.toBeChecked();
  });

  test("choosing applies the scheme and closes the menu", async () => {
    await renderWithProviders(<ModeToggle />);
    const user = userEvent.setup();
    await user.press(trigger());

    await user.press(screen.getByRole("radio", { name: "Dunkel" }));

    expect(nativewind.colorScheme.set).toHaveBeenLastCalledWith("dark");
    expect(screen.queryByRole("radio")).not.toBeOnTheScreen();
  });

  test("shows a moon in dark mode and a sun in light mode", async () => {
    await act(() => setColorSchemePreference("light"));
    await renderWithProviders(<ModeToggle />);
    expect(iconNames(trigger())).toEqual(["Sun"]);

    await act(() => setColorSchemePreference("dark"));
    expect(iconNames(trigger())).toEqual(["Moon"]);
  });

  test("the icon matches the surface it sits on", async () => {
    await renderWithProviders(<ModeToggle variant="surface" />);
    const icon = trigger().queryAll((node) => node.type === "Icon")[0];
    expect(icon.props.className).toContain("text-foreground");
  });
});
