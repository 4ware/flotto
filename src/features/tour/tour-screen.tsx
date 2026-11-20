import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Building2, CalendarDays, Clock, Flag, MapPin, Navigation, Play, Truck, type LucideIcon } from "lucide-react-native";

import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { dayKey, dayLabel, formatTime } from "@/features/tours/tour-card";
import { TourStatusBadge } from "@/features/tours/tour-status-badge";
import { usePalette } from "@/hooks/use-palette";
import { ApiError } from "@/lib/api/client";
import { useSetTourStatus, useTour } from "@/lib/api/tours";
import { messages } from "@/lib/messages";

function Row({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="size-9 items-center justify-center rounded-lg bg-secondary">
        <Icon as={icon} size={16} className="text-primary" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-xs text-subtle-foreground">{label}</Text>
        <Text className="font-sans-medium text-sm">{value}</Text>
      </View>
    </View>
  );
}

const back = () => (router.canGoBack() ? router.back() : router.replace("/touren"));

export function TourScreen({ id }: { id: string }) {
  const colors = usePalette();
  const tour = useTour(id);
  const data = tour.data;
  const setStatus = useSetTourStatus();

  const openRoute = () => router.push({ pathname: "/on-route/[id]", params: { id } });
  const start = () => setStatus.mutate({ id, status: "started" }, { onSuccess: openRoute });
  const startDay = data ? dayKey(new Date(data.startsAt)) : "";
  const endDay = data ? dayKey(new Date(data.endsAt)) : "";

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="pb-10"
      refreshControl={
        <RefreshControl
          refreshing={tour.isRefetching}
          onRefresh={() => void tour.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <ScreenHeader
        overline="Tour"
        title={data ? `${formatTime(data.startsAt)} – ${formatTime(data.endsAt)}` : "Tour"}
        onBack={back}
      >
        {data && (
          <Text className="mt-1 text-xs text-primary-foreground/75">
            {dayLabel(startDay)} · {data.licensePlate}
          </Text>
        )}
      </ScreenHeader>

      {data ? (
        <View className="gap-3 px-4 pt-5">
          <TourStatusBadge status={data.status} />

          <Eyebrow className="pt-2">Route</Eyebrow>
          <Card className="gap-4 p-4">
            <Row icon={MapPin} label="Start" value={data.startAddress} />
            <Row icon={Flag} label="Ziel" value={data.destinationAddress} />
          </Card>

          <Eyebrow className="pt-2">Zeit</Eyebrow>
          <Card className="gap-4 p-4">
            <Row icon={CalendarDays} label="Datum" value={dayLabel(startDay)} />
            <Row icon={Clock} label="Beginn" value={`${formatTime(data.startsAt)} Uhr`} />
            {/* Tours can run past midnight: then the end names its own day. */}
            <Row
              icon={Clock}
              label="Ende"
              value={`${endDay === startDay ? "" : `${dayLabel(endDay)}, `}${formatTime(data.endsAt)} Uhr`}
            />
          </Card>

          <Eyebrow className="pt-2">Auftrag</Eyebrow>
          <Card className="gap-4 p-4">
            <Row icon={Building2} label="Kunde" value={data.customerName} />
            <Row icon={Truck} label="Fahrzeug" value={data.licensePlate} />
          </Card>

          <View className="gap-2 pt-3">
            {data.status === "pending" && (
              <Button size="lg" onPress={start} disabled={setStatus.isPending}>
                <Icon as={Play} size={18} />
                <Text>{setStatus.isPending ? "Wird gestartet …" : "Tour starten"}</Text>
              </Button>
            )}
            {data.status === "started" && (
              <Button size="lg" onPress={openRoute}>
                <Icon as={Navigation} size={18} />
                <Text>Unterwegs-Ansicht öffnen</Text>
              </Button>
            )}
            {setStatus.error && <Text className="text-center text-sm text-destructive">{setStatus.error.message}</Text>}
          </View>
        </View>
      ) : (
        <View className="items-center gap-4 px-6 pt-12">
          {tour.isPending ? (
            <ActivityIndicator color={colors.primary} accessibilityLabel={messages.Common.loading} />
          ) : (
            <>
              <Text className="text-center text-sm text-destructive">{tour.error?.message}</Text>
              {tour.error instanceof ApiError && tour.error.status === 404 ? (
                <Button variant="outline" onPress={back}>
                  <Text>Zur Tourenliste</Text>
                </Button>
              ) : (
                <Button variant="outline" onPress={() => void tour.refetch()}>
                  <Text>Erneut versuchen</Text>
                </Button>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}
