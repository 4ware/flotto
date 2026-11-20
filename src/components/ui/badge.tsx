import { Text, View } from "react-native";

type Tone = "brand" | "warning" | "muted";

const dot: Record<Tone, string> = { brand: "bg-brand", warning: "bg-warning", muted: "bg-subtle-foreground" };

export function Badge({ label, tone = "brand" }: { label: string; tone?: Tone }) {
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full border border-border bg-muted px-2.5 py-1">
      <View className={`size-1.5 rounded-full ${dot[tone]}`} />
      <Text className="font-sans-semibold text-[11px] text-primary">{label}</Text>
    </View>
  );
}
