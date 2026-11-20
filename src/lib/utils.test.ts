import { describe, expect, test } from "bun:test";

import { cn } from "./utils";

describe("cn", () => {
  test("joins conditional classes", () => {
    expect(cn("p-2", false && "hidden", undefined, ["text-sm"], { "opacity-50": true })).toBe("p-2 text-sm opacity-50");
  });

  test("later classes win over conflicting ones", () => {
    expect(cn("bg-primary px-4", "bg-card")).toBe("px-4 bg-card");
    expect(cn("text-sm text-foreground", "text-primary-foreground")).toBe("text-sm text-primary-foreground");
  });

  test("knows our per-weight font families", () => {
    expect(cn("font-sans", "font-sans-semibold")).toBe("font-sans-semibold");
    expect(cn("font-sans-medium", "font-heading")).toBe("font-heading");
  });

  test("keeps size and color apart", () => {
    expect(cn("text-sm", "text-subtle-foreground")).toBe("text-sm text-subtle-foreground");
  });
});
