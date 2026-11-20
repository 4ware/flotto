import type { ComponentType } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Bell, CalendarDays, ChevronRight, LogOut, type LucideProps } from "lucide-react-native";

import { BrandMark } from "@/components/brand-mark";
import { ScreenHeader } from "@/components/screen-header";
import { Card } from "@/components/ui/card";
import { usePalette } from "@/hooks/use-palette";
import { useCurrentUser, useLogout } from "@/lib/api/auth";
import { messages } from "@/lib/messages";

function Row({
  icon: Icon,
  label,
  onPress,
  busy,
  last,
}: {
  icon: ComponentType<LucideProps>;
  label: string;
  onPress?: () => void;
  busy?: boolean;
  last?: boolean;
}) {
  const colors = usePalette();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      className={`flex-row items-center gap-3 py-3.5 active:opacity-70 ${last ? "" : "border-b border-border"}`}
    >
      <Icon size={18} color={colors["muted-foreground"]} />
      <Text className="flex-1 font-sans-medium text-sm text-foreground">{label}</Text>
      {busy ? (
        <ActivityIndicator size="small" color={colors["subtle-foreground"]} />
      ) : (
        <ChevronRight size={16} color={colors["subtle-foreground"]} />
      )}
    </Pressable>
  );
}

export function ProfileScreen() {
  const user = useCurrentUser();
  const logout = useLogout();
  const org = user.organization;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-10">
      <ScreenHeader overline={org?.name ?? user.email} title={user.name}>
        <View className="mt-4 flex-row items-center gap-3">
          <View className="size-14 items-center justify-center rounded-xl bg-primary-foreground">
            <Text className="font-sans-bold text-base text-primary">{user.initials}</Text>
          </View>
          <View className="gap-0.5">
            {org && (
              <Text className="font-sans-semibold text-sm text-primary-foreground">{messages.Roles[org.role]}</Text>
            )}
            <Text className="font-sans text-xs text-primary-foreground/75">{user.email}</Text>
          </View>
        </View>
      </ScreenHeader>

      <View className="gap-6 px-4 pt-4">
        <Card className="py-0">
          <Row icon={CalendarDays} label="Meine Schichten" />
          <Row icon={Bell} label="Benachrichtigungen" />
          <Row
            icon={LogOut}
            label={messages.Common.logout}
            onPress={() => logout.mutate()}
            busy={logout.isPending}
            last
          />
        </Card>
        <View className="items-center gap-2">
          <BrandMark />
          <Text className="font-sans text-xs text-subtle-foreground">Fahrer-App · Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}
