import { Eye, EyeOff, Lock } from "lucide-react-native";
import React, { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AUTH_COLORS } from "./authConstants";

interface AuthPasswordFieldProps<T extends FieldValues> extends Omit<TextInputProps, "value" | "onChangeText"> {
  control: Control<T, any>;
  name: Path<T>;
  label?: string;
  animationDelay?: number;
  onValueChange?: (value: string) => void;
  paddingHorizontal?: number;
  showLockIcon?: boolean;
}

export function AuthPasswordField<T extends FieldValues>({
  control,
  name,
  label = "Password",
  animationDelay = 350,
  onValueChange,
  paddingHorizontal = 14,
  showLockIcon = true,
  ...textInputProps
}: AuthPasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

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
                {showLockIcon && <Lock size={18} color={hasError ? AUTH_COLORS.ERROR : "#9CA3AF"} />}
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  style={{ flex: 1, fontSize: 15, color: AUTH_COLORS.DARK }}
                  secureTextEntry={!showPassword}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(v) => {
                    onChange(v);
                    onValueChange?.(v);
                  }}
                  {...textInputProps}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
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
