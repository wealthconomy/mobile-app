import Header from "@/src/components/common/Header";
import { getApiErrorMessage } from "@/src/hooks/useAuthHooks";
import { useChangePasswordMutation, useLoginMutation } from "@/src/store/api/authApi";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { ShieldCheck, Check, KeyRound, Lock, Eye, EyeOff, Shield } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

type StrengthRule = { label: string; test: (p: string) => boolean };

const STRENGTH_RULES: StrengthRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  {
    label: "One special character (!@#$...)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export default function ChangePasswordScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const [mode, setMode] = useState<"overview" | "change">("overview");
  const [step, setStep] = useState(1); // 1: Old Password, 2: New Password, 3: Confirm Password

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const [loginApi] = useLoginMutation();
  const [changePasswordApi, { isLoading: isChanging }] = useChangePasswordMutation();

  const allRulesPassed = STRENGTH_RULES.every((r) => r.test(newPassword));

  useEffect(() => {
    setErrorMessage("");
    if (mode === "change") {
      const timer = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [mode, step]);

  const handleStartChange = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setStep(1);
    setMode("change");
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    // Step 1: Verify Current Password with Server
    if (step === 1) {
      if (!oldPassword.trim()) {
        setErrorMessage("Please enter your current password.");
        return;
      }

      setIsVerifying(true);
      try {
        const email = user?.email;
        if (!email) {
          throw new Error("Unable to identify current account email.");
        }

        // Verify current password by testing credentials against the auth endpoint
        await loginApi({ email, password: oldPassword.trim() }).unwrap();

        // Current password is correct! Proceed to Step 2
        setStep(2);
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          err?.message ||
          "Incorrect current password. Please check your password and try again.";
        setErrorMessage(
          typeof errorMsg === "string" && (errorMsg.includes("Invalid") || errorMsg.includes("credentials"))
            ? "Incorrect current password. Please check your password and try again."
            : errorMsg
        );
        setOldPassword("");
        setTimeout(() => inputRef.current?.focus(), 250);
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    // Step 2: New Password
    if (step === 2) {
      if (!newPassword) {
        setErrorMessage("Please enter a new password.");
        return;
      }
      if (newPassword === oldPassword) {
        setErrorMessage("New password must be different from your current password.");
        return;
      }
      if (!allRulesPassed) {
        setErrorMessage("Password does not meet all security requirements below.");
        return;
      }
      setStep(3);
      return;
    }

    // Step 3: Confirm New Password & Submit
    if (step === 3) {
      if (!confirmPassword) {
        setErrorMessage("Please confirm your new password.");
        return;
      }
      if (confirmPassword !== newPassword) {
        setErrorMessage("Passwords do not match. Please try again.");
        setConfirmPassword("");
        setTimeout(() => inputRef.current?.focus(), 250);
        return;
      }

      try {
        await changePasswordApi({
          oldPassword: oldPassword.trim(),
          newPassword: newPassword.trim(),
        }).unwrap();

        setShowSuccess(true);
      } catch (err: any) {
        const msg = getApiErrorMessage(
          err,
          "Failed to change password. Please check your password and try again."
        );
        setErrorMessage(msg);
      }
    }
  };

  const handleBackPress = () => {
    if (mode === "overview") {
      router.back();
    } else {
      if (step === 3) setStep(2);
      else if (step === 2) setStep(1);
      else setMode("overview");
    }
  };

  const isSubmitDisabled =
    isVerifying ||
    isChanging ||
    (step === 1 && !oldPassword.trim()) ||
    (step === 2 && (!newPassword || !allRulesPassed)) ||
    (step === 3 && !confirmPassword.trim());

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header
        title={mode === "overview" ? "Password Security" : "Change Password"}
        onBack={handleBackPress}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {mode === "overview" ? (
          // OVERVIEW LANDING SCREEN - Always displayed first
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
                Account Password
              </Text>

              <View className="flex-row items-center bg-[#DCFCE7] px-3.5 py-1 rounded-full mb-3">
                <View className="w-2 h-2 rounded-full bg-[#16A34A] mr-1.5" />
                <Text className="text-[12px] font-bold text-[#166534]">
                  Protected & Active
                </Text>
              </View>

              <Text className="text-[14px] text-[#6B7280] text-center leading-[22px] px-4">
                Your account is protected by your personal password. We recommend updating it periodically to keep your profile and funds secure.
              </Text>
            </Animated.View>

            {/* Feature cards */}
            <Animated.View entering={FadeInDown.duration(600).delay(250)} style={{ gap: 12, marginBottom: 32 }}>
              <View className="flex-row items-center bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB]">
                <View className="w-10 h-10 rounded-xl bg-[#EEF7F8] items-center justify-center mr-3.5">
                  <KeyRound size={20} color="#155D5F" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-[#1A1A1A]">Strong Encryption</Text>
                  <Text className="text-[13px] text-[#6B7280]">Safeguarded with industry-grade password hashing</Text>
                </View>
              </View>

              <View className="flex-row items-center bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB]">
                <View className="w-10 h-10 rounded-xl bg-[#EEF7F8] items-center justify-center mr-3.5">
                  <Lock size={20} color="#155D5F" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-[#1A1A1A]">Login Authentication</Text>
                  <Text className="text-[13px] text-[#6B7280]">Primary security layer across all your devices</Text>
                </View>
              </View>

              <View className="flex-row items-center bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB]">
                <View className="w-10 h-10 rounded-xl bg-[#EEF7F8] items-center justify-center mr-3.5">
                  <Shield size={20} color="#155D5F" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-[#1A1A1A]">Identity Verification</Text>
                  <Text className="text-[13px] text-[#6B7280]">Always verifies current password before updates</Text>
                </View>
              </View>
            </Animated.View>

            {/* Action Button */}
            <Animated.View entering={FadeInDown.duration(600).delay(400)} className="flex-1 justify-end">
              <TouchableOpacity
                onPress={handleStartChange}
                activeOpacity={0.85}
                className="bg-[#155D5F] h-14 rounded-2xl items-center justify-center shadow-sm"
              >
                <Text className="text-white text-base font-bold">
                  Change Password
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        ) : (
          // INTERACTIVE 3-STEP CHANGE PASSWORD SCREEN
          <ScrollView
            className="flex-1 px-5 pt-4"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Step Pill */}
            <View className="self-start bg-[#EEF7F8] px-3 py-1 rounded-full mb-3">
              <Text className="text-[#155D5F] text-[12px] font-bold">
                {`Step ${step} of 3 • ${step === 1 ? "Verification" : step === 2 ? "New Password" : "Confirmation"}`}
              </Text>
            </View>

            <Text className="text-[22px] font-extrabold text-[#1A1A1A] mb-1.5">
              {step === 1
                ? "Enter Current Password"
                : step === 2
                ? "Enter New Password"
                : "Confirm New Password"}
            </Text>

            <Text className="text-[14px] text-[#6B7280] leading-[20px] mb-6">
              {step === 1
                ? "Please enter your previous password to verify your account."
                : step === 2
                ? "Choose a strong new password with at least 8 characters."
                : "Re-enter your new password to complete the update."}
            </Text>

            {/* Step 1 Input */}
            {step === 1 && (
              <View className="mb-4">
                <Text className="text-[13px] font-semibold text-[#6B7280] mb-2">Current Password</Text>
                <View className="flex-row items-center h-14 px-4 rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB]">
                  <TextInput
                    ref={inputRef}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={!showOld}
                    placeholder="Enter your current password"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-[15px] font-semibold text-[#1A1A1A] pr-2"
                    autoCapitalize="none"
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setShowOld(!showOld)} hitSlop={10}>
                    {showOld ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 2 Input */}
            {step === 2 && (
              <View className="mb-4">
                <Text className="text-[13px] font-semibold text-[#6B7280] mb-2">New Password</Text>
                <View className="flex-row items-center h-14 px-4 rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] mb-5">
                  <TextInput
                    ref={inputRef}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                    placeholder="Enter your new password"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-[15px] font-semibold text-[#1A1A1A] pr-2"
                    autoCapitalize="none"
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)} hitSlop={10}>
                    {showNew ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Password Strength Checklist */}
                <View className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB] mb-4">
                  <Text className="text-[13px] font-bold text-[#323232] mb-3">
                    Password Requirements
                  </Text>
                  <View style={{ gap: 8 }}>
                    {STRENGTH_RULES.map((rule, idx) => {
                      const passed = rule.test(newPassword);
                      return (
                        <View key={idx} className="flex-row items-center gap-2.5">
                          <View
                            className={`w-4 h-4 rounded-full items-center justify-center ${
                              passed ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
                            }`}
                          >
                            {passed && <Check size={11} color="white" strokeWidth={3} />}
                          </View>
                          <Text
                            className={`text-[13px] font-medium ${
                              passed ? "text-[#16A34A]" : "text-[#6B7280]"
                            }`}
                          >
                            {rule.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* Step 3 Input */}
            {step === 3 && (
              <View className="mb-4">
                <Text className="text-[13px] font-semibold text-[#6B7280] mb-2">Confirm New Password</Text>
                <View className="flex-row items-center h-14 px-4 rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB]">
                  <TextInput
                    ref={inputRef}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    placeholder="Re-enter your new password"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-[15px] font-semibold text-[#1A1A1A] pr-2"
                    autoCapitalize="none"
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={10}>
                    {showConfirm ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!!errorMessage && (
              <View className="bg-[#FEF2F2] border border-[#FCA5A5] p-3 rounded-xl mb-4">
                <Text className="text-[#DC2626] font-semibold text-[13px] text-center">
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Action Button directly under input */}
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
                marginBottom: 40,
              }}
            >
              {isVerifying || isChanging ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={{
                    color: isSubmitDisabled ? "#9CA3AF" : "#FFFFFF",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {step === 1
                    ? "Verify Password"
                    : step === 2
                    ? "Continue"
                    : "Save New Password"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <BlurView intensity={25} style={StyleSheet.absoluteFill} tint="dark">
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-white rounded-3xl p-6 w-full max-w-[340px] items-center shadow-lg">
              <View className="w-16 h-16 rounded-full bg-[#DCFCE7] items-center justify-center mb-4">
                <Check size={36} color="#166534" strokeWidth={3} />
              </View>
              <Text className="text-[20px] font-extrabold text-[#1A1A1A] text-center mb-2">
                Password Updated!
              </Text>
              <Text className="text-[13px] text-[#6B7280] text-center leading-[19px] mb-6">
                Your account password has been successfully updated.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSuccess(false);
                  setMode("overview");
                  setStep(1);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
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
