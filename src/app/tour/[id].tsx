import { useLocalSearchParams } from "expo-router";

import { TourScreen } from "@/features/tour/tour-screen";

export default function TourRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TourScreen id={id} />;
}
