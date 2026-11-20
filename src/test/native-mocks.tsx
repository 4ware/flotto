// Stand-ins for native modules and libraries that can't run under `bun test`
// (registered with mock.module in ./setup.ts). Tests import these objects to
// steer them (e.g. `location.getCurrentPositionAsync.mockResolvedValueOnce(...)`)
// and to assert calls (e.g. `expect(router.push).toHaveBeenCalledWith(...)`).
import { createElement, useEffect, useImperativeHandle, useSyncExternalStore, type ReactNode, type Ref } from "react";
import { mock } from "bun:test";

type Props = Record<string, any> & { children?: ReactNode; ref?: Ref<unknown> };

// ---- lucide-react-native: every icon renders a host "Icon" carrying its name.
// Add an icon here when the app (or a component in src/components/ui) starts using it.

const ICON_NAMES = [
  "ArrowDown", "Bell", "Building2", "CalendarDays", "Check", "ChevronDown", "ChevronLeft", "ChevronRight",
  "ChevronUp", "CircleCheck", "Clock",
  "Eye", "EyeOff", "Flag", "House", "ListChecks", "LogOut", "MapPin", "Moon", "Navigation", "Play", "Route",
  "Sun", "Truck", "User",
] as const;

export const lucide = Object.fromEntries(
  ICON_NAMES.map((name) => {
    const Icon = (props: Props) => createElement("Icon", { ...props, name });
    Icon.displayName = name;
    return [name, Icon];
  }),
);

// ---- expo-router

export const router = {
  push: mock((_href: unknown) => {}),
  navigate: mock((_href: unknown) => {}),
  replace: mock((_href: unknown) => {}),
  back: mock(() => {}),
  dismissTo: mock((_href: unknown) => {}),
  canGoBack: mock(() => true),
};

let searchParams: Record<string, string> = {};
export const setSearchParams = (params: Record<string, string>) => {
  searchParams = params;
};

const navTheme = (dark: boolean) => ({
  dark,
  colors: { primary: "", background: "", card: "", text: "", border: "", notification: "" },
  fonts: {},
});

export const expoRouter = {
  router,
  DefaultTheme: navTheme(false),
  DarkTheme: navTheme(true),
  useLocalSearchParams: () => searchParams,
  // Runs like an effect on mount; enough for screens that react to gaining focus once.
  useFocusEffect: (effect: () => void | (() => void)) => useEffect(effect, [effect]),
  Link: ({ children, ...props }: Props) => createElement("View", props, children),
};

// ---- react-native-reanimated: no animations in tests; animated views are plain host views.

type Animation = { [key: string]: (...args: unknown[]) => Animation };
const animation: Animation = new Proxy({} as Animation, { get: () => () => animation });
const AnimatedView = ({ children, entering: _entering, exiting: _exiting, layout: _layout, ...props }: Props) =>
  createElement("View", props, children);
export const reanimated = {
  default: {
    View: AnimatedView,
    createAnimatedComponent: (Component: (props: Props) => ReactNode) => ({ entering, exiting, layout, ...props }: Props) =>
      createElement(Component, props),
  },
  FadeIn: animation,
  FadeOut: animation,
  ReduceMotion: { System: "system", Always: "always", Never: "never" },
};

// ---- react-native-screens: FullWindowOverlay (iOS dialogs) just renders its children.

export const screens = { FullWindowOverlay: ({ children }: Props) => children };

// ---- react-native-safe-area-context

export const safeArea = {
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: Props) => children,
  SafeAreaView: ({ children, ...props }: Props) => createElement("View", props, children),
};

// ---- nativewind: only the color scheme is used outside className.

type Scheme = "light" | "dark";
let scheme: Scheme = "light";
const schemeListeners = new Set<() => void>();
const setScheme = (value: Scheme | "system") => {
  scheme = value === "dark" ? "dark" : "light";
  schemeListeners.forEach((l) => l());
};

export const nativewind = {
  // Icon (src/components/ui/icon.tsx) maps className to props on device; tests read className directly.
  cssInterop: () => {},
  colorScheme: { set: mock(setScheme), get: () => scheme },
  useColorScheme: () => {
    const colorScheme = useSyncExternalStore(
      (l) => {
        schemeListeners.add(l);
        return () => schemeListeners.delete(l);
      },
      () => scheme,
    );
    return { colorScheme, setColorScheme: setScheme, toggleColorScheme: () => setScheme(scheme === "dark" ? "light" : "dark") };
  },
};

// ---- @react-native-async-storage/async-storage (in memory)

const asyncStore = new Map<string, string>();
export const asyncStorage = {
  getItem: mock(async (key: string) => asyncStore.get(key) ?? null),
  setItem: mock(async (key: string, value: string) => void asyncStore.set(key, value)),
  removeItem: mock(async (key: string) => void asyncStore.delete(key)),
  clear: mock(async () => asyncStore.clear()),
};

// ---- expo-location

