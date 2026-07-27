import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Animated, { FadeIn, BounceIn } from "react-native-reanimated";
import { FaceFramingBrackets } from "@/src/components/common";

interface Step6FaceCompletedProps {
  photoUri?: string;
  onContinue: () => void;
  isLoading?: boolean;
  error?: string;
}

const THEME_TEAL = "#155D5F";

export const Step6FaceCompleted: React.FC<Step6FaceCompletedProps> = ({
  photoUri,
  onContinue,
  isLoading = false,
  error,
}) => {
  useEffect(() => {
    if (isLoading || error) return;
    const timer = setTimeout(() => {
      onContinue();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onContinue, isLoading, error]);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onContinue}
      style={{ flex: 1, backgroundColor: "#0F172A", position: "relative" }}
    >
      {/* Background: Captured Selfie or Portrait Photo */}
      <Image
        source={{
          uri:
            photoUri ||
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
        }}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        resizeMode="cover"
      />

      {/* Top Gradient Overlay matching Image 1 */}
      <LinearGradient
        colors={["rgba(15, 30, 35, 0.85)", "rgba(15, 30, 35, 0.45)", "transparent"]}
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 48,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: "white",
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          Face Recognition
        </Text>
        <Text
          style={{
            fontSize: 14.5,
            color: "#E2E8F0",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          Please look into the camera and hold still
        </Text>
      </LinearGradient>

      {/* Center Face Framing Corner Brackets + Concentric Success Checkmark Badge */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", zIndex: 10 }}>
        <View style={{ width: 260, height: 300, position: "relative", alignItems: "center", justifyContent: "center" }}>
          <FaceFramingBrackets width={260} height={300} />

          {/* 3-Layer Concentric Checkmark Badge exactly matching Image 1 */}
          <Animated.View
            entering={BounceIn.duration(700)}
            style={{
              width: 146,
              height: 146,
              borderRadius: 73,
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Middle Bright Translucent Ring */}
            <View
              style={{
                width: 116,
                height: 116,
                borderRadius: 58,
                backgroundColor: "rgba(44, 192, 197, 0.55)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Inner Core Bullseye (#155D5F) */}
              <View
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 43,
                  backgroundColor: THEME_TEAL,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#2CC0C5",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                {/* Exact Custom Checkmark SVG matching Image 1 */}
                <Svg width="36" height="28" viewBox="0 0 24 18" fill="none">
                  <Path
                    d="M2.5 9.5 L8.5 15.5 L21.5 2.5"
                    stroke="white"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Bottom Gradient Overlay & Completed Status matching Image 1 */}
      <LinearGradient
        colors={["transparent", "rgba(15, 30, 35, 0.65)", "rgba(15, 30, 35, 0.92)"]}
        style={{
          paddingTop: 48,
          paddingHorizontal: 24,
          paddingBottom: 44,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Animated.Text
          entering={FadeIn.duration(600).delay(150)}
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: "500",
            textAlign: "center",
            lineHeight: 30,
            marginBottom: 40,
          }}
        >
          Nice!,{"\n"}face recognition completed
        </Animated.Text>

        <Text
          style={{
            color: error ? "#EF4444" : "white",
            fontSize: 16.5,
            fontWeight: "500",
            marginBottom: 14,
          }}
        >
          {error ? error : isLoading ? "Verifying with server..." : "100% Recognition"}
        </Text>

        {/* 100% Progress Bar Track with Intense Neon Glow matching Image 1 */}
        <View style={{ width: "100%", position: "relative" }}>
          <View
            style={{
              width: "100%",
              height: 10,
              backgroundColor: "#2CC0C5",
              borderRadius: 5,
            }}
          />
          {/* Downward Neon Cyan Glow Aura */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 10,
              borderRadius: 5,
              backgroundColor: "#2CC0C5",
              shadowColor: "#2CC0C5",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 20,
              elevation: 15,
              zIndex: -1,
            }}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
