import React, { useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, BounceIn } from "react-native-reanimated";
import { FaceFramingBrackets } from "@/src/components/common";

interface Step6FaceCompletedProps {
  photoUri?: string;
  onContinue: () => void;
  onRetake?: () => void;
  isLoading?: boolean;
  error?: string;
}

const THEME_TEAL = "#155D5F";

export const Step6FaceCompleted: React.FC<Step6FaceCompletedProps> = ({
  photoUri,
  onContinue,
  onRetake,
  isLoading = false,
  error,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-continue after 3.5s only if there is no error and not already loading
  useEffect(() => {
    if (isLoading || error) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      onContinue();
    }, 3500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onContinue, isLoading, error]);

  const handleRetakePress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (onRetake) onRetake();
  };

  const handleConfirmPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onContinue();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", position: "relative" }}>
      {/* Background: Captured Selfie */}
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: "100%", height: "100%", position: "absolute", backgroundColor: "#0F172A" }} />
      )}

      {/* Top Gradient Overlay */}
      <LinearGradient
        colors={["rgba(15, 30, 35, 0.90)", "rgba(15, 30, 35, 0.50)", "transparent"]}
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 40,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Text
          style={{
            fontSize: 24,
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
            fontSize: 14,
            color: "#E2E8F0",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {error ? "Verification issue detected" : "Please review your photo before submitting"}
        </Text>
      </LinearGradient>

      {/* Center Face Framing Corner Brackets + Concentric Status Badge */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", zIndex: 10 }}>
        <View style={{ width: 260, height: 300, position: "relative", alignItems: "center", justifyContent: "center" }}>
          <FaceFramingBrackets width={260} height={300} />

          {/* Concentric Status Badge */}
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
            <View
              style={{
                width: 116,
                height: 116,
                borderRadius: 58,
                backgroundColor: error ? "rgba(239, 68, 68, 0.45)" : "rgba(44, 192, 197, 0.55)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 43,
                  backgroundColor: error ? "#DC2626" : THEME_TEAL,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: error ? "#EF4444" : "#2CC0C5",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                {error ? (
                  <Ionicons name="alert" size={40} color="white" />
                ) : (
                  <Svg width="36" height="28" viewBox="0 0 24 18" fill="none">
                    <Path
                      d="M2.5 9.5 L8.5 15.5 L21.5 2.5"
                      stroke="white"
                      strokeWidth="3.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Bottom Gradient Overlay & Actions */}
      <LinearGradient
        colors={["transparent", "rgba(15, 30, 35, 0.75)", "rgba(15, 30, 35, 0.96)"]}
        style={{
          paddingTop: 36,
          paddingHorizontal: 24,
          paddingBottom: 40,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Animated.Text
          entering={FadeIn.duration(600).delay(150)}
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "600",
            textAlign: "center",
            lineHeight: 28,
            marginBottom: 12,
          }}
        >
          {error ? "Face verification failed" : "Nice!\nFace photo captured"}
        </Animated.Text>

        {/* Error message or status display */}
        {error ? (
          <View
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              borderWidth: 1,
              borderColor: "rgba(239, 68, 68, 0.4)",
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 16,
              marginBottom: 20,
              width: "100%",
            }}
          >
            <Text style={{ color: "#FCA5A5", fontSize: 13, fontWeight: "500", textAlign: "center" }}>
              {error}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 13.5,
              fontWeight: "500",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {isLoading ? "Submitting to biometric gateway..." : "Check photo clarity or retake if needed"}
          </Text>
        )}

        {/* Action Buttons: Retake & Continue */}
        <View style={{ flexDirection: "row", width: "100%", gap: 12 }}>
          {onRetake && (
            <TouchableOpacity
              onPress={handleRetakePress}
              disabled={isLoading}
              activeOpacity={0.8}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 14,
                backgroundColor: "rgba(255, 255, 255, 0.14)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.25)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons name="camera-reverse-outline" size={20} color="white" />
              <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>Retake</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleConfirmPress}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{
              flex: onRetake ? 1.5 : 1,
              height: 50,
              borderRadius: 14,
              backgroundColor: error ? "#2563EB" : THEME_TEAL,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: error ? "#2563EB" : THEME_TEAL,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons
                  name={error ? "refresh-outline" : "checkmark-circle-outline"}
                  size={20}
                  color="white"
                />
                <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
                  {error ? "Retry" : "Looks Good"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};
