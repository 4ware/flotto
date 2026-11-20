import { View } from "react-native";
import { Route } from "lucide-react-native";
import { cva, type VariantProps } from "class-variance-authority";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { mark: "size-7 rounded-lg", icon: 14, wordmark: "text-base" },
  md: { mark: "size-9 rounded-xl", icon: 18, wordmark: "text-[21px]" },
  lg: { mark: "size-12 rounded-2xl", icon: 24, wordmark: "text-[28px]" },
} as const;

const markVariants = cva("items-center justify-center", {
  variants: {
    // default: on regular surfaces. inverse: on the green screen header (bg-primary).
    tone: { default: "bg-primary", inverse: "bg-primary-foreground" },
  },
  defaultVariants: { tone: "default" },
});

const iconVariants = cva("", {
  variants: { tone: { default: "text-primary-foreground", inverse: "text-primary" } },
  defaultVariants: { tone: "default" },
});

const wordmarkVariants = cva("font-display tracking-tighter", {
  variants: { tone: { default: "text-foreground", inverse: "text-primary-foreground" } },
  defaultVariants: { tone: "default" },
});

type LogoProps = VariantProps<typeof markVariants> & {
  size?: keyof typeof SIZES;
  /** Only the green square with the route icon, without "flot.to". */
  markOnly?: boolean;
  className?: string;
};

/** The flot.to logo: the route mark and the "flot.to" wordmark with its orange dot. */
export function Logo({ size = "md", tone, markOnly = false, className }: LogoProps) {
  const s = SIZES[size];
  return (
    <View
      // One image for screen readers, not an icon and three pieces of text.
      accessible
      accessibilityRole="image"
      accessibilityLabel="flot.to"
      className={cn("flex-row items-center gap-2.5", size === "sm" && "gap-2", className)}
    >
      <View className={cn(markVariants({ tone }), s.mark)}>
        <Icon as={Route} size={s.icon} className={iconVariants({ tone })} />
      </View>
      {!markOnly && (
        <Text className={cn(wordmarkVariants({ tone }), s.wordmark)}>
          flot<Text className={cn("font-display text-warning", s.wordmark)}>.</Text>to
        </Text>
      )}
    </View>
  );
}
