import { describe, expect, mock, test } from "bun:test";
import { Text } from "react-native";

import { render, screen, userEvent } from "@/test/render";

import { HeaderIcon, ScreenHeader } from "./screen-header";

describe("ScreenHeader", () => {
  test("shows overline, title, extra content and the color-scheme toggle", async () => {
    await render(
      <ScreenHeader
        overline="Guten Tag, Kai"
        title="WL-FD 509"
        right={
          <HeaderIcon>
            <Text>!</Text>
          </HeaderIcon>
        }
      >
        <Text>Heute · 1 Tour</Text>
      </ScreenHeader>,
    );

    expect(screen.getByText("Guten Tag, Kai")).toBeOnTheScreen();
    expect(screen.getByText("WL-FD 509")).toBeOnTheScreen();
    expect(screen.getByText("Heute · 1 Tour")).toBeOnTheScreen();
    expect(screen.getByText("!")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Farbschema wählen" })).toBeOnTheScreen();
  });

  test("has no back button by default", async () => {
    await render(<ScreenHeader overline="Tour" title="16:35 – 17:00" />);
    expect(screen.queryByRole("button", { name: "Zurück" })).not.toBeOnTheScreen();
  });

  test("shows a back button with onBack", async () => {
    const onBack = mock(() => {});
    await render(<ScreenHeader overline="Tour" title="16:35 – 17:00" onBack={onBack} />);
    await userEvent.setup().press(screen.getByRole("button", { name: "Zurück" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
