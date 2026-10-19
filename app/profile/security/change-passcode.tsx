import Header from "@/src/components/common/Header";
import { getApiErrorMessage } from "@/src/hooks/useAuthHooks";
import {
  useSetupPasscodeMutation,
  useUpdatePasscodeMutation,
  useVerifyPasscodeMutation,
  useForgotPasscodeMutation,
  useResetPasscodeMutation,
} from "@/src/store/api/userApi";
import { useLoginMutation } from "@/src/store/api/authApi";
import { setHasAppPasscode } from "@/src/store/slices/authSlice";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import {
  ShieldCheck,
  Check,
  KeyRound,
  Clock,
  Fingerprint,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

type ScreenMode = "overview" | "change" | "setup" | "forgot-password" | "forgot-otp";
type ResetSource = "none" | "password" | "otp";

export default function ChangePasscodeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [hasPasscode, setHasPasscode] = useState(true);
  const [mode, setMode] = useState<ScreenMode>("overview");
  const [step, setStep] = useState(1); // For change: 1: Old, 2: New, 3: Confirm. For setup: 1: New, 2: Confirm
  const [resetSource, setResetSource] = useState<ResetSource>("none");

  // Passcode inputs
  const [oldPasscode, setOldPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");

  // Forgot Passcode credentials
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetOtp, setResetOtp] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const passcodeInputRef = useRef<TextInput>(null);

  const [loginApi] = useLoginMutation();
  const [setupPasscodeApi] = useSetupPasscodeMutation();
  const [updatePasscodeApi] = useUpdatePasscodeMutation();
  const [verifyPasscodeApi] = useVerifyPasscodeMutation();
  const [forgotPasscodeApi, { isLoading: isRequestingOtp }] = useForgotPasscodeMutation();
  const [resetPasscodeApi] = useResetPasscodeMutation();

  // Load existing passcode status on mount
  useEffect(() => {
    async function checkPasscodeStatus() {
      try {
        const storedFlag = await AsyncStorage.getItem("@wealth_has_app_passcode");
        const storedCode = await AsyncStorage.getItem("@wealth_app_passcode");
        const exists = Boolean(
          user?.hasAppPasscode ||
          storedFlag === "true" ||
          storedCode ||
          user?.hasCompletedOnboarding
        );
        setHasPasscode(exists);
        if (!exists) {
          setMode("setup");
        } else {
          setMode("overview");
        }
      } catch {
        setHasPasscode(true);
        setMode("overview");
      }
    }
    checkPasscodeStatus();
  }, [user?.hasAppPasscode, user?.hasCompletedOnboarding]);

  // Auto-focus input when in input mode
  useEffect(() => {
    setErrorMessage("");
    if (mode === "change" || mode === "setup") {
      const timer = setTimeout(() => passcodeInputRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [mode, step]);

  const handleStartChange = () => {
    setOldPasscode("");
    setNewPasscode("");
    setConfirmPasscode("");
    setErrorMessage("");
    setResetSource("none");
    setResetPassword("");
    setResetOtp("");
    setStep(1);
    setMode("change");
  };

  const handleStartSetup = () => {
    setNewPasscode("");
    setConfirmPasscode("");
    setErrorMessage("");
    setResetSource("none");
    setResetPassword("");
    setResetOtp("");
    setStep(1);
    setMode("setup");
  };

  const handleForgotCurrentPasscode = () => {
    setErrorMessage("");
    setResetPassword("");
    setResetOtp("");
    setMode("forgot-password");
  };

  const handleSwitchToOtp = async () => {
    setErrorMessage("");
    setResetOtp("");
    setMode("forgot-otp");
    try {
      await forgotPasscodeApi().unwrap();
    } catch (err: any) {
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Failed to send reset code to your email. Please try again."
        )
      );
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage("");
    try {
      await forgotPasscodeApi().unwrap();
    } catch (err: any) {
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Failed to resend reset code. Please try again."
        )
      );
    }
  };

  const handleVerifyPassword = async () => {
    if (!resetPassword.trim()) {
      setErrorMessage("Please enter your account password to continue.");
      return;
    }
    setErrorMessage("");
    setIsVerifyingPassword(true);
    try {
      await loginApi({
        email: user?.email || "",
        password: resetPassword.trim(),
      }).unwrap();

      // Password verified! Advance directly to the existing Enter New Passcode page
      setResetSource("password");
      setNewPasscode("");
      setConfirmPasscode("");
      setStep(2);
      setMode("change");
    } catch (err: any) {
      setErrorMessage(
        "Incorrect account password. Please double-check your password, or tap 'Try another way' to reset using email OTP."
      );
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleOtpContinue = () => {
    if (resetOtp.trim().length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code sent to your email.");
      return;
    }
    setErrorMessage("");
    // OTP entered! Advance directly to the existing Enter New Passcode page
    setResetSource("otp");
    setNewPasscode("");
    setConfirmPasscode("");
    setStep(2);
    setMode("change");
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    if (mode === "change") {
      // Step 1: Verify current passcode
      if (step === 1) {
        if (oldPasscode.length !== 6) return;
        setLoading(true);
        try {
          let isVerified = false;
          try {
            const res = await verifyPasscodeApi({ passcode: oldPasscode }).unwrap();
            if (res?.data?.valid || res?.success || res?.statusCode === 200) {
              isVerified = true;
            }
          } catch (apiErr: any) {
            const msg = apiErr?.data?.message || apiErr?.message || "";
            if (
              apiErr?.status === 404 ||
              (typeof msg === "string" && msg.includes("Cannot POST"))
            ) {
              const localPasscode = await AsyncStorage.getItem("@wealth_app_passcode");
              if (!localPasscode || localPasscode === oldPasscode) {
                isVerified = true;
              } else {
                isVerified = false;
              }
            } else {
              throw apiErr;
            }
          }

          if (isVerified) {
            setResetSource("none");
            setStep(2);
          } else {
            setErrorMessage("Incorrect current passcode. Please try again, or tap 'Forgot Current Passcode?'.");
            setOldPasscode("");
            setTimeout(() => passcodeInputRef.current?.focus(), 250);
          }
        } catch (err: any) {
          const msg = getApiErrorMessage(
            err,
            "Incorrect current passcode. Please try again, or tap 'Forgot Current Passcode?'."
          );
          setErrorMessage(msg);
          setOldPasscode("");
          setTimeout(() => passcodeInputRef.current?.focus(), 250);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Step 2: New passcode
      if (step === 2) {
        if (newPasscode.length !== 6) return;
        if (resetSource === "none" && newPasscode === oldPasscode) {
          setErrorMessage("New passcode must be different from your current passcode.");
          return;
        }
        setStep(3);
        return;
      }

      // Step 3: Confirm new passcode
      if (step === 3) {
        if (confirmPasscode !== newPasscode) {
          setErrorMessage("Passcodes do not match. Please re-enter your new passcode.");
          setConfirmPasscode("");
          setTimeout(() => passcodeInputRef.current?.focus(), 250);
          return;
        }

        setLoading(true);
        try {
          if (resetSource === "password") {
            await resetPasscodeApi({
              newPasscode,
              password: resetPassword.trim(),
            }).unwrap();
          } else if (resetSource === "otp") {
            await resetPasscodeApi({
              newPasscode,
              otp: resetOtp.trim(),
            }).unwrap();
          } else {
            try {
              await updatePasscodeApi({ oldPasscode, newPasscode }).unwrap();
            } catch (updateErr: any) {
              if (updateErr?.status === 404 || updateErr?.status === 405) {
                await setupPasscodeApi({ passcode: newPasscode }).unwrap();
              } else {
                throw updateErr;
              }
            }
          }

          // Persist locally
          await AsyncStorage.setItem("@wealth_app_passcode", newPasscode);
          await AsyncStorage.setItem("@wealth_has_app_passcode", "true");
          dispatch(setHasAppPasscode(true));
          setHasPasscode(true);
          setShowSuccess(true);
        } catch (err: any) {
          const msg = getApiErrorMessage(
            err,
            resetSource === "otp"
              ? "Invalid or expired verification code. Please tap back and request a new code."
              : resetSource === "password"
              ? "Failed to reset passcode. Please check your password and try again."
              : "Failed to update passcode."
          );

          if (
            err?.status === 404 ||
            (typeof msg === "string" && (msg.includes("Cannot PUT") || msg.includes("Cannot POST")))
          ) {
            await AsyncStorage.setItem("@wealth_app_passcode", newPasscode);
            await AsyncStorage.setItem("@wealth_has_app_passcode", "true");
            dispatch(setHasAppPasscode(true));
            setHasPasscode(true);
            setShowSuccess(true);
          } else {
            setErrorMessage(msg);
          }
        } finally {
          setLoading(false);
        }
      }
    } else if (mode === "setup") {
      // Step 1: Create passcode
      if (step === 1) {
        if (newPasscode.length !== 6) return;
        setStep(2);
        return;
      }

      // Step 2: Confirm passcode
      if (step === 2) {
        if (confirmPasscode !== newPasscode) {
          setErrorMessage("Passcodes do not match. Please re-enter your new passcode.");
          setConfirmPasscode("");
          setTimeout(() => passcodeInputRef.current?.focus(), 250);
          return;
        }

        setLoading(true);
        try {
          await setupPasscodeApi({ passcode: newPasscode }).unwrap();
          await AsyncStorage.setItem("@wealth_app_passcode", newPasscode);
          await AsyncStorage.setItem("@wealth_has_app_passcode", "true");
          dispatch(setHasAppPasscode(true));
          setHasPasscode(true);
          setShowSuccess(true);
        } catch (err: any) {
          const msg = getApiErrorMessage(err, "Failed to set app lock passcode.");
          if (
            err?.status === 404 ||
            (typeof msg === "string" && msg.includes("Cannot POST"))
          ) {
            await AsyncStorage.setItem("@wealth_app_passcode", newPasscode);
            await AsyncStorage.setItem("@wealth_has_app_passcode", "true");
            dispatch(setHasAppPasscode(true));
            setHasPasscode(true);
            setShowSuccess(true);
          } else {
            setErrorMessage(msg);
          }
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const getActiveValue = () => {
    if (mode === "change") {
      if (step === 1) return oldPasscode;
      if (step === 2) return newPasscode;
      return confirmPasscode;
    }
    return step === 1 ? newPasscode : confirmPasscode;
  };

  const handleTextChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 6);
    setErrorMessage("");
    if (mode === "change") {
      if (step === 1) setOldPasscode(cleaned);
      else if (step === 2) setNewPasscode(cleaned);
      else setConfirmPasscode(cleaned);
    } else {
      if (step === 1) setNewPasscode(cleaned);
      else setConfirmPasscode(cleaned);
    }
  };

  const activeValue = getActiveValue();
  const isSubmitDisabled = activeValue.length !== 6 || loading;

  const handleBackPress = () => {
    setErrorMessage("");
    if (mode === "overview") {
      router.back();
    } else if (mode === "forgot-password") {
      setMode("change");
      setStep(1);
    } else if (mode === "forgot-otp") {
      setMode("forgot-password");
    } else if (mode === "change") {
      if (step === 3) {
        setStep(2);
      } else if (step === 2) {
        if (resetSource === "password") {
          setMode("forgot-password");
        } else if (resetSource === "otp") {
          setMode("forgot-otp");
        } else {
          setStep(1);
        }
      } else {
        setMode("overview");
      }
    } else if (mode === "setup") {
      if (step === 2) {
        setStep(1);
      } else if (hasPasscode) {
        setMode("overview");
      } else {
        router.back();
      }
    }
  };

  const getHeaderTitle = () => {
    if (mode === "overview") return "App Lock Passcode";
    if (mode === "forgot-password") return "Verify Password";
    if (mode === "forgot-otp") return "Email Verification";
    if (mode === "setup") return "Set App Passcode";
    return resetSource !== "none" ? "Reset Passcode" : "Change Passcode";
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header
        title={getHeaderTitle()}
        onBack={handleBackPress}
      />

      {mode === "overview" ? (
        // OVERVIEW LANDING SCREEN - Always clean, with single primary button
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(600).delay(100)} className="items-center my-6">
            <View className="w-24 h-24 rounded-full bg-[#E0F2F1] items-center justify-center border-4 border-white shadow-sm mb-4">
              <ShieldCheck size={48} color="#155D5F" strokeWidth={2.2} />
            </View>

            <Text className="text-[22px] font-extrabold text-[#1A1A1A] text-center mb-1.5">
              App Lock Passcode
            </Text>

            <View className="flex-row items-center bg-[#DCFCE7] px-3.5 py-1 rounded-full mb-3">
              <View className="w-2 h-2 rounded-full bg-[#16A34A] mr-1.5" />
              <Text className="text-[12px] font-bold text-[#166534]">
                {hasPasscode ? "Active & Configured" : "Not Configured"}
              </Text>
            </View>

            <Text className="text-[14px] text-[#6B7280] text-center leading-[22px] px-4">
              Your 6-digit passcode automatically protects Wealthconomy from unauthorized access whenever the app goes inactive.
            </Text>
          </Animated.View>

          {/* Security details cards */}
          <Animated.View entering={FadeInDown.duration(600).delay(250)} style={{ gap: 12, marginBottom: 32 }}>
            <View className="flex-row items-center bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB]">
              <View className="w-10 h-10 rounded-xl bg-[#EEF7F8] items-center justify-center mr-3.5">
                <Clock size={20} color="#155D5F" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#1A1A1A]">Inactivity Timeout</Text>
                <Text className="text-[13px] text-[#6B7280]">Locks app automatically after 3 minutes idle</Text>
              </View>
            </View>

            <View className="flex-row items-center bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB]">
              <View className="w-10 h-10 rounded-xl bg-[#EEF7F8] items-center justify-center mr-3.5">
                <Fingerprint size={20} color="#155D5F" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#1A1A1A]">Biometric Unlock</Text>
                <Text className="text-[13px] text-[#6B7280]">Fast unlock with Face ID or fingerprint</Text>
              </View>
            </View>

            <View className="flex-row items-center bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB]">
              <View className="w-10 h-10 rounded-xl bg-[#EEF7F8] items-center justify-center mr-3.5">
                <KeyRound size={20} color="#155D5F" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#1A1A1A]">Account Protection</Text>
                <Text className="text-[13px] text-[#6B7280]">Guards transactions and private assets</Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Button */}
          <Animated.View entering={FadeInDown.duration(600).delay(400)} className="flex-1 justify-end">
            <TouchableOpacity
              onPress={hasPasscode ? handleStartChange : handleStartSetup}
              activeOpacity={0.85}
              className="bg-[#155D5F] h-14 rounded-2xl items-center justify-center shadow-sm"
            >
              <Text className="text-white text-base font-bold">
                {hasPasscode ? "Change Passcode" : "Set Up Passcode"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      ) : mode === "forgot-password" ? (
        // FORGOT PASSCODE - FULL PAGE STEP 1: VERIFY ACCOUNT PASSWORD
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="self-start bg-[#EEF7F8] px-3 py-1 rounded-full mb-3">
            <Text className="text-[#155D5F] text-[12px] font-bold">
              Identity Verification • Account Password
            </Text>
          </View>

          <Text className="text-[22px] font-extrabold text-[#1A1A1A] mb-1.5">
            Verify Account Password
          </Text>

          <Text className="text-[14px] text-[#6B7280] leading-[20px] mb-6">
            Enter your account login password to authorize setting a new 6-digit passcode.
          </Text>

          <View className="mb-4">
            <Text className="text-[13px] font-bold text-[#374151] mb-2">
              Account Password
            </Text>
            <View className="flex-row items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 h-14">
              <Lock size={20} color="#9CA3AF" />
              <TextInput
                value={resetPassword}
                onChangeText={(t) => {
                  setResetPassword(t);
                  setErrorMessage("");
                }}
                placeholder="Enter your account password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showResetPassword}
                className="flex-1 ml-3 text-[15px] text-[#1A1A1A]"
                autoFocus
              />
              <TouchableOpacity
                onPress={() => setShowResetPassword(!showResetPassword)}
              >
                {showResetPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {!!errorMessage && (
            <View className="bg-[#FEF2F2] border border-[#FCA5A5] p-3 rounded-xl mb-4">
              <Text className="text-[#DC2626] font-semibold text-[13px] text-center">
                {errorMessage}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleVerifyPassword}
            disabled={isVerifyingPassword || !resetPassword.trim()}
            activeOpacity={0.85}
            style={{
              backgroundColor:
                isVerifyingPassword || !resetPassword.trim() ? "#E0E0E0" : "#155D5F",
              borderRadius: 16,
              height: 54,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
              marginBottom: 16,
            }}
          >
            {isVerifyingPassword ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={{
                  color: !resetPassword.trim() ? "#9CA3AF" : "#FFFFFF",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Continue
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSwitchToOtp}
            disabled={isRequestingOtp}
            activeOpacity={0.7}
            className="items-center py-3"
          >
            <Text className="text-[#155D5F] font-bold text-[14px]">
              {isRequestingOtp ? "Sending code..." : "Try another way"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : mode === "forgot-otp" ? (
        // FORGOT PASSCODE - FULL PAGE STEP 1 ALTERNATIVE: EMAIL OTP
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="self-start bg-[#EEF7F8] px-3 py-1 rounded-full mb-3">
            <Text className="text-[#155D5F] text-[12px] font-bold">
              Identity Verification • Email Code
            </Text>
          </View>

          <Text className="text-[22px] font-extrabold text-[#1A1A1A] mb-1.5">
            Verify with Email Code
          </Text>

          <Text className="text-[14px] text-[#6B7280] leading-[20px] mb-6">
            We sent a 6-digit verification code to{" "}
            <Text className="font-bold text-[#1A1A1A]">
              {user?.email || "your registered email"}
            </Text>
            . Enter the code below to continue.
          </Text>

          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[13px] font-bold text-[#374151]">
                6-Digit Verification Code
              </Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={isRequestingOtp}
              >
                <Text className="text-[12px] font-bold text-[#155D5F]">
                  {isRequestingOtp ? "Sending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={resetOtp}
              onChangeText={(t) => {
                setResetOtp(t.replace(/[^0-9]/g, "").slice(0, 6));
                setErrorMessage("");
              }}
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={6}
              className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 h-14 text-[18px] font-bold text-[#1A1A1A] text-center tracking-widest"
              autoFocus
            />
          </View>

          {!!errorMessage && (
            <View className="bg-[#FEF2F2] border border-[#FCA5A5] p-3 rounded-xl mb-4">
              <Text className="text-[#DC2626] font-semibold text-[13px] text-center">
                {errorMessage}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleOtpContinue}
            disabled={resetOtp.length !== 6}
            activeOpacity={0.85}
            style={{
              backgroundColor: resetOtp.length !== 6 ? "#E0E0E0" : "#155D5F",
              borderRadius: 16,
              height: 54,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: resetOtp.length !== 6 ? "#9CA3AF" : "#FFFFFF",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMode("forgot-password");
              setErrorMessage("");
            }}
            activeOpacity={0.7}
            className="items-center py-3"
          >
            <Text className="text-[#155D5F] font-bold text-[14px]">
              Use Account Password instead
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        // INTERACTIVE 6-DIGIT PASSCODE ENTRY SCREEN (Change or Setup)
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step Pill */}
          <View className="self-start bg-[#EEF7F8] px-3 py-1 rounded-full mb-3">
            <Text className="text-[#155D5F] text-[12px] font-bold">
              {mode === "change"
                ? resetSource !== "none"
                  ? `Step ${step === 2 ? 1 : 2} of 2 • ${step === 2 ? "New Passcode" : "Confirmation"}`
                  : `Step ${step} of 3 • ${step === 1 ? "Verification" : step === 2 ? "New Passcode" : "Confirmation"}`
                : `Step ${step} of 2 • ${step === 1 ? "Create" : "Confirmation"}`}
            </Text>
          </View>

          <Text className="text-[22px] font-extrabold text-[#1A1A1A] mb-1.5">
            {mode === "change"
              ? step === 1
                ? "Enter Current Passcode"
                : step === 2
                ? "Enter New Passcode"
                : "Confirm New Passcode"
              : step === 1
              ? "Create 6-Digit Passcode"
              : "Confirm 6-Digit Passcode"}
          </Text>

          <Text className="text-[14px] text-[#6B7280] leading-[20px] mb-6">
            {mode === "change"
              ? step === 1
                ? "Please enter your previous 6-digit passcode to verify your identity."
                : step === 2
                ? "Choose a new 6-digit passcode to secure your app lock."
                : "Re-enter your new 6-digit passcode to complete the update."
              : step === 1
              ? "Set a 6-digit passcode to lock Wealthconomy when inactive."
              : "Re-enter your 6-digit passcode to confirm."}
          </Text>

          {/* 6 Digit Display Boxes */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => passcodeInputRef.current?.focus()}
            className="flex-row justify-center gap-2.5 my-6"
          >
            {Array.from({ length: 6 }).map((_, index) => {
              const isFilled = index < activeValue.length;
              const isCurrent = index === activeValue.length;
              return (
                <View
                  key={index}
                  style={{
                    width: 44,
                    height: 52,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: isCurrent ? "#155D5F" : isFilled ? "#155D5F40" : "#E5E7EB",
                    backgroundColor: isFilled ? "#EEF7F8" : "#F9FAFB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {isFilled && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#155D5F",
                      }}
                    />
                  )}
                </View>
              );
            })}
          </TouchableOpacity>

          <TextInput
            ref={passcodeInputRef}
            value={activeValue}
            onChangeText={handleTextChange}
            keyboardType="numeric"
            maxLength={6}
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
            autoFocus
          />

          {!!errorMessage && (
            <View className="bg-[#FEF2F2] border border-[#FCA5A5] p-3 rounded-xl mb-4">
              <Text className="text-[#DC2626] font-semibold text-[13px] text-center">
                {errorMessage}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            activeOpacity={0.85}
            style={{
              backgroundColor: isSubmitDisabled ? "#E0E0E0" : "#155D5F",
              borderRadius: 16,
              height: 54,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={{
                  color: isSubmitDisabled ? "#9CA3AF" : "#FFFFFF",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {mode === "change"
                  ? step === 1
                    ? "Verify Passcode"
                    : step === 2
                    ? "Continue"
                    : "Save New Passcode"
                  : step === 1
                  ? "Continue"
                  : "Save Passcode"}
              </Text>
            )}
          </TouchableOpacity>

          {mode === "change" && step === 1 && (
            <TouchableOpacity
              onPress={handleForgotCurrentPasscode}
              activeOpacity={0.7}
              className="items-center py-2 mb-8"
            >
              <Text className="text-[#155D5F] font-bold text-[14px]">
                Forgot Current Passcode?
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <BlurView intensity={25} style={StyleSheet.absoluteFill} tint="dark">
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-white rounded-3xl p-6 w-full max-w-[340px] items-center shadow-lg">
              <View className="w-16 h-16 rounded-full bg-[#DCFCE7] items-center justify-center mb-4">
                <Check size={36} color="#166534" strokeWidth={3} />
              </View>
              <Text className="text-[20px] font-extrabold text-[#1A1A1A] text-center mb-2">
                Passcode Updated!
              </Text>
              <Text className="text-[13px] text-[#6B7280] text-center leading-[19px] mb-6">
                Your 6-digit app lock passcode has been successfully saved.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSuccess(false);
                  setMode("overview");
                  setStep(1);
                  setResetSource("none");
                  setOldPasscode("");
                  setNewPasscode("");
                  setConfirmPasscode("");
                  setResetPassword("");
                  setResetOtp("");
                }}
                className="w-full bg-[#155D5F] py-3.5 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-[15px]">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}
