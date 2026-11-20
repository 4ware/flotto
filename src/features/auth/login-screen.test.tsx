import { describe, expect, test } from "bun:test";

import { sessionQueryKey } from "@/lib/api/auth";
import { messages } from "@/lib/messages";
import { session } from "@/test/fixtures";
import { webBrowser } from "@/test/native-mocks";
import { bodyOf, mockApi, renderWithProviders, screen, userEvent } from "@/test/render";

import { LoginScreen } from "./login-screen";

const t = messages.Auth.login;

async function fillIn(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText("E-Mail-Adresse"), email);
  if (password) await user.type(screen.getByLabelText("Passwort"), password);
  await user.press(screen.getByRole("button", { name: t.submit }));
}

describe("LoginScreen", () => {
  test("shows the form", async () => {
    await renderWithProviders(<LoginScreen />);
    expect(screen.getByRole("header", { name: t.title })).toBeOnTheScreen();
    expect(screen.getByLabelText("E-Mail-Adresse")).toBeOnTheScreen();
    expect(screen.getByLabelText("Passwort")).toBeOnTheScreen();
  });

  test("checks the fields before sending", async () => {
    const fetch = mockApi({});
    await renderWithProviders(<LoginScreen />);

    await fillIn("keine-email", "");

    expect(screen.getByText(messages.Validation.emailInvalid)).toBeOnTheScreen();
    expect(screen.getByText(messages.Validation.passwordRequired)).toBeOnTheScreen();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("logs in with the trimmed email and loads the session", async () => {
    const fetch = mockApi({ "POST /api/login": { body: { ok: true } }, "GET /api/session": { body: session } });
    const { queryClient } = await renderWithProviders(<LoginScreen />);

    await fillIn("  kai@example.com ", "geheim123");

    expect(bodyOf(fetch.mock.calls[0])).toEqual({ email: "kai@example.com", password: "geheim123" });
    await screen.findByRole("button", { name: t.submit });
    expect(queryClient.getQueryData(sessionQueryKey)).toEqual(session);
  });

  test("shows the API's error", async () => {
    mockApi({ "POST /api/login": { status: 401, body: { message: "Errors.wrongCredentials" } } });
    await renderWithProviders(<LoginScreen />);

    await fillIn("kai@example.com", "falsch");

    expect(await screen.findByText(messages.Errors.wrongCredentials)).toBeOnTheScreen();
  });

  test("opens password reset and signup in the browser", async () => {
    await renderWithProviders(<LoginScreen />);
    const user = userEvent.setup();

    await user.press(screen.getByRole("link", { name: t.forgotPassword }));
    await user.press(screen.getByRole("link", { name: t.footerLink }));

    expect(webBrowser.openBrowserAsync).toHaveBeenCalledWith("http://api.test/forgot-password");
    expect(webBrowser.openBrowserAsync).toHaveBeenCalledWith("http://api.test/signup");
  });
});
