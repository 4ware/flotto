import { Moon, Sun } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
  COLOR_SCHEMES,
  setColorSchemePreference,
  useColorSchemePreference,
  useResolvedColorScheme,
  type ColorSchemePreference,
} from "@/theme/color-scheme";

const LABELS: Record<ColorSchemePreference, string> = { light: "Hell", dark: "Dunkel", system: "System" };

const TRIGGER = {
  // On the green screen header.
  header: "border-primary-foreground/20 bg-primary-foreground/10 active:bg-primary-foreground/20",
  // On regular surfaces, like the web app's outline icon button.
  surface: "",
} as const;

const isPreference = (value: string | undefined): value is ColorSchemePreference =>
  COLOR_SCHEMES.includes(value as ColorSchemePreference);

/** Color-scheme dropdown, mirroring the web app's ModeToggle (Hell / Dunkel / System). */
export function ModeToggle({ variant = "header" }: { variant?: keyof typeof TRIGGER }) {
  const isDark = useResolvedColorScheme() === "dark";
  const preference = useColorSchemePreference();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" accessibilityLabel="Farbschema wählen" className={cn("size-9", TRIGGER[variant])}>
          <Icon
            as={isDark ? Moon : Sun}
            size={16}
            className={variant === "header" ? "text-primary-foreground" : "text-foreground"}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => isPreference(value) && setColorSchemePreference(value)}
        >
          {COLOR_SCHEMES.map((value) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Text>{LABELS[value]}</Text>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
