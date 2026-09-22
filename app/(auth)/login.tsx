import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  AUTH_COLORS,
  AuthErrorBanner,
  AuthField,
  AuthHeader,
  AuthLayout,
  AuthPasswordField,
  AuthSubmitButton,
  SocialAuthSection,
} from "../../src/components/auth";
import { getApiErrorMessage } from "../../src/hooks/useAuthHooks";
import { useLoginMutation } from "../../src/store/api/authApi";
import { LoginFormData, loginSchema } from "../../src/validations/authSchemas";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const [loginMutation, { isLoading: isSubmitting }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError("");
    try {
      const res = await loginMutation(data).unwrap();
      const user = res.data?.user;

      if (user?.biometricsEnabled) {
        router.replace("/(tabs)");
      } else {
        let count = 0;
        try {
          const stored = await AsyncStorage.getItem("@biometric_prompt_dismissed_count");
          count = stored !== null ? parseInt(stored, 10) : 0;
        } catch {
          count = 0;
        }

        const newCount = count + 1;
        if (newCount >= 5) {
          await AsyncStorage.setItem("@biometric_prompt_dismissed_count", "0");
          router.replace("/(auth)/biometric-setup" as any);
        } else {
          await AsyncStorage.setItem("@biometric_prompt_dismissed_count", String(newCount));
          router.replace("/(tabs)");
        }
      }
    } catch (err: any) {
      // Inspect the raw error payload for lockout-level signals so we can show
      // specific, actionable messages rather than a generic "wrong password" fallback.
      const errorData = err?.data ?? err;
      const errorMsg = (
        errorData?.message ||
        errorData?.error ||
        errorData?.code ||
        (typeof errorData === 'string' ? errorData : '')
      ).toLowerCase();
      const errorCode: string = (errorData?.code || '').toUpperCase();

      if (errorMsg.includes('maintenance') || err?.status === 503) {
        setGeneralError(
          errorData?.message ||
          'Wealthconomy is currently undergoing scheduled maintenance. Please try again shortly.'
        );
      } else if (errorMsg.includes('block') || errorCode === 'USER_BLOCKED') {
        setGeneralError(
          errorData?.message ||
          'Your account has been blocked. Please contact support at support@wealthconomy.com.'
        );
      } else if (errorMsg.includes('suspend') || errorCode === 'USER_SUSPENDED') {
        setGeneralError(
          errorData?.message ||
          'Your account has been suspended. Please contact support at support@wealthconomy.com.'
        );
      } else {
        setGeneralError(
          getApiErrorMessage(err, "Incorrect email or password. Please try again.")
        );
      }
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        imageSource={require("../../assets/images/logo1.png")}
        title="Log In"
        subtitle={
          <Text style={{ color: AUTH_COLORS.SECONDARY, fontSize: 13, textAlign: "center", lineHeight: 20 }}>
            Please Log in to Continue your Wealth{"\n"}Building Journey
          </Text>
        }
      />

      <AuthErrorBanner error={generalError} />

      <AuthField
        control={control}
        name="email"
        label="Email Address"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={(hasError) => <Mail size={18} color={hasError ? AUTH_COLORS.ERROR : "#9CA3AF"} />}
        onValueChange={() => setGeneralError("")}
        animationDelay={250}
      />

      <AuthPasswordField
        control={control}
        name="password"
        label="Password"
        placeholder="Password"
        onValueChange={() => setGeneralError("")}
        animationDelay={350}
      />

      <Animated.View entering={FadeInDown.duration(600).delay(420)}>
        <TouchableOpacity
          style={{ marginBottom: 24, alignSelf: "flex-start" }}
          onPress={() => router.push("/(auth)/forgot-password" as any)}
        >
          <Text style={{ color: AUTH_COLORS.PRIMARY, fontWeight: "500", fontSize: 13 }}>
            Forgot password?
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <AuthSubmitButton
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting}
        disabled={!isValid}
        label="Log in"
        loadingLabel="Logging in..."
        animationDelay={500}
      />

      <SocialAuthSection
        promptText="Don't have an account yet?"
        linkHref="/(auth)/signup"
        linkText="Create an account"
        animationDelay={600}
      />
    </AuthLayout>
  );
}
