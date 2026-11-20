import type { ConfigContext, ExpoConfig } from "expo/config";

// app.json holds the config; this file only adds what comes from the environment.
// Expo CLI loads .env and .env.local first. Keep keys in .env.local (gitignored).
//
// GOOGLE_MAPS_ANDROID_API_KEY: a Google Cloud key with "Maps SDK for Android" enabled, restricted
// to this app's package and signing certificate (SHA-1). Native builds need it; Expo Go brings its own.
// Changing it needs a new native build (npx expo prebuild --clean, then expo run:android).
const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
const iosMapsKey = process.env.GOOGLE_MAPS_IOS_API_KEY;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  plugins: [
    ...(config.plugins ?? []),
    [
      "react-native-maps",
      {
        ...(androidMapsKey && { androidGoogleMapsApiKey: androidMapsKey }),
        ...(iosMapsKey && { iosGoogleMapsApiKey: iosMapsKey }),
      },
    ],
  ],
  extra: {
    ...config.extra,
    // Read by the map: without a key, Google Maps crashes the Android build instead of rendering.
    hasAndroidMapsKey: !!androidMapsKey,
  },
});
