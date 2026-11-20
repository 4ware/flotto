import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { router } from "expo-router";
import { Bell, Truck } from "lucide-react-native";

import { HeaderIcon, ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/features/tours/tour-card";
import { usePalette } from "@/hooks/use-palette";
import { useCurrentUser } from "@/lib/api/auth";
import { useTodaysTours } from "@/lib/api/tours";
import { useVehicles } from "@/lib/api/vehicles";
import { messages } from "@/lib/messages";
import { useAppState } from "@/state/app-state";

function greeting(hour = new Date().getHours()) {
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export function TodayScreen() {
  const colors = usePalette();
  const user = useCurrentUser();
  const { choosenVehicleId } = useAppState();
  const vehicle = useVehicles().data?.find((v) => v.id === choosenVehicleId);
  const tours = useTodaysTours(choosenVehicleId);

  const count = tours.data?.length ?? 0;
  const summary = !choosenVehicleId
    ? "Kein Fahrzeug gewählt"
    : tours.isSuccess
      ? `Heute · ${count === 1 ? "1 Tour" : `${count} Touren`}`
      : "Heute";

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="gap-3 pb-10"
      data={tours.data ?? []}
      keyExtractor={(tour) => tour.id}
      renderItem={({ item }) => (
        <View className="px-4">
          <TourCard tour={item} />
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={tours.isRefetching}
          onRefresh={() => void tours.refetch()}
          enabled={choosenVehicleId !== null}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListHeaderComponent={
        <View className="mb-2">
          <ScreenHeader
            overline={`${greeting()}, ${user.firstName}`}
            title={vehicle?.licensePlate ?? "Ihre Touren"}
            right={
              <HeaderIcon>
                <Bell size={16} color={colors["primary-foreground"]} />
              </HeaderIcon>
            }
          >
            <Text className="mt-1 font-sans text-xs text-primary-foreground/75">{summary}</Text>
          </ScreenHeader>
        </View>
      }
      ListEmptyComponent={
        <View className="items-center gap-4 px-6 pt-12">
          {!choosenVehicleId ? (
            <>
              <Text className="text-center font-sans text-sm text-muted-foreground">
                Wählen Sie ein Fahrzeug, um Ihre heutigen Touren zu sehen.
              </Text>
              <Button label="Fahrzeug wählen" icon={Truck} onPress={() => router.navigate("/fahrzeug")} />
            </>
          ) : tours.isPending ? (
            <ActivityIndicator color={colors.primary} accessibilityLabel={messages.Common.loading} />
          ) : tours.isError ? (
            <>
              <Text className="text-center font-sans text-sm text-destructive">{tours.error.message}</Text>
              <Button label="Erneut versuchen" variant="outline" onPress={() => void tours.refetch()} />
            </>
          ) : (
            <Text className="text-center font-sans text-sm text-muted-foreground">
              Für dieses Fahrzeug sind heute keine Touren geplant.
            </Text>
          )}
        </View>
      }
    />
  );
}
