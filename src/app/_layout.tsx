import "../global.css";
// localStorage for src/state/app-state.tsx (expo-sqlite on native, the browser's own on web).
import "@/state/install-local-storage";
// Background tasks must be defined at module load, also when Android starts the app only to run one.
import "@/features/on-route/background/tasks";

import { useEffect, useState } from "react";
import { Stack, ThemeProvider } from "expo-router";
import { PortalHost } from "@rn-primitives/portal";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { Manrope_700Bold, Manrope_800ExtraBold } from "@expo-google-fonts/manrope";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

import { useArrivalNotificationResponse } from "@/features/on-route/background/use-arrival-notification-response";
import { useSession } from "@/lib/api/auth";
import { NAV_THEME } from "@/lib/theme";
import { queryClient } from "@/lib/query-client";
import { AppStateProvider } from "@/state/app-state";
import { loadColorSchemePreference, useResolvedColorScheme } from "@/theme/color-scheme";

SplashScreen.preventAutoHideAsync();
const schemeLoaded = loadColorSchemePreference();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <RootNavigator />
      </AppStateProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const scheme = useResolvedColorScheme();
  const session = useSession();
  const [schemeReady, setSchemeReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    schemeLoaded.then(() => setSchemeReady(true));
  }, []);

  // Keep the splash screen up until we know whether someone is signed in.
  const ready = schemeReady && (fontsLoaded || !!fontError) && !session.isPending;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Navigation needs the signed-in stack mounted.
  useArrivalNotificationResponse(ready && !!session.data);

  if (!ready) return null;

  const signedIn = !!session.data;

  return (
    <ThemeProvider value={NAV_THEME[scheme]}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Signed out, only the login screen exists; the app's screens redirect to it. */}
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="tour/[id]" />
          <Stack.Screen name="on-route/[id]" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
      {/* Light text on the green header; the login screen has a light surface. */}
      <StatusBar style={!signedIn ? "auto" : scheme === "dark" ? "dark" : "light"} />
      {/* Where React Native Reusables' menus and dialogs render (last, above everything). */}
      <PortalHost />
    </ThemeProvider>
  );
}
