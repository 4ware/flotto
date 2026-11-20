import { View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import type { TourStatus } from "@/lib/api/tours";
import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";

const dot: Record<TourStatus, string> = { pending: "bg-brand", started: "bg-warning", complete: "bg-subtle-foreground" };

/** A tour's status as a badge with a colored dot (Ausstehend / Gestartet / Abgeschlossen). */
export function TourStatusBadge({ status }: { status: TourStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5 self-start bg-muted px-2.5 py-1">
      <View className={cn("size-1.5 rounded-full", dot[status])} />
      <Text className="font-sans-semibold text-[11px] text-primary">{messages.Tours.statuses[status]}</Text>
    </Badge>
  );
}
