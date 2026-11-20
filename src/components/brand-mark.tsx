import { Text, View } from "react-native";
import { Route } from "lucide-react-native";

import { usePalette } from "@/hooks/use-palette";

export function BrandMark() {
  const colors = usePalette();
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="size-9 items-center justify-center rounded-xl bg-primary">
        <Route size={18} color={colors["primary-foreground"]} />
      </View>
      <Text className="font-display text-[21px] tracking-tighter text-foreground">
        flot<Text className="text-warning">.</Text>to
      </Text>
    </View>
  );
}
