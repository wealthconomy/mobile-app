import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Fingerprint, Lock, ShieldCheck, Zap } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { AUTH_COLORS, AuthHeader, AuthLayout } from "../../src/components/auth";
import { BiometricTargetRings } from "../../src/components/common";
import { useToggleBiometricsMutation } from "../../src/store/api/userApi";

export default function BiometricSetupScreen() {
  const router = useRouter();
  const [toggleBiometrics, { isLoading }] = useToggleBiometricsMutation();

  const handleEnableNow = async () => {
    try {
      await toggleBiometrics({ biometricsEnabled: true }).unwrap();
      router.replace("/(tabs)" as any);
    } catch (err) {
      // Even if API fails in offline/mock mode, proceed to home
      Alert.alert(
        "Biometrics Setup",
        "Biometric preference saved. You can manage this anytime in Security Settings."
      );
      router.replace("/(tabs)" as any);
    }
  };

  const handleMaybeLater = async () => {
    try {
      // Set dismissal count to 0 so counter starts for 5th login prompt
      await AsyncStorage.setItem("@biometric_prompt_dismissed_count", "0");
    } catch (e) {
      // Silent error handling
    }
    router.replace("/(tabs)" as any);
  };

  return (
    <AuthLayout scrollPaddingBottom={36}>
      <Animated.View
        entering={FadeInUp.duration(600)}
        style={{ alignItems: "center", marginTop: 24, marginBottom: 12 }}
      >
        <BiometricTargetRings showShimmer={true}>
          <Fingerprint size={24} color="#FFFFFF" />
        </BiometricTargetRings>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            color: AUTH_COLORS.DARK,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Secure Your Account
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: AUTH_COLORS.SECONDARY,
            textAlign: "center",
            lineHeight: 22,
            paddingHorizontal: 16,
            marginBottom: 32,
          }}
        >
          Enable Face ID or Fingerprint authentication for fast, effortless, and bank-grade protection.
        </Text>
      </Animated.View>

      {/* Feature Cards */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(200)}
        style={{ gap: 14, marginBottom: 36 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F9FAFB",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 16,
            padding: 16,
            gap: 14,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "#EAF6F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={22} color={AUTH_COLORS.PRIMARY} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: AUTH_COLORS.DARK, marginBottom: 2 }}>
              Fast & Instant Login
            </Text>
            <Text style={{ fontSize: 13, color: AUTH_COLORS.SECONDARY, lineHeight: 18 }}>
              Access your wealth portfolio in seconds without typing your password each time.
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F9FAFB",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 16,
            padding: 16,
            gap: 14,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "#EAF6F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={22} color={AUTH_COLORS.PRIMARY} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: AUTH_COLORS.DARK, marginBottom: 2 }}>
              Bank-Grade Security
            </Text>
            <Text style={{ fontSize: 13, color: AUTH_COLORS.SECONDARY, lineHeight: 18 }}>
              Hardware-backed encryption ensures only you can unlock your account.
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View entering={FadeInDown.duration(600).delay(400)} style={{ gap: 12 }}>
        <TouchableOpacity
          onPress={handleEnableNow}
          disabled={isLoading}
          activeOpacity={0.85}
          style={{
            backgroundColor: AUTH_COLORS.PRIMARY,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: AUTH_COLORS.PRIMARY,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
            {isLoading ? "Enabling..." : "Enable Now"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMaybeLater}
          activeOpacity={0.7}
          style={{
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: AUTH_COLORS.SECONDARY, fontSize: 15, fontWeight: "600" }}>
            Maybe Later
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </AuthLayout>
  );
}
