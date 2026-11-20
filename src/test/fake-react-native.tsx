// A small stand-in for `react-native` under `bun test` (registered in ./setup.ts).
// The real package is Flow source with native modules and can't run in Bun.
// RNTL only needs host elements with React Native's names (View, Text, TextInput, Modal, ...)
// and StyleSheet, so each component renders a host element with the props a test can query.
import {
  createElement,
  Fragment,
  useImperativeHandle,
  type ComponentType,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { mock } from "bun:test";

type Props = Record<string, any> & { children?: ReactNode; ref?: Ref<unknown> };

/** Methods tests may call on refs (measureInWindow for dropdown anchors, focus for inputs). */
const instanceMethods = {
  measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) =>
    callback(0, 0, 36, 36),
  measure: (callback: (...args: number[]) => void) => callback(0, 0, 36, 36, 0, 0),
  focus: () => {},
  blur: () => {},
};

function host(name: string) {
  function HostComponent({ ref, children, ...props }: Props) {
    useImperativeHandle(ref, () => instanceMethods);
    return createElement(name, props, children);
  }
  HostComponent.displayName = name;
  return HostComponent;
}

export const View = host("View");
export const Text = host("Text");
export const TextInput = host("TextInput");
export const Image = host("Image");
export const ImageBackground = host("View");
export const ActivityIndicator = host("ActivityIndicator");
export const RefreshControl = host("RefreshControl");
export const KeyboardAvoidingView = host("View");
export const SafeAreaView = host("View");

/** Like React Native's: `disabled` drops the press handlers and shows up in accessibilityState. */
export function Pressable({ ref, children, disabled, onPress, onPressIn, onPressOut, onLongPress, ...props }: Props) {
  useImperativeHandle(ref, () => instanceMethods);
  const state = { ...props.accessibilityState, ...(disabled != null && { disabled: !!disabled }) };
  const handlers = disabled ? {} : { onPress, onPressIn, onPressOut, onLongPress };
  return createElement(
    "View",
    { ...props, ...handlers, accessible: props.accessible ?? true, accessibilityState: state },
    typeof children === "function" ? (children as (state: { pressed: boolean }) => ReactNode)({ pressed: false }) : children,
  );
}
export const TouchableOpacity = Pressable;

/** Real Modal renders nothing while hidden. */
export function Modal({ visible = true, children, ...props }: Props) {
  return visible ? createElement("Modal", { ...props, visible }, children) : null;
}

export function ScrollView({ ref, children, refreshControl, contentContainerStyle, ...props }: Props) {
  useImperativeHandle(ref, () => ({ ...instanceMethods, scrollTo: () => {}, scrollToEnd: () => {} }));
  return createElement(
    "RCTScrollView",
    props,
    refreshControl,
    createElement("View", { style: contentContainerStyle }, children),
  );
}

type ListSlot = ComponentType | ReactElement | null | undefined;
const renderSlot = (slot: ListSlot) =>
  slot == null ? null : typeof slot === "function" ? createElement(slot) : slot;

type ListProps = Props & { data?: readonly any[]; renderItem?: (info: any) => ReactNode; keyExtractor?: (item: any, index: number) => string };

export function FlatList({ data = [], renderItem, keyExtractor, ListHeaderComponent, ListEmptyComponent, ListFooterComponent, ...props }: ListProps) {
  return createElement(
    ScrollView,
    props,
    renderSlot(ListHeaderComponent),
    data.length === 0
      ? renderSlot(ListEmptyComponent)
      : data.map((item, index) =>
          createElement(Fragment, { key: keyExtractor?.(item, index) ?? String(index) }, renderItem?.({ item, index })),
        ),
    renderSlot(ListFooterComponent),
  );
}

export function SectionList({
  sections = [],
  renderItem,
  renderSectionHeader,
  keyExtractor,
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
  ...props
}: Props) {
  const empty = sections.every((s: { data: unknown[] }) => s.data.length === 0);
  return createElement(
    ScrollView,
    props,
    renderSlot(ListHeaderComponent),
    empty
      ? renderSlot(ListEmptyComponent)
      : sections.map((section: { key?: string; data: unknown[] }, s: number) =>
          createElement(
            Fragment,
            { key: section.key ?? String(s) },
            renderSectionHeader?.({ section }),
            section.data.map((item, index) =>
              createElement(Fragment, { key: keyExtractor?.(item, index) ?? String(index) }, renderItem?.({ item, index, section })),
            ),
          ),
        ),
    renderSlot(ListFooterComponent),
  );
}

type Style = Record<string, unknown>;
function flatten(style: unknown): Style | undefined {
  if (!style) return undefined;
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return style as Style;
}

export const StyleSheet = {
  create: <T,>(styles: T) => styles,
  flatten,
  compose: (a: unknown, b: unknown) => [a, b],
  hairlineWidth: 1,
  absoluteFill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  absoluteFillObject: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
};

/** Tests switch platforms with `Platform.OS = "web"` (reset in setup.ts). */
export const Platform = {
  OS: "android" as "android" | "ios" | "web",
  Version: 36,
  select<T>(choices: { android?: T; ios?: T; web?: T; native?: T; default?: T }) {
    const os = Platform.OS;
    return (os in choices ? choices[os] : os !== "web" && "native" in choices ? choices.native : choices.default) as T;
  },
};

export const Linking = {
  openSettings: mock(async () => {}),
  openURL: mock(async (_url: string) => {}),
};

type AppStateListener = (state: string) => void;
const appStateListeners = new Set<AppStateListener>();
export const AppState = {
  currentState: "active" as "active" | "background" | "inactive",
  addEventListener(_type: "change", listener: AppStateListener) {
    appStateListeners.add(listener);
    return { remove: () => appStateListeners.delete(listener) };
  },
  /** Test helper: change the state and notify listeners. */
  __set(state: "active" | "background" | "inactive") {
    AppState.currentState = state;
    appStateListeners.forEach((l) => l(state));
  },
};

export const Dimensions = {
  get: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
};

export const Appearance = {
  getColorScheme: () => "light" as const,
  addChangeListener: () => ({ remove: () => {} }),
};

export const useColorScheme = () => "light" as const;
export const useWindowDimensions = () => Dimensions.get();

export const Keyboard = { dismiss: () => {}, addListener: () => ({ remove: () => {} }) };
export const Alert = { alert: mock(() => {}) };

/** Resets mutable state between tests (called from setup.ts). */
export function __resetReactNative() {
  Platform.OS = "android";
  AppState.currentState = "active";
  appStateListeners.clear();
  Linking.openSettings.mockClear();
  Linking.openURL.mockClear();
  Alert.alert.mockClear();
}
