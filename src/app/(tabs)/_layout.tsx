import { Tabs } from "expo-router/js-tabs";
import { House, ListChecks, Truck, User } from "lucide-react-native";

import { usePalette } from "@/hooks/use-palette";

export default function TabsLayout() {
  const colors = usePalette();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors["subtle-foreground"],
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: "DMSans_600SemiBold", fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Heute", tabBarIcon: ({ color }) => <House size={22} color={color} /> }} />
      <Tabs.Screen name="touren" options={{ title: "Touren", tabBarIcon: ({ color }) => <ListChecks size={22} color={color} /> }} />
      <Tabs.Screen name="fahrzeug" options={{ title: "Fahrzeug", tabBarIcon: ({ color }) => <Truck size={22} color={color} /> }} />
      <Tabs.Screen name="profil" options={{ title: "Profil", tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tabs>
  );
}
