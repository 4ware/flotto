import { useState } from "react";
import { describe, expect, mock, test } from "bun:test";

import { messages } from "@/lib/messages";
import { render, screen, userEvent } from "@/test/render";

import { TextField } from "./text-field";

describe("TextField", () => {
  test("is labelled and reports typed text", async () => {
    const onChangeText = mock((_: string) => {});
    function EmailField() {
      const [value, setValue] = useState("");
      return (
        <TextField
          label="E-Mail-Adresse"
          value={value}
          onChangeText={(text) => {
            setValue(text);
            onChangeText(text);
          }}
        />
      );
    }
    await render(<EmailField />);

    await userEvent.setup().type(screen.getByLabelText("E-Mail-Adresse"), "kai");

    expect(onChangeText).toHaveBeenLastCalledWith("kai");
    expect(screen.getByLabelText("E-Mail-Adresse")).toHaveDisplayValue("kai");
  });

  test("shows an error", async () => {
    await render(<TextField label="E-Mail-Adresse" error="Bitte geben Sie eine gültige E-Mail-Adresse ein." />);
    expect(screen.getByText("Bitte geben Sie eine gültige E-Mail-Adresse ein.")).toBeOnTheScreen();
  });

  test("hides a password until the toggle is pressed", async () => {
    await render(<TextField label="Passwort" password value="geheim" />);
    const input = screen.getByLabelText("Passwort");
    expect(input.props.secureTextEntry).toBe(true);

    await userEvent.setup().press(screen.getByRole("button", { name: messages.Auth.showPassword }));

    expect(screen.getByLabelText("Passwort").props.secureTextEntry).toBe(false);
    expect(screen.getByRole("button", { name: messages.Auth.hidePassword })).toBeOnTheScreen();
  });

  test("has no toggle for regular fields", async () => {
    await render(<TextField label="E-Mail-Adresse" />);
    expect(screen.queryByRole("button")).not.toBeOnTheScreen();
    expect(screen.getByLabelText("E-Mail-Adresse").props.secureTextEntry).toBeFalsy();
  });

  test("still calls the caller's focus handlers", async () => {
    const onFocus = mock(() => {});
    const onBlur = mock(() => {});
    await render(<TextField label="E-Mail-Adresse" onFocus={onFocus} onBlur={onBlur} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("E-Mail-Adresse"), "a");

    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });
});
