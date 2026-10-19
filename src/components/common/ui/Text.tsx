import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from "react-native";

export type TextVariant = "h1" | "h2" | "h3" | "body" | "caption" | "small";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
}

const variantStyles: Record<TextVariant, string> = {
  h1: "text-2xl font-kumbh-extrabold text-[#323232]",
  h2: "text-xl font-kumbh-bold text-[#323232]",
  h3: "text-lg font-kumbh-semibold text-[#323232]",
  body: "text-base font-kumbh text-[#323232]",
  caption: "text-sm font-kumbh text-[#6B7280]", // Usually slightly muted
  small: "text-xs font-kumbh text-[#6B7280]",
};

export const Text = ({
  variant = "body",
  className = "",
  style,
  ...props
}: TextProps) => {
  const baseClassName = variantStyles[variant];

  return (
    <RNText
      className={`${baseClassName} ${className}`.trim()}
      style={style}
      {...props}
    />
  );
};
