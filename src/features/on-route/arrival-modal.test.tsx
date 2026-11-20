import { describe, expect, mock, test } from "bun:test";

import { renderWithProviders, screen, userEvent } from "@/test/render";

import { ArrivalModal } from "./arrival-modal";

const props = {
  destinationLabel: "Bahnhofsweg 1, 21244 Buchholz",
  pending: false,
  error: null,
  onConfirm: () => {},
  onDismiss: () => {},
};

describe("ArrivalModal", () => {
  test("is hidden until visible", async () => {
    await renderWithProviders(<ArrivalModal {...props} visible={false} />);
    expect(screen.queryByText("Ziel erreicht?")).not.toBeOnTheScreen();
  });

  test("asks about the destination and reports the answer", async () => {
    const onConfirm = mock(() => {});
    const onDismiss = mock(() => {});
    await renderWithProviders(<ArrivalModal {...props} visible onConfirm={onConfirm} onDismiss={onDismiss} />);
    const user = userEvent.setup();

    expect(screen.getByText("Ziel erreicht?")).toBeOnTheScreen();
    expect(screen.getByText("Bahnhofsweg 1, 21244 Buchholz")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Ja, Tour abschließen" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.press(screen.getByRole("button", { name: "Noch nicht" }));
    expect(onDismiss).toHaveBeenCalled();
  });

  test("ignores presses while finishing and shows errors", async () => {
    const onConfirm = mock(() => {});
    const onDismiss = mock(() => {});
    await renderWithProviders(
      <ArrivalModal {...props} visible pending error="Dazu fehlt Ihnen die Berechtigung." onConfirm={onConfirm} onDismiss={onDismiss} />,
    );
    const user = userEvent.setup();

    const confirm = screen.getByRole("button", { name: "Wird abgeschlossen …" });
    expect(confirm).toBeDisabled();
    await user.press(confirm);
    await user.press(screen.getByRole("button", { name: "Noch nicht" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
    expect(screen.getByText("Dazu fehlt Ihnen die Berechtigung.")).toBeOnTheScreen();
  });
});
