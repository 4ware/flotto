// Shared helpers for component and hook tests. Import RNTL from here, not from the package:
// Bun binds CommonJS named exports once at import, but RNTL replaces `screen` on every render.
import type { ReactElement, ReactNode } from "react";
import { notifyManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalHost } from "@rn-primitives/portal";
import { render, renderHook, screen as staleScreen } from "@testing-library/react-native";
import { mock } from "bun:test";

import { AppStateProvider } from "@/state/app-state";

export * from "@testing-library/react-native";

/** RNTL's `screen`, read live from the module on every access. */
export const screen = new Proxy({} as typeof staleScreen, {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- the live CommonJS export is the point
  get: (_, key) => Reflect.get(require("@testing-library/react-native").screen, key),
});

// TanStack Query notifies subscribers on a setTimeout(0), outside act(); notify at once instead,
// so state updates land inside the act() of the render or event that caused them.
notifyManager.setScheduler((callback) => callback());

/** No retries and no caching between tests, so failures show up at once. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: 0 }, mutations: { retry: false } },
  });
}

function providers(queryClient: QueryClient) {
  return function TestProviders({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppStateProvider>
          {children}
          {/* Like the root layout: menus and dialogs render here. */}
          <PortalHost />
        </AppStateProvider>
      </QueryClientProvider>
    );
  };
}

/** Renders inside the app's providers (TanStack Query, app state, portal host for menus and dialogs). */
export async function renderWithProviders(ui: ReactElement, { queryClient = createTestQueryClient() } = {}) {
  const result = await render(ui, { wrapper: providers(queryClient) });
  return { ...result, queryClient };
}

export async function renderHookWithProviders<T>(hook: () => T, { queryClient = createTestQueryClient() } = {}) {
  const result = await renderHook(hook, { wrapper: providers(queryClient) });
  return { ...result, queryClient };
}

type Route = { status?: number; body?: unknown };
type Handler = Route | ((request: { url: string; method: string; body: unknown }) => Route | Promise<Route>);

/**
 * Replaces fetch with canned API answers, keyed by "METHOD /path" (e.g. "GET /api/tours/day").
 * Unknown routes answer 404. A handler returning a Promise that never settles leaves the
 * request pending. Returns the mock to inspect the calls.
 */
export function mockApi(routes: Record<string, Handler>) {
  const fetchMock = mock(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = (init?.method ?? "GET").toUpperCase();
    const handler = routes[`${method} ${url.pathname}`];
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    const route = typeof handler === "function" ? await handler({ url: url.href, method, body }) : handler;
    if (!route) return new Response(JSON.stringify({ message: "Errors.generic" }), { status: 404 });
    return new Response(route.body === undefined ? null : JSON.stringify(route.body), { status: route.status ?? 200 });
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

/** The JSON body of a recorded fetch call. */
export const bodyOf = (call: unknown[]) => JSON.parse(String((call[1] as RequestInit).body));

type HostNode = { type: string; props: Record<string, unknown>; queryAll: (predicate: (node: HostNode) => boolean) => HostNode[] };

/** Names of the lucide icons rendered inside an element (see the lucide mock in native-mocks.tsx). */
export function iconNames(element: unknown) {
  return (element as HostNode).queryAll((node) => node.type === "Icon").map((node) => node.props.name as string);
}
