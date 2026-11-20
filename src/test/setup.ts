// Preloaded by `bun test` (bunfig.toml). Replaces React Native and native modules with
// the stand-ins in ./fake-react-native.tsx and ./native-mocks.tsx before any test imports them.
import { afterEach, mock } from "bun:test";

import * as fakeReactNative from "./fake-react-native";
import * as native from "./native-mocks";

// RNTL registers its own cleanup when first imported, but under `bun test` that hook only
// applies to the first test file that loads it. Clean up globally below instead.
process.env.RNTL_SKIP_AUTO_CLEANUP = "true";
// What RNTL's auto-setup would set: React expects act() around updates in tests.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// A fixed API base URL, whatever .env says. Read by src/lib/api/client.ts at import.
process.env.EXPO_PUBLIC_API_URL = "http://api.test";

// expo-sqlite's localStorage polyfill on device; an in-memory one here.
class MemoryStorage {
  #items = new Map<string, string>();
  get length() {
    return this.#items.size;
  }
  key(index: number) {
    return [...this.#items.keys()][index] ?? null;
  }
  getItem(key: string) {
    return this.#items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.#items.set(key, String(value));
  }
  removeItem(key: string) {
    this.#items.delete(key);
  }
  clear() {
    this.#items.clear();
  }
}
Object.defineProperty(globalThis, "localStorage", { value: new MemoryStorage(), configurable: true, writable: true });

mock.module("react-native", () => fakeReactNative);
mock.module("lucide-react-native", () => native.lucide);
mock.module("expo-router", () => native.expoRouter);
mock.module("react-native-safe-area-context", () => native.safeArea);
mock.module("nativewind", () => native.nativewind);
mock.module("@react-native-async-storage/async-storage", () => ({ default: native.asyncStorage }));
mock.module("expo-location", () => native.location);
mock.module("expo-task-manager", () => native.taskManager);
mock.module("expo-notifications", () => native.notifications);
mock.module("expo", () => native.expo);
mock.module("expo-constants", () => ({ default: native.constants }));
mock.module("expo-web-browser", () => native.webBrowser);
mock.module("expo-network", () => native.network);
mock.module("react-native-maps", () => native.maps);
// The real module installs expo-sqlite's polyfill; the in-memory storage above replaces it.
mock.module("expo-sqlite/localStorage/install", () => ({}));

// Tests replace fetch with mockApi(); put the real one back afterwards.
const realFetch = globalThis.fetch;

afterEach(async () => {
  // Unmount what the test rendered. Imported lazily: a static import would load
  // react-native before the mocks above are registered.
  const rntl = await import("@testing-library/react-native/pure");
  await rntl.cleanup();
  globalThis.fetch = realFetch;
  // The running tour lives in memory as well as in storage.
  (await import("@/features/on-route/background/active-tour")).setActiveTour(null);
  fakeReactNative.__resetReactNative();
  native.__resetNativeMocks();
  globalThis.localStorage.clear();
});
