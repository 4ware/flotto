import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/** Small uppercase section label. */
export function Eyebrow({ children, className }: { children: string; className?: string }) {
  return (
    <Text className={cn("font-sans-semibold text-[11px] uppercase tracking-widest text-subtle-foreground", className)}>
      {children}
    </Text>
  );
}
