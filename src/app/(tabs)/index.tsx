import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";

import { TodayScreen } from "@/features/today/today-screen";
import { useAppState } from "@/state/app-state";

export default function TodayRoute() {
  const { choosenVehicleId } = useAppState();
  // Decided once when the tabs open: without a chosen vehicle, start on "Fahrzeug" instead.
  // Afterwards "Heute" stays reachable through the tab bar.
  const [startOnVehicle, setStartOnVehicle] = useState(() => choosenVehicleId === null);

  useFocusEffect(
    useCallback(() => {
      if (!startOnVehicle) return;
      setStartOnVehicle(false);
      router.replace("/fahrzeug");
    }, [startOnVehicle]),
  );

  return startOnVehicle ? null : <TodayScreen />;
}
