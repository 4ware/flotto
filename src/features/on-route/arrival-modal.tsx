import { Modal, Text, View } from "react-native";
import { Flag } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { usePalette } from "@/hooks/use-palette";

type Props = {
  visible: boolean;
  destinationLabel: string;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
  onDismiss: () => void;
};

/** Asks whether the destination was reached; shown when the vehicle enters the geofence. */
export function ArrivalModal({ visible, destinationLabel, pending, error, onConfirm, onDismiss }: Props) {
  const colors = usePalette();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-sm gap-4 rounded-2xl bg-card p-6">
          <View className="size-12 items-center justify-center self-center rounded-full bg-secondary">
            <Flag size={22} color={colors.primary} />
          </View>
          <View className="gap-1">
            <Text className="text-center font-heading text-lg text-foreground">Ziel erreicht?</Text>
            <Text className="text-center font-sans text-sm text-muted-foreground">{destinationLabel}</Text>
          </View>
          {error && <Text className="text-center font-sans text-sm text-destructive">{error}</Text>}
          <View className="gap-2">
            <Button label={pending ? "Wird abgeschlossen …" : "Ja, Tour abschließen"} onPress={pending ? undefined : onConfirm} />
            <Button label="Noch nicht" variant="outline" onPress={pending ? undefined : onDismiss} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
