import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ModeToggle } from "@/components/mode-toggle";
import { usePalette } from "@/hooks/use-palette";

/** Deep-green header block, as in the flot.to driver-app mockup. Always carries the color-scheme toggle. */
export function ScreenHeader({
  overline,
  title,
  right,
  onBack,
  children,
}: {
  overline: string;
  title: string;
  right?: ReactNode;
  /** Shows a back button before the overline. */
  onBack?: () => void;
  children?: ReactNode;
}) {
  const { top } = useSafeAreaInsets();
  const colors = usePalette();
  return (
    <View className="rounded-b-3xl bg-primary px-5 pb-6" style={{ paddingTop: top + 16 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {onBack && (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Zurück"
              hitSlop={8}
              className="size-9 items-center justify-center rounded-full bg-primary-foreground/15 active:bg-primary-foreground/25"
            >
              <ChevronLeft size={18} color={colors["primary-foreground"]} />
            </Pressable>
          )}
          <Text className="font-sans-semibold text-xs tracking-wide text-primary-foreground/75">{overline}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {right}
          <ModeToggle />
        </View>
      </View>
      <Text className="mt-3 font-display text-3xl tracking-tighter text-primary-foreground">{title}</Text>
      {children}
    </View>
  );
}

export function HeaderIcon({ children }: { children: ReactNode }) {
  return (
    <View className="size-9 items-center justify-center rounded-full bg-primary-foreground/15">{children}</View>
  );
}
