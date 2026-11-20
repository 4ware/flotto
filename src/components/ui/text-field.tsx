import { useState, type Ref } from "react";
import { View, type TextInputInstance, type TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";

type Props = Omit<TextInputProps, "secureTextEntry"> & {
  label: string;
  error?: string;
  /** Password field with a show/hide toggle, like the web app's input group. */
  password?: boolean;
  ref?: Ref<TextInputInstance>;
};

/** Labelled input with an error message, built from React Native Reusables' Label and Input. */
export function TextField({ label, error, password, ref, className, ...input }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-2">
      <Label className={cn(error && "text-destructive")}>{label}</Label>
      <View className="flex-row items-center">
        <Input
          {...input}
          ref={ref}
          accessibilityLabel={label}
          aria-invalid={!!error}
          secureTextEntry={password && !visible}
          className={cn("h-11 font-sans", password && "pr-11", error && "border-destructive", className)}
        />
        {password && (
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            accessibilityLabel={visible ? messages.Auth.hidePassword : messages.Auth.showPassword}
            className="absolute right-0.5"
          >
            <Icon as={visible ? EyeOff : Eye} size={18} className="text-muted-foreground" />
          </Button>
        )}
      </View>
      {error && <Text className="text-sm text-destructive">{error}</Text>}
    </View>
  );
}
