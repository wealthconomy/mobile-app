import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface SelectTriggerProps extends TouchableOpacityProps {
  label: string;
  value: string;
  placeholder?: string;
  bgVariant?: "gray" | "white";
  containerStyle?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
}

export type KycSelectTriggerProps = SelectTriggerProps;

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  label,
  value,
  placeholder = "Select...",
  bgVariant = "gray",
  containerStyle,
  rightElement,
  style,
  ...props
}) => {
  const isWhite = bgVariant === "white";
  const hasValue = Boolean(value);

  return (
    <View style={containerStyle}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: "#4B5563",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          {
            height: 52,
            backgroundColor: isWhite ? "#FFFFFF" : "#F6F8FA",
            borderRadius: 14,
            paddingHorizontal: 16,
            justifyContent: "center",
            flexDirection: rightElement ? "row" : "column",
            alignItems: rightElement ? "center" : "stretch",
          },
          isWhite && {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.02,
            shadowRadius: 3,
            elevation: 1,
          },
          style,
        ]}
        {...props}
      >
        <Text
          style={{
            fontSize: 15,
            color: hasValue ? "#1A1A1A" : "#94A3B8",
            fontWeight: "500",
            flex: rightElement ? 1 : undefined,
          }}
        >
          {hasValue ? value : placeholder}
        </Text>
        {rightElement}
      </TouchableOpacity>
    </View>
  );
};

export const KycSelectTrigger = SelectTrigger;
