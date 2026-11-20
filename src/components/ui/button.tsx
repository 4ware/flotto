import type { ComponentType } from "react";
import { Pressable, Text } from "react-native";
import type { LucideProps } from "lucide-react-native";

import { usePalette } from "@/hooks/use-palette";

type Props = {
  label: string;
  icon?: ComponentType<LucideProps>;
  variant?: "primary" | "outline";
  onPress?: () => void;
};

export function Button({ label, icon: Icon, variant = "primary", onPress }: Props) {
  const colors = usePalette();
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      className={`h-12 flex-row items-center justify-center gap-2 rounded-lg px-5 active:opacity-80 ${
        primary ? "bg-primary" : "border border-border bg-background"
      }`}
    >
      {Icon && <Icon size={18} color={primary ? colors["primary-foreground"] : colors.foreground} />}
      <Text
        className={`font-sans-semibold text-sm ${primary ? "text-primary-foreground" : "text-foreground"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
