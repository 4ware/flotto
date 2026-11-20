import { useMemo } from "react";
import { ActivityIndicator, RefreshControl, SectionList, Text, View } from "react-native";

import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { dayKey, dayLabel, TourCard } from "@/features/tours/tour-card";
import { usePalette } from "@/hooks/use-palette";
import { useTours, type Tour } from "@/lib/api/tours";
import { useVehicles } from "@/lib/api/vehicles";
import { messages } from "@/lib/messages";
import { useAppState } from "@/state/app-state";

type Section = { key: string; title: string; data: Tour[] };

/**
 * One section per German calendar day: today and later first (soonest on top),
 * then past days (latest on top). Tours arrive sorted by start.
 */
function byDay(tours: Tour[]): Section[] {
  const days = new Map<string, Tour[]>();
  for (const tour of tours) {
    const key = dayKey(new Date(tour.startsAt));
    days.set(key, [...(days.get(key) ?? []), tour]);
  }
  const today = dayKey(new Date());
  const keys = [...days.keys()].sort();
  const ordered = [...keys.filter((k) => k >= today), ...keys.filter((k) => k < today).reverse()];
  return ordered.map((key) => ({ key, title: dayLabel(key), data: days.get(key)! }));
}

export function ToursScreen() {
  const colors = usePalette();
  const { choosenVehicleId } = useAppState();
  const vehicle = useVehicles().data?.find((v) => v.id === choosenVehicleId);
  const tours = useTours(choosenVehicleId);
  const sections = useMemo(() => byDay(tours.data ?? []), [tours.data]);

  return (
    <SectionList
      className="flex-1 bg-background"
      contentContainerClassName="pb-10"
      sections={sections}
      keyExtractor={(tour) => tour.id}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => <Eyebrow className="px-4 pb-3 pt-5">{section.title}</Eyebrow>}
      renderItem={({ item }) => (
        <View className="px-4 pb-3">
          <TourCard tour={item} />
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={tours.isRefetching}
          onRefresh={() => void tours.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListHeaderComponent={
        <ScreenHeader overline="Disposition" title="Ihre Touren">
          <Text className="mt-1 font-sans text-xs text-primary-foreground/75">
            {vehicle ? `Fahrzeug ${vehicle.licensePlate}` : "Alle Fahrzeuge"}
          </Text>
        </ScreenHeader>
      }
      ListEmptyComponent={
        <View className="items-center gap-4 px-6 pt-12">
          {tours.isPending ? (
            <ActivityIndicator color={colors.primary} accessibilityLabel={messages.Common.loading} />
          ) : tours.isError ? (
            <>
              <Text className="text-center font-sans text-sm text-destructive">{tours.error.message}</Text>
              <Button label="Erneut versuchen" variant="outline" onPress={() => void tours.refetch()} />
            </>
          ) : (
            <Text className="text-center font-sans text-sm text-muted-foreground">
              {vehicle ? "Für dieses Fahrzeug sind keine Touren geplant." : "Noch keine Touren angelegt."}
            </Text>
          )}
        </View>
      }
    />
  );
}
