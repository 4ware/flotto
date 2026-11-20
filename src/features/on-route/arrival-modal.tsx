import { View } from "react-native";
import { Flag } from "lucide-react-native";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

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
  return (
    // Closing any other way (back button, tapping outside) counts as "not yet".
    <AlertDialog open={visible} onOpenChange={(open) => !open && !pending && onDismiss()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="items-center">
          <View className="size-12 items-center justify-center rounded-full bg-secondary">
            <Icon as={Flag} size={22} className="text-primary" />
          </View>
          <AlertDialogTitle className="text-center">Ziel erreicht?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">{destinationLabel}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <Text className="text-center text-sm text-destructive">{error}</Text>}
        <AlertDialogFooter>
          {/* The primitives close the dialog themselves; the screen decides with `visible`. */}
          <AlertDialogCancel onPress={onDismiss} disabled={pending}>
            <Text>Noch nicht</Text>
          </AlertDialogCancel>
          <AlertDialogAction onPress={onConfirm} disabled={pending}>
            <Text>{pending ? "Wird abgeschlossen …" : "Ja, Tour abschließen"}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
