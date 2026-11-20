import { useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, Text, View, type TextInputInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { BrandMark } from "@/components/brand-mark";
import { ModeToggle } from "@/components/mode-toggle";
import { TextField } from "@/components/ui/text-field";
import { usePalette } from "@/hooks/use-palette";
import { useLogin } from "@/lib/api/auth";
import { API_URL } from "@/lib/api/client";
import { messages } from "@/lib/messages";

const t = messages.Auth.login;

// Same rule as the API's schema for /api/login.
const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

type FieldErrors = { email?: string; password?: string };

function validate(email: string, password: string): FieldErrors {
  return {
    email: EMAIL_PATTERN.test(email) ? undefined : messages.Validation.emailInvalid,
    password: password ? undefined : messages.Validation.passwordRequired,
  };
}

export default function LoginScreen() {
  const colors = usePalette();
  const insets = useSafeAreaInsets();
  const login = useLogin();
  const passwordRef = useRef<TextInputInstance>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const submit = () => {
    const errors = validate(email.trim(), password);
    setFieldErrors(errors);
    if (errors.email || errors.password) return;
    // On success the session query fills and the root layout's guard switches to the app.
    login.mutate({ email: email.trim(), password });
  };

  return (
    // "padding" on Android too: with edge-to-edge the window no longer resizes for the keyboard.
    <KeyboardAvoidingView className="flex-1 bg-muted" behavior="padding">
      <View className="absolute right-4 z-10" style={{ top: insets.top + 12 }}>
        <ModeToggle variant="surface" />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="grow items-center justify-center gap-6 px-4"
        contentContainerStyle={{ paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }}
      >
        <BrandMark />

        <View className="w-full max-w-md gap-6 rounded-2xl border border-border bg-card py-6">
          <View className="gap-1 px-6">
            <Text accessibilityRole="header" className="font-heading text-2xl tracking-tight text-card-foreground">
              {t.title}
            </Text>
            <Text className="font-sans text-sm text-muted-foreground">{t.description}</Text>
          </View>

          <View className="gap-4 px-6">
            {login.error && (
              <View accessibilityRole="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                <Text className="font-sans text-sm text-destructive">{login.error.message}</Text>
              </View>
            )}

            <TextField
              label={messages.Common.email}
              placeholder={messages.Common.emailPlaceholder}
              value={email}
              onChangeText={setEmail}
              error={fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <View className="gap-2">
              <TextField
                ref={passwordRef}
                label={messages.Common.password}
                value={password}
                onChangeText={setPassword}
                error={fieldErrors.password}
                password
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
              />
              <Pressable
                onPress={() => WebBrowser.openBrowserAsync(`${API_URL}/forgot-password`)}
                accessibilityRole="link"
                className="self-end py-1"
              >
                <Text className="font-sans-medium text-sm text-primary">{t.forgotPassword}</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={submit}
              disabled={login.isPending}
              accessibilityRole="button"
              accessibilityState={{ busy: login.isPending, disabled: login.isPending }}
              className="h-11 flex-row items-center justify-center gap-2 rounded-lg bg-primary active:opacity-80 disabled:opacity-50"
            >
              {login.isPending && <ActivityIndicator size="small" color={colors["primary-foreground"]} />}
              <Text className="font-sans-semibold text-sm text-primary-foreground">{t.submit}</Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap justify-center gap-1 border-t border-border px-6 pt-5">
            <Text className="font-sans text-sm text-muted-foreground">{t.footerText}</Text>
            <Pressable onPress={() => WebBrowser.openBrowserAsync(`${API_URL}/signup`)} accessibilityRole="link">
              <Text className="font-sans-medium text-sm text-primary">{t.footerLink}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
