import { describe, expect, mock, test } from "bun:test";
import { Platform } from "react-native";

import { render, screen, userEvent } from "@/test/render";

import { NativeOnlyAnimatedView } from "./native-only-animated-view";
import { Text } from "./text";

describe("NativeOnlyAnimatedView", () => {
  test("wraps its children in an animated view on native", async () => {
    await render(
      <NativeOnlyAnimatedView testID="animated">
        <Text>Inhalt</Text>
      </NativeOnlyAnimatedView>,
    );
    expect(screen.getByTestId("animated")).toContainElement(screen.getByText("Inhalt"));
  });

  test("can be a pressable", async () => {
    const onPress = mock(() => {});
    await render(
      <NativeOnlyAnimatedView as="Pressable" onPress={onPress} accessibilityLabel="Overlay">
        <Text>Inhalt</Text>
      </NativeOnlyAnimatedView>,
    );
    await userEvent.setup().press(screen.getByLabelText("Overlay"));
    expect(onPress).toHaveBeenCalled();
  });

  test("renders just the children on web", async () => {
    Platform.OS = "web";
    await render(
      <NativeOnlyAnimatedView testID="animated">
        <Text>Inhalt</Text>
      </NativeOnlyAnimatedView>,
    );
    expect(screen.getByText("Inhalt")).toBeOnTheScreen();
    expect(screen.queryByTestId("animated")).not.toBeOnTheScreen();
  });
});
