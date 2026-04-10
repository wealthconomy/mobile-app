import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#155D5F";
const DARK = "#323232";
const SECONDARY = "#6B7280";
const SUCCESS_COLOR = "#16A34A";
const ERROR_COLOR = "#DC2626";

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
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const allRulesPassed = STRENGTH_RULES.every((r) => r.test(newPassword));

  const handleConfirm = () => {
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

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }

    if (valid && oldPassword) {
      setShowSuccess(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Change Password" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <View className="w-24 h-24 items-center justify-center mb-6">
              <Image
                source={require("../../../assets/images/reset-password.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
            <Text className="text-[20px] font-extrabold text-[#323232] mt-4">
              Change Password
            </Text>
          </View>

          <View className="gap-y-5 mb-10">
            <PasswordField
              label="Enter your old password"
              placeholder="Old password"
              secure={!showOld}
              value={oldPassword}
              onChangeText={setOldPassword}
              onToggle={() => setShowOld(!showOld)}
            />
            <PasswordField
              label="Enter new password"
              placeholder="New password"
              secure={!showNew}
              value={newPassword}
              onChangeText={(v: string) => {
                setNewPassword(v);
                setNewPasswordError("");
              }}
              onToggle={() => setShowNew(!showNew)}
              error={newPasswordError}
            />

            {newPassword.length > 0 && (
              <View className="mt-[-10px] mb-2 bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                <Text className="text-[12px] font-bold text-[#323232] mb-2">
                  Password requirements:
                </Text>
                {STRENGTH_RULES.map((rule) => {
                  const passed = rule.test(newPassword);
                  return (
                    <View
                      key={rule.label}
                      className="flex-row items-center mb-1 gap-x-2"
                    >
                      <View
                        className={`w-4 h-4 rounded-full items-center justify-center ${passed ? "bg-[#16A34A]" : "bg-[#E5E7EB]"}`}
                      >
                        {passed && (
                          <Text className="text-white text-[9px] font-bold">
                            ✓
                          </Text>
                        )}
                      </View>
                      <Text
                        className={`text-[12px] ${passed ? "text-[#16A34A]" : "text-[#6B7280]"}`}
                      >
                        {rule.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <PasswordField
              label="Confirm new password"
              placeholder="New password"
              secure={!showConfirm}
              value={confirmPassword}
              onChangeText={(v: string) => {
                setConfirmPassword(v);
                setConfirmPasswordError("");
              }}
              onToggle={() => setShowConfirm(!showConfirm)}
              error={confirmPasswordError}
            />
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-[#155D5F] h-14 rounded-2xl items-center justify-center"
          >
            <Text className="text-white text-base font-bold">Confirm</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-5">
          <View className="bg-white rounded-[32px] w-full p-8 items-center max-w-[340px]">
            <View className="w-20 h-20 bg-[#E7F5F5] rounded-full items-center justify-center mb-6">
              <Image
                source={require("../../../assets/images/success.png")}
                className="w-12 h-12"
                resizeMode="contain"
              />
            </View>

            <Text className="text-[20px] font-extrabold text-[#323232] mb-3 text-center">
              Password Changed Successfully ✅
            </Text>

            <Text className="text-[13px] text-[#6B7280] text-center leading-[20px] mb-8">
              Your password has been updated successfully. Next time you log in,
              please use your new password.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.replace("/profile/security" as any);
              }}
              className="bg-[#155D5F] h-14 w-full rounded-2xl items-center justify-center"
            >
              <Text className="text-white text-base font-bold">
                Back to Security
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const PasswordField = ({
  label,
  placeholder,
  secure,
  onToggle,
  value,
  onChangeText,
  error,
}: any) => (
  <View className="gap-y-2">
    <Text className="text-[14px] font-medium text-[#6B7280]">{label}</Text>
    <View className="relative">
      <View className="absolute left-4 top-4 z-10">
        <Ionicons
          name="lock-closed"
          size={20}
          color={error ? "#DC2626" : "#9CA3AF"}
        />
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secure}
        value={value}
        onChangeText={onChangeText}
        className={`bg-[#F8F9FA] h-14 rounded-2xl pl-12 pr-12 text-[15px] font-semibold text-[#323232] border ${error ? "border-[#DC2626]" : "border-[#F0F0F0]"}`}
      />
      <TouchableOpacity onPress={onToggle} className="absolute right-4 top-4">
        <Ionicons
          name={secure ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#9CA3AF"
        />
      </TouchableOpacity>
    </View>
    {error ? (
      <Text className="text-[#DC2626] text-[11px] mt-1 ml-1 font-medium">
        {error}
      </Text>
    ) : null}
  </View>
);
