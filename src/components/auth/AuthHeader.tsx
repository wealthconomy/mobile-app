import React from "react";
import { Image, ImageSourcePropType, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { AUTH_COLORS } from "./authConstants";

interface AuthHeaderProps {
  imageSource: ImageSourcePropType;
  title: string;
  subtitle?: React.ReactNode;
  titleColor?: string;
  marginTop?: number;
  marginBottom?: number;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  imageSource,
  title,
  subtitle,
  titleColor = AUTH_COLORS.DARK,
  marginTop = 32,
  marginBottom = 28,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(600).delay(100)}
      style={{ alignItems: "center", marginTop, marginBottom }}
    >
      <Image
        source={imageSource}
        style={{ width: 69, height: 73 }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: titleColor,
          marginTop: 16,
          marginBottom: subtitle ? 6 : 0,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        typeof subtitle === "string" ? (
          <Text
            style={{
              color: AUTH_COLORS.SECONDARY,
              fontSize: 13,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {subtitle}
          </Text>
        ) : (
          subtitle
        )
      )}
    </Animated.View>
  );
};
