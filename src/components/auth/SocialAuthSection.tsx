import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SvgXml } from "react-native-svg";
import { APPLE_SVG, AUTH_COLORS, GOOGLE_SVG } from "./authConstants";

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
    <Animated.View entering={FadeInDown.duration(600).delay(animationDelay)}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: AUTH_COLORS.BORDER }} />
        <Text
          style={{
            color: AUTH_COLORS.SECONDARY,
            paddingHorizontal: 12,
            fontSize: 13,
          }}
        >
          {promptText}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: AUTH_COLORS.BORDER }} />
      </View>

      <Link href={linkHref} asChild>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: AUTH_COLORS.BORDER,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: AUTH_COLORS.PRIMARY,
              fontWeight: "600",
              fontSize: 15,
            }}
          >
            {linkText}
          </Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: AUTH_COLORS.BORDER,
          borderRadius: 12,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <SvgXml xml={APPLE_SVG} width={16} height={18} />
        <Text style={{ color: AUTH_COLORS.DARK, fontWeight: "500", fontSize: 15 }}>
          Sign In with Apple
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: AUTH_COLORS.BORDER,
          borderRadius: 12,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <SvgXml xml={GOOGLE_SVG} width={18} height={18} />
        <Text style={{ color: AUTH_COLORS.DARK, fontWeight: "500", fontSize: 15 }}>
          Sign In with Google
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
