import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { CircleCheck, LogOut, MapPin, Truck } from "lucide-react-native";

import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { usePalette } from "@/hooks/use-palette";
import { useVehicles, type Vehicle } from "@/lib/api/vehicles";
import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/app-state";

const t = messages.Vehicles;

const formatMileage = (km: number | null) =>
  km === null ? "Kilometerstand unbekannt" : `${km.toLocaleString("de-DE")} km`;

function VehicleRow({ vehicle, selected, onPress }: { vehicle: Vehicle; selected: boolean; onPress: () => void }) {
  const hasPosition = vehicle.latitude !== null && vehicle.longitude !== null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityHint="Wählt das Fahrzeug und öffnet die heutige Übersicht"
      className="active:opacity-80"
    >
      <Card className={cn("flex-row items-center gap-3 p-4", selected && "border-primary")}>
        <View className={cn("size-11 items-center justify-center rounded-lg", selected ? "bg-primary" : "bg-secondary")}>
          <Icon as={Truck} size={20} className={selected ? "text-primary-foreground" : "text-primary"} />
        </View>

        <View className="flex-1 gap-0.5">
          <Text className="font-heading">{vehicle.licensePlate}</Text>
          <View className="flex-row flex-wrap items-center gap-x-2">
            <Text className="text-xs text-muted-foreground">{formatMileage(vehicle.mileage)}</Text>
            {hasPosition && (
              <View className="flex-row items-center gap-1">
                <Icon as={MapPin} size={12} className="text-brand" />
                <Text className="text-xs text-brand">Position bekannt</Text>
              </View>
            )}
          </View>
        </View>

        {selected && <Icon as={CircleCheck} size={20} className="text-primary" />}
      </Card>
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
              <Button
                variant="outline"
                onPress={() => setChoosenVehicleId(null)}
                className="mt-4 self-start border-primary-foreground/20 bg-primary-foreground/10 active:bg-primary-foreground/20"
              >
                <Icon as={LogOut} size={16} className="text-primary-foreground" />
                <Text className="font-sans-semibold text-primary-foreground">Fahrzeug verlassen</Text>
              </Button>
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
              <Button variant="outline" onPress={() => void vehicles.refetch()}>
                <Text>Erneut versuchen</Text>
              </Button>
            </>
          ) : (
            <Text className="text-center font-sans text-sm text-muted-foreground">{t.empty}</Text>
          )}
        </View>
      }
    />
  );
}
