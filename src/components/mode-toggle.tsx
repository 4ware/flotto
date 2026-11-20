import { useRef, useState } from "react";
import { Modal, Pressable, Text, View, type HostInstance } from "react-native";
import { Moon, Sun } from "lucide-react-native";

import { usePalette } from "@/hooks/use-palette";
import {
  COLOR_SCHEMES,
  setColorSchemePreference,
  useColorSchemePreference,
  useResolvedColorScheme,
  type ColorSchemePreference,
} from "@/theme/color-scheme";

const LABELS: Record<ColorSchemePreference, string> = { light: "Hell", dark: "Dunkel", system: "System" };

type Anchor = { top: number; right: number };

const TRIGGER = {
  // On the green screen header.
  header:
    "border-primary-foreground/20 bg-primary-foreground/10 active:bg-primary-foreground/20",
  // On regular surfaces, like the web app's outline icon button.
  surface: "border-border bg-background active:bg-muted dark:border-input dark:bg-input/30",
} as const;

/** Color-scheme dropdown, mirroring the web app's ModeToggle (Hell / Dunkel / System). */
export function ModeToggle({ variant = "header" }: { variant?: keyof typeof TRIGGER }) {
  const colors = usePalette();
  const isDark = useResolvedColorScheme() === "dark";
  const preference = useColorSchemePreference();
  const trigger = useRef<HostInstance>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const open = () => {
    trigger.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y + height + 6, right: x + width });
    });
  };

  const choose = (value: ColorSchemePreference) => {
    setColorSchemePreference(value);
    setAnchor(null);
  };

  const Icon = isDark ? Moon : Sun;

  return (
    <>
      <Pressable
        ref={trigger}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Farbschema wählen"
        className={`size-9 items-center justify-center rounded-lg border ${TRIGGER[variant]}`}
      >
        <Icon size={16} color={variant === "header" ? colors["primary-foreground"] : colors.foreground} />
      </Pressable>

      <Modal visible={anchor !== null} transparent animationType="fade" onRequestClose={() => setAnchor(null)}>
        <Pressable className="flex-1" onPress={() => setAnchor(null)} accessibilityLabel="Schließen">
          {anchor && (
            <View
              accessibilityRole="radiogroup"
              className="absolute min-w-36 rounded-lg border border-border bg-card p-1"
              style={{
                top: anchor.top,
                left: anchor.right,
                transform: [{ translateX: "-100%" }],
                boxShadow: "0 12px 32px -12px rgba(29, 57, 43, 0.28)",
              }}
            >
              {COLOR_SCHEMES.map((value) => {
                const selected = value === preference;
                return (
                  <Pressable
                    key={value}
                    onPress={() => choose(value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    className="flex-row items-center justify-between gap-6 rounded-md px-2.5 py-2 active:bg-muted"
                  >
                    <Text className="font-sans-medium text-sm text-card-foreground">{LABELS[value]}</Text>
                    <View className="size-4 items-center justify-center">
                      {selected && <View className="size-2 rounded-full bg-foreground" />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}
