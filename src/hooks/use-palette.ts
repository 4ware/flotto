import { useResolvedColorScheme } from "@/theme/color-scheme";
import { palette } from "@/theme/palette";

/** Raw theme colors for props that can't take a className (icons, navigation). */
export function usePalette() {
  return palette[useResolvedColorScheme()];
}
