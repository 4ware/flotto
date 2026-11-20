import type { ReactNode } from "react";
import { View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

/**
 * Deep-green header block, as in the flot.to driver-app mockup: the logo (after an optional back
 * button) and the color-scheme toggle on top, then the title with the overline under it.
 */
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
  return (
    <View className="rounded-b-3xl bg-primary px-5 pb-6" style={{ paddingTop: top + 16 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onPress={onBack}
              accessibilityLabel="Zurück"
              hitSlop={8}
              className="size-9 rounded-full bg-primary-foreground/15 active:bg-primary-foreground/25"
            >
              <Icon as={ChevronLeft} size={18} className="text-primary-foreground" />
            </Button>
          )}
          <Logo size="sm" tone="inverse" />
        </View>
        <View className="flex-row items-center gap-2">
          {right}
          <ModeToggle />
        </View>
      </View>
      <Text className="mt-4 font-display text-3xl tracking-tighter text-primary-foreground">{title}</Text>
      <Text className="mt-1 font-sans-semibold text-xs tracking-wide text-primary-foreground/75">{overline}</Text>
      {children}
    </View>
  );
}

export function HeaderIcon({ children }: { children: ReactNode }) {
  return (
    <View className="size-9 items-center justify-center rounded-full bg-primary-foreground/15">{children}</View>
  );
}
