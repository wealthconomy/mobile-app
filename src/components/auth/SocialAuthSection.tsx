import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AUTH_COLORS } from "./authConstants";

interface SocialAuthSectionProps {
  promptText: string;
  linkText: string;
  linkHref: any;
  animationDelay?: number;
}

export const SocialAuthSection: React.FC<SocialAuthSectionProps> = ({
  promptText,
  linkText,
  linkHref,
  animationDelay = 600,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(animationDelay)}
      style={{
        alignItems: "center",
        marginTop: 12,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Text
          style={{
            color: AUTH_COLORS.SECONDARY,
            fontSize: 14,
          }}
        >
          {promptText}
        </Text>

        <Link href={linkHref} asChild>
          <TouchableOpacity activeOpacity={0.7} style={{ paddingVertical: 4 }}>
            <Text
              style={{
                color: AUTH_COLORS.PRIMARY,
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              {linkText}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </Animated.View>
  );
};

