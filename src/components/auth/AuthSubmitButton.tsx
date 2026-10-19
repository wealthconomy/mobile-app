import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AUTH_COLORS } from "./authConstants";

interface AuthSubmitButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel?: string;
  animationDelay?: number;
  marginBottom?: number;
  marginTop?: number;
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  label,
  loadingLabel = "Please wait...",
  animationDelay = 500,
  marginBottom = 20,
  marginTop = 0,
}) => {
  const isButtonDisabled = disabled || isLoading;

  return (
    <Animated.View entering={FadeInDown.duration(600).delay(animationDelay)}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isButtonDisabled}
        style={{
          backgroundColor: AUTH_COLORS.PRIMARY,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: "center",
          marginBottom,
          marginTop,
          opacity: isButtonDisabled ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          {isLoading ? loadingLabel : label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
