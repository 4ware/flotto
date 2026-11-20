import { describe, expect, mock, test } from "bun:test";

import { renderWithProviders, screen, userEvent } from "@/test/render";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Text } from "./text";

function Dialog({ open, onOpenChange, onAction }: { open: boolean; onOpenChange: (open: boolean) => void; onAction: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sicher?</AlertDialogTitle>
          <AlertDialogDescription>Das lässt sich nicht rückgängig machen.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Abbrechen</Text>
          </AlertDialogCancel>
          <AlertDialogAction onPress={onAction}>
            <Text>Weiter</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("AlertDialog", () => {
  test("shows nothing while closed", async () => {
    await renderWithProviders(<Dialog open={false} onOpenChange={() => {}} onAction={() => {}} />);
    expect(screen.queryByText("Sicher?")).not.toBeOnTheScreen();
  });

  test("shows title, description and actions in the portal when open", async () => {
    const onOpenChange = mock((_: boolean) => {});
    const onAction = mock(() => {});
    await renderWithProviders(<Dialog open onOpenChange={onOpenChange} onAction={onAction} />);
    const user = userEvent.setup();

    expect(screen.getByText("Sicher?")).toBeOnTheScreen();
    expect(screen.getByText("Das lässt sich nicht rückgängig machen.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Weiter" }));
    expect(onAction).toHaveBeenCalledTimes(1);

    await user.press(screen.getByRole("button", { name: "Abbrechen" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
