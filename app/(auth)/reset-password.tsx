import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff, Lock } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
const MUTED = "#F7F7F7";
const ERROR = "#DC2626";
const SUCCESS_COLOR = "#16A34A";

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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const allRulesPassed = STRENGTH_RULES.every((r) => r.test(newPassword));

  const handleContinue = async () => {
    setNewPasswordError("");
    setConfirmPasswordError("");
    let valid = true;

    if (!newPassword) {
      setNewPasswordError("Please enter a new password");
      valid = false;
    } else if (!allRulesPassed) {
      setNewPasswordError("Password does not meet all requirements below");
      valid = false;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your new password");
      valid = false;
    } else if (
      newPassword &&
      confirmPassword &&
      newPassword !== confirmPassword
    ) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }
    if (!valid) return;

    try {
      setIsSubmitting(true);
      await authApi.resetPassword(email, newPassword, "");
      router.replace("/(auth)/success" as any);
    } catch {
      setNewPasswordError("Could not reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputWrap = (hasError: boolean) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: hasError ? ERROR : BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: MUTED,
    gap: 10,
  });

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
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Image */}
          <View
            style={{ alignItems: "center", marginTop: 32, marginBottom: 20 }}
          >
            <Image
              source={require("../../assets/images/reset-password.png")}
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
              marginBottom: 28,
            }}
          >
            New Password
          </Text>

          {/* New Password */}
          <Text
            style={{
              color: DARK,
              fontWeight: "500",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Enter new password
          </Text>
          <View style={inputWrap(!!newPasswordError)}>
            <Lock size={18} color={newPasswordError ? ERROR : "#9CA3AF"} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, fontSize: 15, color: DARK }}
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={(v) => {
                setNewPassword(v);
                setNewPasswordError("");
                setConfirmPasswordError("");
              }}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              {showNew ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
          {newPasswordError ? (
            <Text
              style={{
                color: ERROR,
                fontSize: 12,
                marginTop: 4,
                marginBottom: 4,
              }}
            >
              {newPasswordError}
            </Text>
          ) : null}

          {/* Password Strength Checker — always shown when user starts typing */}
          {newPassword.length > 0 && (
            <View
              style={{
                marginTop: 10,
                marginBottom: 16,
                backgroundColor: "#F9FAFB",
                borderRadius: 10,
                padding: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: DARK,
                  marginBottom: 8,
                }}
              >
                Password requirements:
              </Text>
              {STRENGTH_RULES.map((rule) => {
                const passed = rule.test(newPassword);
                return (
                  <View
                    key={rule.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 5,
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: passed ? SUCCESS_COLOR : "#E5E7EB",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {passed && (
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: "bold",
                            marginBottom: 1,
                          }}
                        >
                          ✓
                        </Text>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: passed ? SUCCESS_COLOR : SECONDARY,
                      }}
                    >
                      {rule.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Confirm Password */}
          <Text
            style={{
              color: DARK,
              fontWeight: "500",
              fontSize: 13,
              marginTop: 20,

              marginBottom: 8,
            }}
          >
            Confirm password
          </Text>
          <View style={inputWrap(!!confirmPasswordError)}>
            <Lock size={18} color={confirmPasswordError ? ERROR : "#9CA3AF"} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, fontSize: 15, color: DARK }}
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setConfirmPasswordError("");
              }}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text style={{ color: ERROR, fontSize: 12, marginTop: 4 }}>
              {confirmPasswordError}
            </Text>
          ) : null}

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isSubmitting}
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 24,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {isSubmitting ? "Saving..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
