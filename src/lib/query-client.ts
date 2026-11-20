import { AppState, Platform } from "react-native";
import { focusManager, MutationCache, onlineManager, QueryCache, QueryClient } from "@tanstack/react-query";
import * as Network from "expo-network";

import { sessionQueryKey } from "@/lib/api/auth";
import { ApiError, isUnauthorized } from "@/lib/api/client";

// React Native has no window focus/online events: wire TanStack Query to AppState and expo-network.
if (Platform.OS !== "web") {
  onlineManager.setEventListener((setOnline) => {
    const subscription = Network.addNetworkStateListener((state) => setOnline(!!state.isConnected));
    return () => subscription.remove();
  });

  AppState.addEventListener("change", (status) => focusManager.setFocused(status === "active"));
}

// Any 401 means the session is gone: clearing it sends the user back to the login screen.
const onError = (error: unknown) => {
  if (isUnauthorized(error)) queryClient.setQueryData(sessionQueryKey, null);
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({ onError }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Client errors (4xx) won't fix themselves; retry only network and server errors.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
});
