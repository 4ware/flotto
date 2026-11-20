import { describe, expect, test } from "bun:test";
import { Truck } from "lucide-react-native";

import { iconNames, render, screen } from "@/test/render";

import { Icon } from "./icon";
import { TextClassContext } from "./text";

const icon = () => screen.container.queryAll((node) => node.type === "Icon")[0];

describe("Icon", () => {
  test("renders the given lucide icon with size and className", async () => {
    await render(<Icon as={Truck} size={20} className="text-primary" />);
    expect(iconNames(screen.container)).toEqual(["Truck"]);
    expect(icon().props.size).toBe(20);
    expect(icon().props.className).toContain("text-primary");
  });

  test("defaults to the text color around it", async () => {
    await render(
      <TextClassContext.Provider value="text-primary-foreground">
        <Icon as={Truck} />
      </TextClassContext.Provider>,
    );
    expect(icon().props.className).toContain("text-primary-foreground");
    expect(icon().props.size).toBe(14);
  });
});
