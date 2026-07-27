import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import {
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useLoginMutation,
  useRegisterMutation,
  useRequestOtpMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
} from "../store/api/authApi";
import {
  ChangePasswordFormData,
  changePasswordSchema,
  ForgotPasswordFormData,
  forgotPasswordSchema,
  LoginFormData,
  loginSchema,
  RegisterFormData,
  registerSchema,
  ResetPasswordFormData,
  resetPasswordSchema,
  VerifyOtpFormData,
  verifyOtpSchema,
} from "../validations/authSchemas";

/**
 * Helper to extract clear user-facing error messages from RTK Query errors
 */
export function getApiErrorMessage(error: any, fallback = "An unexpected error occurred"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.data && typeof error.data.message === "string") {
    return error.data.message;
  }
  if (error.message && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}

/**
 * Custom Hook for Login Form
 */
export function useLoginForm(onSuccessCallback?: () => void) {
  const [loginMutation, { isLoading }] = useLoginMutation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await loginMutation(data).unwrap();
      Alert.alert("Success", res.message || "Login successful!");
      onSuccessCallback?.();
    } catch (err: any) {
      Alert.alert("Login Failed", getApiErrorMessage(err, "Invalid email or password"));
    }
  };

  return {
    ...form,
    isLoading,
    handleLogin: form.handleSubmit(onSubmit),
  };
}

/**
 * Custom Hook for User Registration Form
 */
export function useRegisterForm(onSuccessCallback?: (destination: string) => void) {
  const [registerMutation, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      wealthPreference: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        ...(data.wealthPreference ? { wealthPreference: data.wealthPreference } : {}),
      };
      const res = await registerMutation(payload).unwrap();
      Alert.alert("Registration Successful", res.message || "Please verify your OTP");
      onSuccessCallback?.(res.data?.destination || data.email);
    } catch (err: any) {
      Alert.alert("Registration Failed", getApiErrorMessage(err, "Could not register account"));
    }
  };

  return {
    ...form,
    isLoading,
    handleRegister: form.handleSubmit(onSubmit),
  };
}

/**
 * Custom Hook for OTP Verification
 */
export function useVerifyOtpForm(
  initialDestination: string,
  purpose: "SIGNUP" | "RESET" = "SIGNUP",
  onSuccessCallback?: () => void
) {
  const [verifyMutation, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendMutation, { isLoading: isResending }] = useRequestOtpMutation();

  const form = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      destination: initialDestination,
      purpose,
      code: "",
    },
  });

  const onSubmit = async (data: VerifyOtpFormData) => {
    try {
      const res = await verifyMutation(data).unwrap();
      Alert.alert("Success", res.message || "OTP verified!");
      onSuccessCallback?.();
    } catch (err: any) {
      Alert.alert("Verification Failed", getApiErrorMessage(err, "Invalid OTP code"));
    }
  };

  const handleResendOtp = async () => {
    const destination = form.getValues("destination") || initialDestination;
    if (!destination) {
      Alert.alert("Error", "No destination email/phone provided");
      return;
    }
    try {
      const res = await resendMutation({ destination, purpose }).unwrap();
      Alert.alert("OTP Sent", res.message || `A new OTP has been sent to ${destination}`);
    } catch (err: any) {
      Alert.alert("Resend Failed", getApiErrorMessage(err, "Could not resend OTP"));
    }
  };

  return {
    ...form,
    isVerifying,
    isResending,
    handleVerify: form.handleSubmit(onSubmit),
    handleResendOtp,
  };
}

/**
 * Custom Hook for Forgot Password Form
 */
export function useForgotPasswordForm(onSuccessCallback?: (destination: string) => void) {
  const [forgotMutation, { isLoading }] = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      destination: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const res = await forgotMutation(data).unwrap();
      Alert.alert("Reset Code Sent", res.message || "Please check your email/phone for the OTP");
      onSuccessCallback?.(data.destination);
    } catch (err: any) {
      Alert.alert("Error", getApiErrorMessage(err, "Could not send password reset OTP"));
    }
  };

  return {
    ...form,
    isLoading,
    handleForgotPassword: form.handleSubmit(onSubmit),
  };
}

/**
 * Custom Hook for Reset Password Form (with resetToken)
 */
export function useResetPasswordForm(initialDestination: string, resetToken: string, onSuccessCallback?: () => void) {
  const [resetMutation, { isLoading }] = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      destination: initialDestination,
      resetToken: resetToken,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const res = await resetMutation(data).unwrap();
      Alert.alert("Success", res.message || "Your password has been reset successfully!");
      onSuccessCallback?.();
    } catch (err: any) {
      Alert.alert("Reset Failed", getApiErrorMessage(err, "Could not reset password"));
    }
  };

  return {
    ...form,
    isLoading,
    handleResetPassword: form.handleSubmit(onSubmit),
  };
}

/**
 * Custom Hook for Change Password Form
 */
export function useChangePasswordForm(onSuccessCallback?: () => void) {
  const [changeMutation, { isLoading }] = useChangePasswordMutation();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const res = await changeMutation(data).unwrap();
      Alert.alert("Success", res.message || "Password changed successfully!");
      form.reset();
      onSuccessCallback?.();
    } catch (err: any) {
      Alert.alert("Change Failed", getApiErrorMessage(err, "Could not update password"));
    }
  };

  return {
    ...form,
    isLoading,
    handleChangePassword: form.handleSubmit(onSubmit),
  };
}
