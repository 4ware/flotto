import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowDown, ChevronRight } from "lucide-react-native";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { usePalette } from "@/hooks/use-palette";
import type { Tour } from "@/lib/api/tours";
import { messages } from "@/lib/messages";

export const statusTone = { pending: "brand", started: "warning", complete: "muted" } as const;

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
  const colors = usePalette();
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/tour/[id]", params: { id: tour.id } })}
      accessibilityRole="button"
      accessibilityHint="Öffnet die Tour"
      className="active:opacity-80"
    >
      <Card className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-heading text-base text-foreground">
            {formatTime(tour.startsAt)} – {formatTime(tour.endsAt)}
          </Text>
          <Badge label={messages.Tours.statuses[tour.status]} tone={statusTone[tour.status]} />
        </View>

        <View className="gap-1">
          <Text className="font-sans-medium text-sm text-foreground">{tour.startAddress}</Text>
          <ArrowDown size={14} color={colors["subtle-foreground"]} />
          <Text className="font-sans-medium text-sm text-foreground">{tour.destinationAddress}</Text>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 font-sans text-xs text-muted-foreground">Kunde · {tour.customerName}</Text>
          <ChevronRight size={18} color={colors["subtle-foreground"]} />
        </View>
      </Card>
    </Pressable>
  );
}
