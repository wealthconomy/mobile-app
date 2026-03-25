import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../../api/auth";

const PRIMARY = "#155D5F";
const DARK = "#323232";
const SECONDARY = "#6B7280";
const BORDER = "#E5E5E5";

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
    context: "signup" | "forgot-password";
  }>();
  const email = params.email ?? "";
  const context = (params.context ?? "signup") as "signup" | "forgot-password";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }
    try {
      setIsVerifying(true);
      await authApi.verifyOtp(email, code, context);
      if (context === "signup") {
        // After signup OTP → go to Login
        router.replace("/(auth)/login" as any);
      } else {
        // After forgot-password OTP → go to Reset Password
        router.push({
          pathname: "/(auth)/reset-password",
          params: { email },
        } as any);
      }
    } catch {
      Alert.alert(
        "Verification Failed",
        "Invalid or expired code. Please try again.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setIsResending(true);
      await authApi.resendOtp(email, context);
      setResendCooldown(60);
      Alert.alert("Code Sent", "A new OTP has been sent to your email.");
    } catch {
      Alert.alert("Error", "Could not resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(Math.max(b.length, 3)) + c,
      )
    : "your email";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back button */}
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
        <Text style={{ fontSize: 14, fontWeight: "500", color: DARK }}>
          Back
        </Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Image */}
          <View
            style={{ alignItems: "center", marginTop: 32, marginBottom: 28 }}
          >
            <Image
              source={require("../../assets/images/new.png")}
              style={{ width: 69, height: 73 }}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: DARK,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {context === "signup" ? "Verify OTP" : "Confirm Email"}
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              color: SECONDARY,
              fontSize: 13,
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 32,
            }}
          >
            Enter the code we have sent an OTP to email{"\n"}
            <Text style={{ color: DARK, fontWeight: "600" }}>
              {maskedEmail}
            </Text>
          </Text>

          {/* OTP Inputs */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 32,
            }}
          >
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(v) => handleOtpChange(v, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 48,
                  height: 52,
                  borderWidth: 1.5,
                  borderColor: digit ? PRIMARY : BORDER,
                  borderRadius: 12,
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "700",
                  color: DARK,
                  backgroundColor: digit ? "#EAF2F2" : "#FAFAFA",
                }}
              />
            ))}
          </View>

          {/* Resend */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <Text style={{ color: SECONDARY, fontSize: 13 }}>
              Haven't received an email?{" "}
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendCooldown > 0 || isResending}
            >
              <Text
                style={{
                  color: resendCooldown > 0 ? SECONDARY : PRIMARY,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {resendCooldown > 0
                  ? `Send again (${resendCooldown}s)`
                  : "Send again"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Continue / Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={isVerifying || otp.join("").length < 6}
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              opacity: isVerifying || otp.join("").length < 6 ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {isVerifying ? "Verifying..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
