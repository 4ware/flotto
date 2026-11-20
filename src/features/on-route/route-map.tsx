import { useEffect, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import MapView, { Marker } from "react-native-maps";
import { Truck } from "lucide-react-native";

import { usePalette } from "@/hooks/use-palette";
import type { Position } from "@/lib/api/vehicles";
import { useResolvedColorScheme } from "@/theme/color-scheme";

export type RouteMapProps = { position: Position | null; destination: Position | null; destinationLabel: string };

const DEFAULT_DELTA = { latitudeDelta: 0.05, longitudeDelta: 0.05 };
/** Street level, for following the vehicle. */
const FOLLOW_ZOOM = 16;

/** Custom marker views are snapshotted; give the SVG icon a moment to draw before freezing it. */
function TruckMarker({ position }: { position: Position }) {
  const colors = usePalette();
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker coordinate={position} title="Ihr Fahrzeug" anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={tracksViewChanges}>
      <View
        className="size-10 items-center justify-center rounded-full border-2 bg-primary"
        style={{ borderColor: colors["primary-foreground"] }}
      >
        <Truck size={20} color={colors["primary-foreground"]} />
      </View>
    </Marker>
  );
}

/**
 * Android builds need our own Google Maps key (app.config.ts); without it the native map crashes.
 * Expo Go ships with a key of its own.
 */
const mapsAvailable =
  Platform.OS !== "android" ||
  isRunningInExpoGo() ||
  Constants.expoConfig?.extra?.hasAndroidMapsKey === true;

/**
 * Fills its parent. Until the vehicle moves, it shows the vehicle and the destination together;
 * once it moves, it zooms in on the vehicle and follows it.
 */
export function RouteMap(props: RouteMapProps) {
  if (!mapsAvailable) return <MissingMapsKey {...props} />;
  return <GoogleRouteMap {...props} />;
}

function MissingMapsKey({ position }: RouteMapProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-muted px-6">
      <Text className="text-center font-sans-medium text-sm text-foreground">Karte nicht verfügbar</Text>
      <Text className="text-center font-sans text-xs text-muted-foreground">
        Für diese App-Version ist kein Google-Maps-Schlüssel hinterlegt. Die Position wird trotzdem gemeldet.
      </Text>
      {position && (
        <Text className="text-center font-sans text-xs text-subtle-foreground">
          {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
        </Text>
      )}
    </View>
  );
}

function GoogleRouteMap({ position, destination, destinationLabel }: RouteMapProps) {
  const map = useRef<MapView>(null);
  // The app's scheme: the system setting unless the header toggle overrides it.
  const scheme = useResolvedColorScheme();
  const [firstPosition, setFirstPosition] = useState<Position | null>(null);
  const [following, setFollowing] = useState(false);

  // Adjusting state while rendering (React's pattern for deriving from changed props).
  if (position && !firstPosition) setFirstPosition(position);
  const moved =
    !!position &&
    !!firstPosition &&
    (position.latitude !== firstPosition.latitude || position.longitude !== firstPosition.longitude);
  if (moved && !following) setFollowing(true);

  const points = [position, destination].filter((p): p is Position => p !== null);
  const key = points.map((p) => `${p.latitude},${p.longitude}`).join("|");

  // Calls before the map is ready are dropped, so this also runs in onMapReady.
  const frame = () => {
    if (following && position) {
      map.current?.animateCamera({ center: position, zoom: FOLLOW_ZOOM }, { duration: 800 });
    } else if (points.length === 2) {
      map.current?.fitToCoordinates(points, {
        edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
        animated: true,
      });
    } else if (points.length === 1) {
      map.current?.animateToRegion({ ...points[0], ...DEFAULT_DELTA });
    }
  };

  // Re-frame whenever a point moves or following starts.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` and `following` capture what frame reads
  useEffect(frame, [key, following]);

  return (
    <MapView
      // Android reads userInterfaceStyle only when the map is created: recreate it on a scheme change.
      // onMapReady then frames it again.
      key={scheme}
      ref={map}
      style={{ flex: 1 }}
      initialRegion={points[0] ? { ...points[0], ...DEFAULT_DELTA } : undefined}
      showsUserLocation={false}
      toolbarEnabled={false}
      userInterfaceStyle={scheme}
      onMapReady={frame}
    >
      {position && <TruckMarker position={position} />}
      {destination && <Marker coordinate={destination} title="Ziel" description={destinationLabel} />}
    </MapView>
  );
}
