import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Text, TextInput, TextInputProps, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AUTH_COLORS } from "./authConstants";

interface AuthFieldProps<T extends FieldValues> extends Omit<TextInputProps, "value" | "onChangeText"> {
  control: Control<T, any>;
  name: Path<T>;
  label?: string;
  leftIcon?: (hasError: boolean) => React.ReactNode;
  animationDelay?: number;
  onValueChange?: (value: string) => void;
  paddingHorizontal?: number;
}

export function AuthField<T extends FieldValues>({
  control,
  name,
  label,
  leftIcon,
  animationDelay = 250,
  onValueChange,
  paddingHorizontal = 14,
  ...textInputProps
}: AuthFieldProps<T>) {
  return (
    <Animated.View entering={FadeInDown.duration(600).delay(animationDelay)} style={{ marginBottom: 14 }}>
      {label && (
        <Text
          style={{
            color: AUTH_COLORS.DARK,
            fontWeight: "500",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          const hasError = Boolean(error?.message);
          return (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: hasError ? AUTH_COLORS.ERROR : AUTH_COLORS.BORDER,
                  borderRadius: 12,
                  paddingHorizontal,
                  paddingVertical: 14,
                  backgroundColor: AUTH_COLORS.MUTED,
                  gap: 10,
                }}
              >
                {leftIcon && leftIcon(hasError)}
                <TextInput
                  placeholderTextColor="#9CA3AF"
                  style={{ flex: 1, fontSize: 15, color: AUTH_COLORS.DARK }}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(v) => {
                    onChange(v);
                    onValueChange?.(v);
                  }}
                  {...textInputProps}
                />
              </View>
              {hasError && (
                <Text style={{ color: AUTH_COLORS.ERROR, fontSize: 12, marginTop: 4 }}>
                  {error?.message}
                </Text>
              )}
            </>
          );
        }}
      />
    </Animated.View>
  );
}
