import { Text } from "react-native";

export function Eyebrow({ children, className = "" }: { children: string; className?: string }) {
  return (
    <Text className={`font-sans-semibold text-[11px] uppercase tracking-widest text-subtle-foreground ${className}`}>
      {children}
    </Text>
  );
}
