import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AUTH_COLORS } from "./authConstants";

interface AuthErrorBannerProps {
  error: string;
}

export const AuthErrorBanner: React.FC<AuthErrorBannerProps> = ({ error }) => {
  if (!error) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={{
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: AUTH_COLORS.ERROR, fontSize: 13 }}>{error}</Text>
    </Animated.View>
  );
};