const granted = { granted: true, status: "granted", canAskAgain: true, expires: "never" };
export const location = {
  Accuracy: { Lowest: 1, Low: 2, Balanced: 3, High: 4, Highest: 5, BestForNavigation: 6 },
  ActivityType: { Other: 1, AutomotiveNavigation: 2, Fitness: 3, OtherNavigation: 4, Airborne: 5 },
  GeofencingEventType: { Enter: 1, Exit: 2 },
  requestForegroundPermissionsAsync: mock(async () => granted),
  requestBackgroundPermissionsAsync: mock(async () => granted),
  getCurrentPositionAsync: mock(async () => ({ coords: { latitude: 53.327, longitude: 9.8715 }, timestamp: 0 })),
  geocodeAsync: mock(async (_address: string) => [{ latitude: 53.2905, longitude: 9.8705 }]),
  startLocationUpdatesAsync: mock(async (_task: string, _options?: unknown) => {}),
  stopLocationUpdatesAsync: mock(async (_task: string) => {}),
  hasStartedLocationUpdatesAsync: mock(async (_task: string) => false),
  startGeofencingAsync: mock(async (_task: string, _regions?: unknown[]) => {}),
  stopGeofencingAsync: mock(async (_task: string) => {}),
  hasStartedGeofencingAsync: mock(async (_task: string) => false),
};

// ---- expo-task-manager: keeps the executors so tests can run a task directly.

type TaskExecutor = (body: { data: any; error: { message: string } | null; executionInfo: unknown }) => unknown;
export const definedTasks = new Map<string, TaskExecutor>();
export const taskManager = {
  defineTask: mock((name: string, executor: TaskExecutor) => void definedTasks.set(name, executor)),
  isTaskDefined: (name: string) => definedTasks.has(name),
  isTaskRegisteredAsync: mock(async (_name: string) => false),
  isAvailableAsync: mock(async () => true),
};
/** Runs a defined task the way the OS would. */
export async function runTask(name: string, data: any, error: { message: string } | null = null) {
  const executor = definedTasks.get(name);
  if (!executor) throw new Error(`Task ${name} is not defined`);
  await executor({ data, error, executionInfo: { eventId: "test", taskName: name } });
}

// ---- expo-notifications

let lastResponse: any = null;
const responseListeners = new Set<() => void>();
export const notifications = {
  AndroidImportance: { UNKNOWN: 0, UNSPECIFIED: 1, NONE: 2, MIN: 3, LOW: 4, DEFAULT: 5, HIGH: 6, MAX: 7 },
  setNotificationHandler: mock((_handler: unknown) => {}),
  setNotificationChannelAsync: mock(async (_id: string, _channel: unknown) => null),
  requestPermissionsAsync: mock(async () => ({ granted: true, status: "granted" })),
  scheduleNotificationAsync: mock(async (_request: unknown) => "notification-id"),
  clearLastNotificationResponseAsync: mock(async () => {
    lastResponse = null;
    responseListeners.forEach((l) => l());
  }),
  useLastNotificationResponse: () =>
    useSyncExternalStore(
      (l) => {
        responseListeners.add(l);
        return () => responseListeners.delete(l);
      },
      () => lastResponse,
    ),
};
/** Simulates the user tapping a notification with this `data`. */
export function tapNotification(data: Record<string, unknown>) {
  lastResponse = { actionIdentifier: "default", notification: { request: { content: { data } } } };
  responseListeners.forEach((l) => l());
}

// ---- expo / expo-constants

export const expo = { isRunningInExpoGo: mock(() => false) };
export const constants = { expoConfig: { extra: { hasAndroidMapsKey: true } as Record<string, unknown> } };

// ---- expo-web-browser, expo-network

export const webBrowser = { openBrowserAsync: mock(async (_url: string) => ({ type: "opened" })) };
export const network = { addNetworkStateListener: mock(() => ({ remove: () => {} })) };

// ---- react-native-maps: host "MapView"/"Marker"; the map ref records camera calls.

export const mapCamera = {
  fitToCoordinates: mock((_points: unknown, _options?: unknown) => {}),
  animateCamera: mock((_camera: unknown, _options?: unknown) => {}),
  animateToRegion: mock((_region: unknown, _duration?: number) => {}),
};
function MapView({ ref, children, onMapReady, ...props }: Props) {
  useImperativeHandle(ref, () => mapCamera);
  useEffect(() => {
    onMapReady?.();
    // Once, like the native map becoming ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return createElement("MapView", props, children);
}
const Marker = ({ children, ...props }: Props) => createElement("Marker", props, children);
export const maps = { default: MapView, Marker };

/** Clears recorded calls and restores defaults between tests (called from setup.ts). */
export function __resetNativeMocks() {
  for (const group of [router, location, taskManager, notifications, expo, webBrowser, network, mapCamera, asyncStorage]) {
    for (const fn of Object.values(group)) {
      if (typeof fn === "function" && "mockClear" in fn) (fn as ReturnType<typeof mock>).mockClear();
    }
  }
  router.canGoBack.mockImplementation(() => true);
  expo.isRunningInExpoGo.mockImplementation(() => false);
  constants.expoConfig.extra = { hasAndroidMapsKey: true };
  searchParams = {};
  lastResponse = null;
  asyncStore.clear();
  nativewind.colorScheme.set.mockClear();
  scheme = "light";
}
