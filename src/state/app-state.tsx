import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

/** App-wide state that survives restarts. Add new fields here and to `defaultAppState`. */
export type AppState = {
  /** The vehicle the driver is working with (`id` from GET /api/vehicles). */
  choosenVehicleId: string | null;
};

export const defaultAppState: AppState = {
  choosenVehicleId: null,
};

// Persisted in localStorage: the browser's on web, expo-sqlite's polyfill on native
// (see install-local-storage.native.ts). Both are synchronous, so the saved state is there on the first render.
const STORAGE_KEY = "flotto.app-state";

function readState(): AppState {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    // Merge over the defaults so fields added later get their default value.
    return raw ? { ...defaultAppState, ...JSON.parse(raw) } : defaultAppState;
  } catch {
    return defaultAppState;
  }
}

function writeState(state: AppState) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: keep working from memory.
  }
}

type AppStateContextValue = AppState & {
  setChoosenVehicleId: (id: string | null) => void;
  /** Merge a partial update into the state. */
  update: (patch: Partial<AppState>) => void;
  /** Back to `defaultAppState`. */
  reset: () => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readState);

  useEffect(() => writeState(state), [state]);

  const update = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setState(defaultAppState), []);
  const setChoosenVehicleId = useCallback((id: string | null) => update({ choosenVehicleId: id }), [update]);

  const value = useMemo(
    () => ({ ...state, setChoosenVehicleId, update, reset }),
    [state, setChoosenVehicleId, update, reset],
  );

  return <AppStateContext value={value}>{children}</AppStateContext>;
}

export function useAppState() {
  const context = use(AppStateContext);
  if (!context) throw new Error("useAppState() must be used inside <AppStateProvider>");
  return context;
}
