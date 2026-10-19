import React from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  bgVariant?: "gray" | "white";
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
}

export type KycFormInputProps = InputProps;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  bgVariant = "gray",
  containerStyle,
  inputContainerStyle,
  rightElement,
  style,
  ...props
}) => {
  const isWhite = bgVariant === "white";

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
      <View
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
          error ? { borderWidth: 1, borderColor: "#EF4444" } : null,
          inputContainerStyle,
        ]}
      >
        <TextInput
          placeholderTextColor="#94A3B8"
          style={[
            {
              fontSize: 15,
              color: "#1A1A1A",
              fontWeight: "500",
              flex: rightElement ? 1 : undefined,
            },
            style,
          ]}
          {...props}
        />
        {rightElement}
      </View>
      {error ? (
        <Text
          style={{
            fontSize: 12,
            color: "#EF4444",
            marginTop: 4,
            fontWeight: "500",
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export const KycFormInput = Input;
