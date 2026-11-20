import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { ArrowDown, ChevronRight } from "lucide-react-native";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { Tour } from "@/lib/api/tours";

import { TourStatusBadge } from "./tour-status-badge";

// Tours are planned in German time, whatever the device's zone.
const TIME_ZONE = "Europe/Berlin";

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });

/** The German calendar day of an instant, as YYYY-MM-DD (sortable). */
export function dayKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIME_ZONE,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** "Heute", "Morgen", "Gestern", otherwise e.g. "Fr., 21.11.2026". */
export function dayLabel(key: string, now = new Date()) {
  const day = 24 * 60 * 60 * 1000;
  if (key === dayKey(now)) return "Heute";
  if (key === dayKey(new Date(now.getTime() + day))) return "Morgen";
  if (key === dayKey(new Date(now.getTime() - day))) return "Gestern";
  // Noon UTC is the same calendar day in Germany.
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

/** Opens the tour's own screen when tapped. */
export function TourCard({ tour }: { tour: Tour }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/tour/[id]", params: { id: tour.id } })}
      accessibilityRole="button"
      accessibilityHint="Öffnet die Tour"
      className="active:opacity-80"
    >
      <Card className="gap-3 p-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-heading">
            {formatTime(tour.startsAt)} – {formatTime(tour.endsAt)}
          </Text>
          <TourStatusBadge status={tour.status} />
        </View>

        <View className="gap-1">
          <Text className="font-sans-medium text-sm">{tour.startAddress}</Text>
          <Icon as={ArrowDown} className="text-subtle-foreground" />
          <Text className="font-sans-medium text-sm">{tour.destinationAddress}</Text>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-xs text-muted-foreground">Kunde · {tour.customerName}</Text>
          <Icon as={ChevronRight} size={18} className="text-subtle-foreground" />
        </View>
      </Card>
    </Pressable>
  );
}
