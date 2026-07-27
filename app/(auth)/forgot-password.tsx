import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  AUTH_COLORS,
  AuthErrorBanner,
  AuthField,
  AuthHeader,
  AuthLayout,
  AuthSubmitButton,
} from "../../src/components/auth";
import { getApiErrorMessage } from "../../src/hooks/useAuthHooks";
import { useForgotPasswordMutation } from "../../src/store/api/authApi";
import { ForgotPasswordFormData, forgotPasswordSchema } from "../../src/validations/authSchemas";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState("");
  const [forgotMutation, { isLoading: isSubmitting }] = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { destination: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setGeneralError("");
    try {
      await forgotMutation(data).unwrap();
      router.push({
        pathname: "/(auth)/otp",
        params: { email: data.destination, context: "forgot-password" },
      } as any);
    } catch (err: any) {
      const msg = getApiErrorMessage(err, "Something went wrong. Please try again.");
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("user")) {
        setGeneralError("No account found with this email address.");
      } else {
        setGeneralError(msg);
      }
    }
  };

  return (
    <AuthLayout showBackButton>
      <AuthHeader
        imageSource={require("../../assets/images/forget-password.png")}
        title="Forget Password"
        titleColor={AUTH_COLORS.PRIMARY}
        marginTop={40}
        marginBottom={32}
      />

      <AuthErrorBanner error={generalError} />

      <AuthField
        control={control}
        name="destination"
        label="Email"
        placeholder="Enter Email"
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={(hasError) => <Mail size={18} color={hasError ? AUTH_COLORS.ERROR : "#9CA3AF"} />}
        onValueChange={() => setGeneralError("")}
        animationDelay={350}
      />

      <View style={{ marginTop: 18 }}>
        <AuthSubmitButton
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          disabled={!isValid}
          label="Continue"
          loadingLabel="Sending Code..."
          animationDelay={500}
          marginBottom={20}
        />

        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <Text
            style={{
              color: AUTH_COLORS.SECONDARY,
              fontSize: 12,
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            We'll send a code to this email to verify your identity.
          </Text>
        </Animated.View>
      </View>
    </AuthLayout>
  );
}
