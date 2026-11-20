import { describe, expect, test } from "bun:test";

import { sessionQueryKey, useSession } from "@/lib/api/auth";
import { session } from "@/test/fixtures";
import { createTestQueryClient, mockApi, renderWithProviders, screen, userEvent, waitFor } from "@/test/render";

import { ProfileScreen } from "./profile-screen";

/** Like the root layout: the profile only exists while someone is signed in. */
function SignedInProfile() {
  return useSession().data ? <ProfileScreen /> : null;
}

function signedIn(value = session) {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(sessionQueryKey, value);
  return { queryClient };
}

describe("ProfileScreen", () => {
  test("shows the user, company and role", async () => {
    await renderWithProviders(<ProfileScreen />, signedIn());

    expect(screen.getByText("Kai Beispiel")).toBeOnTheScreen();
    expect(screen.getByText("Spedition Nord")).toBeOnTheScreen();
    expect(screen.getByText("Fahrer")).toBeOnTheScreen();
    expect(screen.getByText("KB")).toBeOnTheScreen();
    expect(screen.getByText("kai@example.com")).toBeOnTheScreen();
  });

  test("without a company it shows the email instead", async () => {
    await renderWithProviders(<ProfileScreen />, signedIn({ ...session, organization: null }));
    expect(screen.getAllByText("kai@example.com")).toHaveLength(2);
    expect(screen.queryByText("Fahrer")).not.toBeOnTheScreen();
  });

  test("logging out signs the user out", async () => {
    const fetch = mockApi({ "POST /api/logout": { body: { ok: true } } });
    const { queryClient } = signedIn();
    await renderWithProviders(<SignedInProfile />, { queryClient });

    await userEvent.setup().press(screen.getByRole("button", { name: /Abmelden/ }));

    await waitFor(() => expect(queryClient.getQueryData(sessionQueryKey)).toBeNull());
    expect(String(fetch.mock.calls[0][0])).toEndWith("/api/logout");
  });
});
