import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  AUTH_COLORS,
  AuthHeader,
  AuthLayout,
  AuthSubmitButton,
} from "../../src/components/auth";
import { getApiErrorMessage } from "../../src/hooks/useAuthHooks";
import { useRequestOtpMutation, useVerifyOtpMutation } from "../../src/store/api/authApi";

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
    context: "signup" | "forgot-password";
  }>();
  const email = params.email ?? "";
  const context = (params.context ?? "signup") as "signup" | "forgot-password";
  const purpose: "SIGNUP" | "RESET" = context === "signup" ? "SIGNUP" : "RESET";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(60);

  const [verifyMutation, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendMutation, { isLoading: isResending }] = useRequestOtpMutation();

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric digits
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue && value !== "") return;

    if (cleanValue.length > 1) {
      // User pasted or SMS auto-filled multiple digits
      const pastedDigits = cleanValue.slice(0, 6).split("");
      const newOtp = ["", "", "", "", "", ""];
      pastedDigits.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(pastedDigits.length - 1, 5);
      inputRefs.current[focusIndex]?.focus();
    } else {
      // Single character input
      const singleChar = cleanValue.slice(-1);
      const newOtp = [...otp];
      newOtp[index] = singleChar;
      setOtp(newOtp);
      if (singleChar && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 4) {
      Alert.alert("Error", "Please enter the complete verification code");
      return;
    }
    try {
      const res = await verifyMutation({
        destination: email,
        purpose,
        code,
      }).unwrap();

      if (context === "signup") {
        if (res.data?.accessToken) {
          router.replace("/(tabs)" as any);
        } else {
          router.replace("/(auth)/login" as any);
        }
      } else {
        const actualResetToken = (res.data as any)?.resetToken || (res.data as any)?.token || (res as any)?.resetToken || code;
        router.push({
          pathname: "/(auth)/reset-password",
          params: { email, resetToken: actualResetToken },
        } as any);
      }
    } catch (err: any) {
      Alert.alert(
        "Verification Failed",
        getApiErrorMessage(err, "Invalid or expired code. Please try again.")
      );
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendMutation({ destination: email, purpose }).unwrap();
      setResendCooldown(60);
      Alert.alert("Code Sent", "A new OTP has been sent to your email.");
    } catch (err: any) {
      Alert.alert("Error", getApiErrorMessage(err, "Could not resend code. Please try again."));
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(b.length, 3)) + c)
    : "your email";

  return (
    <AuthLayout showBackButton>
      <AuthHeader
        imageSource={require("../../assets/images/new.png")}
        title={context === "signup" ? "Verify OTP" : "Confirm Email"}
        subtitle={
          <Text style={{ color: AUTH_COLORS.SECONDARY, fontSize: 13, textAlign: "center", lineHeight: 20 }}>
            Enter the code we have sent to{"\n"}
            <Text style={{ color: AUTH_COLORS.DARK, fontWeight: "600" }}>{maskedEmail}</Text>
          </Text>
        }
        marginTop={32}
        marginBottom={32}
      />

      <Animated.View
        entering={FadeInDown.duration(600).delay(350)}
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
            maxLength={6}
            style={{
              width: 48,
              height: 52,
              borderWidth: 1.5,
              borderColor: digit ? AUTH_COLORS.PRIMARY : AUTH_COLORS.BORDER,
              borderRadius: 12,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "700",
              color: AUTH_COLORS.DARK,
              backgroundColor: digit ? "#EAF2F2" : "#FAFAFA",
            }}
          />
        ))}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(450)}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 32,
        }}
      >
        <Text style={{ color: AUTH_COLORS.SECONDARY, fontSize: 13 }}>Haven't received an email? </Text>
        <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0 || isResending}>
          <Text
            style={{
              color: resendCooldown > 0 ? AUTH_COLORS.SECONDARY : AUTH_COLORS.PRIMARY,
              fontWeight: "600",
              fontSize: 13,
            }}
          >
            {resendCooldown > 0
              ? `Send again (${resendCooldown}s)`
              : isResending
                ? "Sending..."
                : "Send again"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <AuthSubmitButton
        onPress={handleVerify}
        isLoading={isVerifying}
        disabled={otp.join("").length < 4}
        label="Continue"
        loadingLabel="Verifying..."
        animationDelay={550}
      />
    </AuthLayout>
  );
}
