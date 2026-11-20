import { useState, type Ref } from "react";
import { Pressable, Text, TextInput, View, type TextInputInstance, type TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { usePalette } from "@/hooks/use-palette";
import { messages } from "@/lib/messages";

type Props = Omit<TextInputProps, "secureTextEntry"> & {
  label: string;
  error?: string;
  /** Password field with a show/hide toggle, like the web app's input group. */
  password?: boolean;
  ref?: Ref<TextInputInstance>;
};

export function TextField({ label, error, password, ref, ...input }: Props) {
  const colors = usePalette();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const border = error ? "border-destructive" : focused ? "border-ring" : "border-input";

  return (
    <View className="gap-2">
      <Text className={`font-sans-medium text-sm ${error ? "text-destructive" : "text-foreground"}`}>{label}</Text>
      <View className={`h-11 flex-row items-center rounded-lg border bg-transparent dark:bg-input/30 ${border}`}>
        <TextInput
          {...input}
          ref={ref}
          accessibilityLabel={label}
          secureTextEntry={password && !visible}
          placeholderTextColor={colors["muted-foreground"]}
          cursorColor={colors.primary}
          selectionColor={colors.ring}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          className="h-full flex-1 px-3 font-sans text-base text-foreground"
        />
        {password && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? messages.Auth.hidePassword : messages.Auth.showPassword}
            className="h-full items-center justify-center px-3"
          >
            {visible ? (
              <EyeOff size={18} color={colors["muted-foreground"]} />
            ) : (
              <Eye size={18} color={colors["muted-foreground"]} />
            )}
          </Pressable>
        )}
      </View>
      {error && <Text className="font-sans text-sm text-destructive">{error}</Text>}
    </View>
  );
}
