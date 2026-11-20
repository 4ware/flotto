import { Text, View } from "react-native";

import type { RouteMapProps } from "./route-map";

/** react-native-maps has no web support; the web build shows the coordinates instead. */
export function RouteMap({ position, destination, destinationLabel }: RouteMapProps) {
  const format = (p: RouteMapProps["position"]) => (p ? `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}` : "–");
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-muted px-6">
      <Text className="text-center font-sans text-sm text-muted-foreground">Die Karte ist nur in der App verfügbar.</Text>
      <Text className="text-center font-sans text-xs text-subtle-foreground">Position: {format(position)}</Text>
      <Text className="text-center font-sans text-xs text-subtle-foreground">
        Ziel ({destinationLabel}): {format(destination)}
      </Text>
    </View>
  );
}
