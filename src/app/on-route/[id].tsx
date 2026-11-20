import { useLocalSearchParams } from "expo-router";

import { OnRouteScreen } from "@/features/on-route/on-route-screen";

export default function OnRouteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OnRouteScreen id={id} />;
}
