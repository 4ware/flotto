import { View } from "react-native";
import { Route } from "lucide-react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export function BrandMark() {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="size-9 items-center justify-center rounded-xl bg-primary">
        <Icon as={Route} size={18} className="text-primary-foreground" />
      </View>
      <Text className="font-display text-[21px] tracking-tighter">
        flot<Text className="font-display text-[21px] text-warning">.</Text>to
      </Text>
    </View>
  );
}
