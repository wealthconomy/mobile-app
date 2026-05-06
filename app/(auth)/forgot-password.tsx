import { useRouter } from "expo-router";
import { ChevronLeft, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../../api/auth";

const PRIMARY = "#155D5F";
const DARK = "#323232";
const SECONDARY = "#6B7280";
const BORDER = "#E5E5E5";
const MUTED = "#F7F7F7";
const ERROR = "#DC2626";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    setEmailError("");
    if (!email) {
      setEmailError("Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    try {
      setIsSubmitting(true);
      await authApi.forgotPassword(email);
      router.push({
        pathname: "/(auth)/otp",
        params: { email, context: "forgot-password" },
      } as any);
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("user")
      ) {
        setEmailError("No account found with this email address.");
      } else {
        setEmailError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 4,
          gap: 4,
        }}
      >
        <ChevronLeft size={24} color={DARK} style={{ width: 12 }} />
        <Text style={{ color: DARK, fontSize: 14, fontWeight: "500" }}>
          Back
        </Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Image */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(100)}
            style={{ alignItems: "center", marginTop: 40, marginBottom: 28 }}
          >
            <Image
              source={require("../../assets/images/forget-password.png")}
              style={{ width: 69, height: 73 }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.duration(600).delay(250)}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: PRIMARY,
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            Forget Password
          </Text>
          </Animated.View>

          {/* Email Field */}
          <Animated.View entering={FadeInDown.duration(600).delay(350)}>
          <Text
            style={{
              color: DARK,
              fontWeight: "500",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Email
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: emailError ? ERROR : BORDER,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 14,
              backgroundColor: MUTED,
              gap: 10,
              marginBottom: emailError ? 6 : 32,
            }}
          >
            <Mail size={18} color={emailError ? ERROR : "#9CA3AF"} />
            <TextInput
              placeholder="Enter Email"
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, fontSize: 15, color: DARK }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setEmailError("");
              }}
            />
          </View>
          {emailError ? (
            <Text style={{ color: ERROR, fontSize: 12, marginBottom: 26 }}>
              {emailError}
            </Text>
          ) : null}
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isSubmitting}
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {isSubmitting ? "Sending Code..." : "Continue"}
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: SECONDARY,
              fontSize: 12,
              textAlign: "center",
              marginTop: 20,
              lineHeight: 18,
            }}
          >
            We'll send a 6-digit code to this email to verify your identity.
          </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
