import { describe, expect, test } from "bun:test";

import { iconNames, render, screen } from "@/test/render";

import { Logo } from "./logo";

const logo = () => screen.getByRole("image", { name: "flot.to" });
const mark = () => logo().children[0] as unknown as { props: { className: string } };
const icon = () => logo().queryAll((node) => node.type === "Icon")[0];

describe("Logo", () => {
  test("is one image named flot.to, with the route mark and the wordmark", async () => {
    await render(<Logo />);
    expect(logo()).toBeOnTheScreen();
    expect(iconNames(logo())).toEqual(["Route"]);
    expect(logo()).toHaveTextContent("flot.to");
  });

  test("the dot is orange", async () => {
    await render(<Logo />);
    const dot = logo().queryAll((node) => node.type === "Text" && node.children.includes("."))[0];
    expect(dot.props.className).toContain("text-warning");
  });

  test("is green on light surfaces and light on the green header", async () => {
    await render(<Logo />);
    expect(mark().props.className).toContain("bg-primary");
    expect(icon().props.className).toContain("text-primary-foreground");

    await render(<Logo tone="inverse" />);
    expect(mark().props.className).toContain("bg-primary-foreground");
    expect(icon().props.className).toContain("text-primary");
    expect(icon().props.className).not.toContain("text-primary-foreground");
  });

  test.each([
    ["sm", "size-7", 14, "text-base"],
    ["md", "size-9", 18, "text-[21px]"],
    ["lg", "size-12", 24, "text-[28px]"],
  ] as const)("size %s", async (size, markSize, iconSize, textSize) => {
    await render(<Logo size={size} />);
    expect(mark().props.className).toContain(markSize);
    expect(icon().props.size).toBe(iconSize);
    expect(screen.getByText("to", { exact: false }).props.className).toContain(textSize);
  });

  test("can show only the mark", async () => {
    await render(<Logo markOnly />);
    expect(logo()).toBeOnTheScreen();
    expect(logo()).not.toHaveTextContent("flot.to");
  });
});
