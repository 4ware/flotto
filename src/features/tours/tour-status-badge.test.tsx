import { describe, expect, test } from "bun:test";

import { render, screen } from "@/test/render";

import { TourStatusBadge } from "./tour-status-badge";

describe("TourStatusBadge", () => {
  test.each([
    ["pending", "Ausstehend", "bg-brand"],
    ["started", "Gestartet", "bg-warning"],
    ["complete", "Abgeschlossen", "bg-subtle-foreground"],
  ] as const)("%s shows %s with its dot", async (status, label, dot) => {
    await render(<TourStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeOnTheScreen();
    expect(screen.container.queryAll((node) => String(node.props.className ?? "").includes(dot))).toHaveLength(1);
  });
});
