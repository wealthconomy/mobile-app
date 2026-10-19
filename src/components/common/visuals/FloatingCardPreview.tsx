import React from "react";
import { View, Image, StyleProp, ViewStyle, ImageStyle } from "react-native";

export interface FloatingCardPreviewProps {
  imageUri: string;
  fallbackUri?: string;
  containerStyle?: StyleProp<ViewStyle>;
  trayStyle?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

const DEFAULT_FALLBACK_URI =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80";

export const FloatingCardPreview: React.FC<FloatingCardPreviewProps> = ({
  imageUri,
  fallbackUri = DEFAULT_FALLBACK_URI,
  containerStyle,
  trayStyle,
  cardStyle,
  imageStyle,
}) => {
  return (
    <View
      style={[
        {
          height: 260,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 36,
          marginTop: 10,
        },
        containerStyle,
      ]}
    >
      {/* Vertical Floating Back Tray (216x252) */}
      <View
        style={[
          {
            width: 216,
            height: 252,
            backgroundColor: "#F8FAFC",
            borderRadius: 44,
            borderWidth: 1.5,
            borderColor: "#E2E8F0",
            position: "absolute",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.05,
            shadowRadius: 14,
            elevation: 3,
          },
          trayStyle,
        ]}
      />

      {/* Horizontal Floating ID Photo (316x194) */}
      <View
        style={[
          {
            width: 316,
            height: 194,
            borderRadius: 18,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.18,
            shadowRadius: 22,
            elevation: 10,
            backgroundColor: "#FFFFFF",
            zIndex: 10,
          },
          cardStyle,
        ]}
      >
        <Image
          source={{ uri: imageUri || fallbackUri }}
          style={[{ width: "100%", height: "100%" }, imageStyle]}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};
