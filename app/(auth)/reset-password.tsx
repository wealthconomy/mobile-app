import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  AuthErrorBanner,
  AuthHeader,
  AuthLayout,
  AuthPasswordField,
  AuthSubmitButton,
  PasswordStrengthMeter,
} from "../../src/components/auth";
import { getApiErrorMessage } from "../../src/hooks/useAuthHooks";
import { useResetPasswordMutation } from "../../src/store/api/authApi";
import { ResetPasswordFormData, resetPasswordSchema } from "../../src/validations/authSchemas";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string; resetToken?: string }>();
  const email = params.email ?? "";
  const resetToken = params.resetToken ?? "";

  const [generalError, setGeneralError] = useState("");
  const [resetMutation, { isLoading: isSubmitting }] = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      destination: email,
      resetToken: resetToken,
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setGeneralError("");
    try {
      await resetMutation(data).unwrap();
      router.replace("/(auth)/success" as any);
    } catch (err: any) {
      setGeneralError(
        getApiErrorMessage(err, "Could not reset password. Please try again.")
      );
    }
  };

  return (
    <AuthLayout showBackButton>
      <AuthHeader
        imageSource={require("../../assets/images/reset-password.png")}
        title="New Password"
        marginTop={32}
        marginBottom={28}
      />

      <AuthErrorBanner error={generalError} />

      <AuthPasswordField
        control={control}
        name="newPassword"
        label="Enter new password"
        placeholder="Password"
        onValueChange={() => {
          trigger("confirmPassword");
          setGeneralError("");
        }}
        animationDelay={350}
      />

      <PasswordStrengthMeter password={newPassword} />

      <AuthPasswordField
        control={control}
        name="confirmPassword"
        label="Confirm password"
        placeholder="Password"
        onValueChange={() => setGeneralError("")}
        animationDelay={450}
      />

      <AuthSubmitButton
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting}
        disabled={!isValid}
        label="Continue"
        loadingLabel="Saving..."
        animationDelay={550}
        marginTop={24}
      />
    </AuthLayout>
  );
}
