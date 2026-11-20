import { ActivityIndicator, ScrollView, View } from "react-native";
import { Bell, CalendarDays, ChevronRight, LogOut, type LucideIcon } from "lucide-react-native";

import { BrandMark } from "@/components/brand-mark";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { usePalette } from "@/hooks/use-palette";
import { useCurrentUser, useLogout } from "@/lib/api/auth";
import { messages } from "@/lib/messages";

function Row({
  icon,
  label,
  onPress,
  busy,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  busy?: boolean;
}) {
  const colors = usePalette();
  return (
    <Button
      variant="ghost"
      onPress={onPress}
      disabled={busy}
      className="h-auto justify-start gap-3 rounded-none px-0 py-3.5"
    >
      <Icon as={icon} size={18} className="text-muted-foreground" />
      <Text className="flex-1 font-sans-medium text-foreground">{label}</Text>
      {busy ? (
        <ActivityIndicator size="small" color={colors["subtle-foreground"]} />
      ) : (
        <Icon as={ChevronRight} size={16} className="text-subtle-foreground" />
      )}
    </Button>
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
        <Card className="gap-0 px-4 py-0">
          <Row icon={CalendarDays} label="Meine Schichten" />
          <Separator />
          <Row icon={Bell} label="Benachrichtigungen" />
          <Separator />
          <Row icon={LogOut} label={messages.Common.logout} onPress={() => logout.mutate()} busy={logout.isPending} />
        </Card>
        <View className="items-center gap-2">
          <BrandMark />
          <Text className="font-sans text-xs text-subtle-foreground">Fahrer-App · Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}
