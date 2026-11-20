import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { stopTracking } from "@/features/on-route/background/tracking";
import { apiFetch, isUnauthorized } from "@/lib/api/client";

export type Role = "driver" | "employee" | "admin" | "owner";

/** GET /api/session */
export type Session = {
  user: { name: string; email: string };
  organization: { id: string; name: string; role: Role } | null;
};

export const sessionQueryKey = ["session"] as const;

/** The signed-in user, or null when signed out (401). */
async function fetchSession(): Promise<Session | null> {
  try {
    return await apiFetch<Session>("/api/session");
  } catch (error) {
    if (isUnauthorized(error)) return null;
    throw error;
  }
}

export function useSession() {
  return useQuery({ queryKey: sessionQueryKey, queryFn: fetchSession, staleTime: 5 * 60_000 });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiFetch<{ ok: true }>("/api/login", { method: "POST", body: credentials }),
    // Load the user before resolving, so the protected screens open straight away.
    onSuccess: () => queryClient.fetchQuery({ queryKey: sessionQueryKey, queryFn: fetchSession, staleTime: 0 }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ ok: true }>("/api/logout", { method: "POST" }),
    // Sign out locally even if the request fails; the cookie is useless without the session anyway.
    onSettled: () => {
      // A signed-out device must stop reporting the vehicle's position.
      void stopTracking();
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== sessionQueryKey[0] });
      queryClient.setQueryData(sessionQueryKey, null);
    },
  });
}

/** The signed-in user. Only use inside the protected screens, where a session is guaranteed. */
export function useCurrentUser() {
  const { data } = useSession();
  if (!data) throw new Error("useCurrentUser() used outside the signed-in area");
  const { user, organization } = data;
  const parts = user.name.trim().split(/\s+/);
  return {
    ...user,
    organization,
    firstName: parts[0] ?? user.name,
    initials: (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : user.name.slice(0, 2)).toUpperCase(),
  };
}
