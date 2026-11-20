import type { ComponentType } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Building2, CalendarDays, Clock, Flag, MapPin, Navigation, Play, Truck, type LucideProps } from "lucide-react-native";

import { ScreenHeader } from "@/components/screen-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { dayKey, dayLabel, formatTime, statusTone } from "@/features/tours/tour-card";
import { usePalette } from "@/hooks/use-palette";
import { ApiError } from "@/lib/api/client";
import { useSetTourStatus, useTour } from "@/lib/api/tours";
import { messages } from "@/lib/messages";

function Row({ icon: Icon, label, value }: { icon: ComponentType<LucideProps>; label: string; value: string }) {
  const colors = usePalette();
  return (
    <View className="flex-row items-start gap-3">
      <View className="size-9 items-center justify-center rounded-lg bg-secondary">
        <Icon size={16} color={colors.primary} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-sans text-xs text-subtle-foreground">{label}</Text>
        <Text className="font-sans-medium text-sm text-foreground">{value}</Text>
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
  const start = () => {
    if (setStatus.isPending) return;
    setStatus.mutate({ id, status: "started" }, { onSuccess: openRoute });
  };
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
          <Text className="mt-1 font-sans text-xs text-primary-foreground/75">
            {dayLabel(startDay)} · {data.licensePlate}
          </Text>
        )}
      </ScreenHeader>

      {data ? (
        <View className="gap-3 px-4 pt-5">
          <Badge label={messages.Tours.statuses[data.status]} tone={statusTone[data.status]} />

          <Eyebrow className="pt-2">Route</Eyebrow>
          <Card className="gap-4">
            <Row icon={MapPin} label="Start" value={data.startAddress} />
            <Row icon={Flag} label="Ziel" value={data.destinationAddress} />
          </Card>

          <Eyebrow className="pt-2">Zeit</Eyebrow>
          <Card className="gap-4">
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
          <Card className="gap-4">
            <Row icon={Building2} label="Kunde" value={data.customerName} />
            <Row icon={Truck} label="Fahrzeug" value={data.licensePlate} />
          </Card>

          <View className="gap-2 pt-3">
            {data.status === "pending" && (
              <Button label={setStatus.isPending ? "Wird gestartet …" : "Tour starten"} icon={Play} onPress={start} />
            )}
            {data.status === "started" && <Button label="Unterwegs-Ansicht öffnen" icon={Navigation} onPress={openRoute} />}
            {setStatus.error && (
              <Text className="text-center font-sans text-sm text-destructive">{setStatus.error.message}</Text>
            )}
          </View>
        </View>
      ) : (
        <View className="items-center gap-4 px-6 pt-12">
          {tour.isPending ? (
            <ActivityIndicator color={colors.primary} accessibilityLabel={messages.Common.loading} />
          ) : (
            <>
              <Text className="text-center font-sans text-sm text-destructive">{tour.error?.message}</Text>
              {tour.error instanceof ApiError && tour.error.status === 404 ? (
                <Button label="Zur Tourenliste" variant="outline" onPress={back} />
              ) : (
                <Button label="Erneut versuchen" variant="outline" onPress={() => void tour.refetch()} />
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}
