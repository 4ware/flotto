import { ActivityIndicator, Linking, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/features/tours/tour-card";
import { usePalette } from "@/hooks/use-palette";
import { useSetTourStatus, useTour } from "@/lib/api/tours";
import { messages } from "@/lib/messages";

import { ArrivalModal } from "./arrival-modal";
import { updateActiveTour } from "./background/active-tour";
import { stopTracking } from "./background/tracking";
import { useTourTracking, type TrackingStatus } from "./background/use-tour-tracking";
import { RouteMap } from "./route-map";

const back = () => (router.canGoBack() ? router.back() : router.replace("/"));

/** Problems that stop tracking, with what the driver can do about them. */
const blocking: Partial<Record<TrackingStatus, { text: string; settings?: boolean; retry?: false }>> = {
  unsupported: { text: "Die Tourverfolgung ist nur in der flotto-App verfügbar.", retry: false },
  "foreground-denied": {
    text: "Ohne Standortfreigabe kann die Tour nicht verfolgt werden. Bitte erlauben Sie den Zugriff in den Einstellungen.",
    settings: true,
  },
  "background-denied": {
    text: "Damit die Position auch bei gesperrtem Bildschirm gemeldet wird, wählen Sie in den Einstellungen „Immer zulassen“.",
    settings: true,
  },
  "destination-not-found": { text: "Das Ziel wurde auf der Karte nicht gefunden." },
};

export function OnRouteScreen({ id }: { id: string }) {
  const colors = usePalette();
  const tour = useTour(id);
  const data = tour.data;
  const tracking = useTourTracking(data);
  const active = tracking.active;
  const setStatus = useSetTourStatus();

  const complete = () =>
    setStatus.mutate(
      { id, status: "complete" },
      {
        onSuccess: async () => {
          await stopTracking();
          // Back to the "Heute" tab, dropping the tour screens from the stack.
          router.dismissTo("/");
        },
      },
    );

  const problem = blocking[tracking.status];
  const notice =
    tracking.status === "error"
      ? tracking.error
      : active?.reportError
        ? `Position konnte nicht gemeldet werden: ${active.reportError}`
        : null;

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader overline="Unterwegs" title={data?.destinationAddress ?? "Tour"} onBack={back}>
        {data && (
          <Text className="mt-1 font-sans text-xs text-primary-foreground/75">
            {formatTime(data.startsAt)} – {formatTime(data.endsAt)} · {data.licensePlate} · {data.customerName}
          </Text>
        )}
        {data && (
          <Text className="mt-0.5 font-sans text-xs text-primary-foreground/75">Von {data.startAddress}</Text>
        )}
      </ScreenHeader>

      <View className="flex-1">
        {!data ? (
          <View className="flex-1 items-center justify-center gap-4 px-6">
            {tour.isPending ? (
              <ActivityIndicator color={colors.primary} accessibilityLabel={messages.Common.loading} />
            ) : (
              <>
                <Text className="text-center font-sans text-sm text-destructive">{tour.error?.message}</Text>
                <Button label="Erneut versuchen" variant="outline" onPress={() => void tour.refetch()} />
              </>
            )}
          </View>
        ) : problem ? (
          <View className="flex-1 items-center justify-center gap-4 px-6">
            <Text className="text-center font-sans text-sm text-muted-foreground">{problem.text}</Text>
            {problem.settings && (
              <Button label="Einstellungen öffnen" variant="outline" onPress={() => void Linking.openSettings()} />
            )}
            {problem.retry !== false && <Button label="Erneut versuchen" onPress={tracking.retry} />}
          </View>
        ) : !active?.position ? (
          <View className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator color={colors.primary} />
            <Text className="font-sans text-sm text-muted-foreground">Standort wird ermittelt …</Text>
          </View>
        ) : (
          <RouteMap position={active.position} destination={active.destination} destinationLabel={data.destinationAddress} />
        )}

        {data && (
          <ArrivalModal
            visible={!!active?.askArrival && data.status !== "complete"}
            destinationLabel={data.destinationAddress}
            pending={setStatus.isPending}
            error={setStatus.error?.message ?? null}
            onConfirm={complete}
            onDismiss={() => updateActiveTour({ askArrival: false })}
          />
        )}

        {notice && (
          <View className="absolute inset-x-4 bottom-6 rounded-xl border border-border bg-card p-3">
            <Text className="font-sans text-sm text-destructive">{notice}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
