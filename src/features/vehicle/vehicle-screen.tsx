import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { router } from "expo-router";
import { CircleCheck, LogOut, MapPin, Truck } from "lucide-react-native";

import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { usePalette } from "@/hooks/use-palette";
import { useVehicles, type Vehicle } from "@/lib/api/vehicles";
import { messages } from "@/lib/messages";
import { useAppState } from "@/state/app-state";

const t = messages.Vehicles;

const formatMileage = (km: number | null) =>
  km === null ? "Kilometerstand unbekannt" : `${km.toLocaleString("de-DE")} km`;

function VehicleRow({ vehicle, selected, onPress }: { vehicle: Vehicle; selected: boolean; onPress: () => void }) {
  const colors = usePalette();
  const hasPosition = vehicle.latitude !== null && vehicle.longitude !== null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityHint="Wählt das Fahrzeug und öffnet die heutige Übersicht"
      className={`flex-row items-center gap-3 rounded-xl border bg-card p-4 active:opacity-80 ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <View
        className={`size-11 items-center justify-center rounded-lg ${selected ? "bg-primary" : "bg-secondary"}`}
      >
        <Truck size={20} color={selected ? colors["primary-foreground"] : colors.primary} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="font-heading text-base text-foreground">{vehicle.licensePlate}</Text>
        <View className="flex-row flex-wrap items-center gap-x-2">
          <Text className="font-sans text-xs text-muted-foreground">{formatMileage(vehicle.mileage)}</Text>
          {hasPosition && (
            <View className="flex-row items-center gap-1">
              <MapPin size={12} color={colors.brand} />
              <Text className="font-sans text-xs text-brand">Position bekannt</Text>
            </View>
          )}
        </View>
      </View>

      {selected && <CircleCheck size={20} color={colors.primary} />}
    </Pressable>
  );
}

export function VehicleScreen() {
  const colors = usePalette();
  const vehicles = useVehicles();
  const { choosenVehicleId, setChoosenVehicleId } = useAppState();

  const chosen = vehicles.data?.find((v) => v.id === choosenVehicleId);

  const choose = (id: string) => {
    setChoosenVehicleId(id);
    router.navigate("/");
  };

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="gap-3 pb-10"
      data={vehicles.data ?? []}
      keyExtractor={(v) => v.id}
      renderItem={({ item }) => (
        <View className="px-4">
          <VehicleRow vehicle={item} selected={item.id === choosenVehicleId} onPress={() => choose(item.id)} />
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={vehicles.isRefetching}
          onRefresh={() => void vehicles.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListHeaderComponent={
        <View className="mb-2">
          <ScreenHeader overline={t.fleet} title={chosen ? chosen.licensePlate : "Fahrzeug wählen"}>
            <Text className="mt-1 font-sans text-xs text-primary-foreground/75">
              {chosen ? "Tippen Sie auf ein anderes Fahrzeug, um zu wechseln." : "Mit welchem Fahrzeug sind Sie heute unterwegs?"}
            </Text>
            {choosenVehicleId !== null && (
              <Pressable
                onPress={() => setChoosenVehicleId(null)}
                accessibilityRole="button"
                className="mt-4 flex-row items-center gap-2 self-start rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-2 active:bg-primary-foreground/20"
              >
                <LogOut size={16} color={colors["primary-foreground"]} />
                <Text className="font-sans-semibold text-sm text-primary-foreground">Fahrzeug verlassen</Text>
              </Pressable>
            )}
          </ScreenHeader>
        </View>
      }
      ListEmptyComponent={
        <View className="items-center gap-4 px-6 pt-12">
          {vehicles.isPending ? (
            <ActivityIndicator color={colors.primary} accessibilityLabel={messages.Common.loading} />
          ) : vehicles.isError ? (
            <>
              <Text className="text-center font-sans text-sm text-destructive">{vehicles.error.message}</Text>
              <Button label="Erneut versuchen" variant="outline" onPress={() => void vehicles.refetch()} />
            </>
          ) : (
            <Text className="text-center font-sans text-sm text-muted-foreground">{t.empty}</Text>
          )}
        </View>
      }
    />
  );
}
