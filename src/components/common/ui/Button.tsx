import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Text } from "./Text";
import { THEME_TEAL } from "./SectionHeader";

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "outline" | "danger";
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export type KycButtonProps = ButtonProps;

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  loading = false,
  disabled,
  style,
  textStyle,
  ...props
}) => {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[
        {
          height: 56,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isPrimary
            ? THEME_TEAL
            : isDanger
            ? "#EF4444"
            : "transparent",
          borderWidth: isOutline ? 1.5 : 0,
          borderColor: isOutline ? THEME_TEAL : "transparent",
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? THEME_TEAL : "white"} />
      ) : (
        <Text
          variant="body"
          className="font-kumbh-semibold"
          style={[
            {
              color: isOutline ? THEME_TEAL : "white",
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const KycButton = Button;
