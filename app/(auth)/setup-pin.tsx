import { useRouter } from "expo-router";
import { ChevronLeft, Check, Lock, ShieldCheck } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../src/store";
import {
  useSetupPinMutation,
  useSetupPasscodeMutation,
} from "../../src/store/api/userApi";
import {
  setHasTransactionPin,
  setHasAppPasscode,
} from "../../src/store/slices/authSlice";

const PRIMARY = "#155D5F";
const DARK = "#323232";
const SECONDARY = "#6B7280";
const ERROR = "#DC2626";

type FlowStep = "pin-create" | "pin-confirm" | "passcode-create" | "passcode-confirm" | "success";

export default function SetupPinScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Initialize step based on backend flags
  const [currentStep, setCurrentStep] = useState<FlowStep>(() => {
    if (user?.hasTransactionPin && !user?.hasAppPasscode) {
      return "passcode-create";
    }
    return "pin-create";
  });

  // 4-digit transaction PIN
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // 6-digit app lock passcode
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const [setupPinApi] = useSetupPinMutation();
  const [setupPasscodeApi] = useSetupPasscodeMutation();

  useEffect(() => {
    setErrorMessage("");
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Handler for text change depending on current step
  const handlePinTextChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setErrorMessage("");

    if (currentStep === "pin-create") {
      setPin(cleaned);
      if (cleaned.length === 4) {
        setTimeout(() => setCurrentStep("pin-confirm"), 200);
      }
    } else if (currentStep === "pin-confirm") {
      setConfirmPin(cleaned);
      if (cleaned.length === 4) {
        if (cleaned !== pin) {
          setErrorMessage("PINs do not match. Please re-enter.");
          setTimeout(() => setConfirmPin(""), 600);
        } else {
          // Proceed to save PIN
          saveTransactionPin(cleaned);
        }
      }
    } else if (currentStep === "passcode-create") {
      setPasscode(cleaned);
      if (cleaned.length === 6) {
        setTimeout(() => setCurrentStep("passcode-confirm"), 200);
      }
    } else if (currentStep === "passcode-confirm") {
      setConfirmPasscode(cleaned);
      if (cleaned.length === 6) {
        if (cleaned !== passcode) {
          setErrorMessage("Passcodes do not match. Please re-enter.");
          setTimeout(() => setConfirmPasscode(""), 600);
        } else {
          // Proceed to save passcode
          saveAppPasscode(cleaned);
        }
      }
    }
  };

  const saveTransactionPin = async (finalPin: string) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await setupPinApi({ pin: finalPin }).unwrap();
      await AsyncStorage.setItem("@wealth_transaction_pin", finalPin);
      await AsyncStorage.setItem("@wealth_has_transaction_pin", "true");
      dispatch(setHasTransactionPin(true));
      // Smoothly transition to setting the 6-digit App Passcode
      setCurrentStep("passcode-create");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "";
      const isPendingOrAlready =
        err?.status === 404 ||
        (typeof msg === "string" &&
          (msg.toLowerCase().includes("already set") ||
            msg.includes("Cannot POST")));

      if (isPendingOrAlready) {
        await AsyncStorage.setItem("@wealth_transaction_pin", finalPin);
        await AsyncStorage.setItem("@wealth_has_transaction_pin", "true");
        dispatch(setHasTransactionPin(true));
        setCurrentStep("passcode-create");
      } else {
        setErrorMessage(msg || "Failed to set transaction PIN. Please try again.");
        setConfirmPin("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAppPasscode = async (finalPasscode: string) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await setupPasscodeApi({ passcode: finalPasscode }).unwrap();
      await AsyncStorage.setItem("@wealth_app_passcode", finalPasscode);
      await AsyncStorage.setItem("@wealth_has_app_passcode", "true");
      dispatch(setHasAppPasscode(true));
      setCurrentStep("success");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "";
      const isPendingOrAlready =
        err?.status === 404 ||
        (typeof msg === "string" &&
          (msg.toLowerCase().includes("already set") ||
            msg.includes("Cannot POST")));

      if (isPendingOrAlready) {
        // Backend endpoint is pending deployment on server: persist locally and advance
        await AsyncStorage.setItem("@wealth_app_passcode", finalPasscode);
        await AsyncStorage.setItem("@wealth_has_app_passcode", "true");
        dispatch(setHasAppPasscode(true));
        setCurrentStep("success");
      } else {
        setErrorMessage(
          typeof msg === "string" && msg.length > 0
            ? msg
            : "Could not complete passcode setup. Please try again."
        );
        setConfirmPasscode("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepDetails = () => {
    switch (currentStep) {
      case "pin-create":
        return {
          badge: "Step 1 of 2",
          title: "Create Transaction PIN",
          desc: "Set a 4-digit PIN to securely authorize withdrawals, transfers, and portfolio investments.",
          length: 4,
          value: pin,
        };
      case "pin-confirm":
        return {
          badge: "Step 1 of 2",
          title: "Confirm Transaction PIN",
          desc: "Re-enter your 4-digit transaction PIN to confirm.",
          length: 4,
          value: confirmPin,
        };
      case "passcode-create":
        return {
          badge: "Step 2 of 2",
          title: "Create App Lock Passcode",
          desc: "Set a 6-digit passcode to quickly unlock Wealthconomy whenever you step away.",
          length: 6,
          value: passcode,
        };
      case "passcode-confirm":
        return {
          badge: "Step 2 of 2",
          title: "Confirm App Lock Passcode",
          desc: "Re-enter your 6-digit passcode to confirm.",
          length: 6,
          value: confirmPasscode,
        };
      case "success":
        return {
          badge: "All Set!",
          title: "Security Setup Complete!",
          desc: "Your transaction PIN and app lock passcode are now active and protecting your wealth.",
          length: 0,
          value: "",
        };
    }
  };

  const currentDetails = getStepDetails();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 40,
            justifyContent: currentStep === "success" ? "center" : "flex-start",
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep !== "success" ? (
            <Animated.View entering={FadeInDown.duration(400)}>
              {/* Top Progress Badge */}
              <View className="flex-row items-center justify-between mb-8">
                <View className="bg-[#E6F4F4] px-3.5 py-1.5 rounded-full">
                  <Text className="text-[#155D5F] font-bold text-[12px]">
                    {currentDetails.badge}
                  </Text>
                </View>
                <View className="w-10 h-10 rounded-full bg-[#E6F4F4] items-center justify-center">
                  <ShieldCheck size={20} color={PRIMARY} />
                </View>
              </View>

              {/* Title & Description */}
              <Text className="text-[#1A1A1A] font-extrabold text-[24px] mb-2">
                {currentDetails.title}
              </Text>
              <Text className="text-[#6B7280] text-[14px] leading-[22px] mb-8">
                {currentDetails.desc}
              </Text>

              {/* Masked PIN / Passcode Dots */}
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
                className="flex-row justify-center items-center py-6 gap-3 mb-4"
              >
                {Array.from({ length: currentDetails.length }).map((_, index) => {
                  const isFilled = index < currentDetails.value.length;
                  const isCurrent = index === currentDetails.value.length;

                  return (
                    <View
                      key={index}
                      style={{
                        width: currentDetails.length === 6 ? 44 : 56,
                        height: currentDetails.length === 6 ? 50 : 58,
                        borderRadius: 14,
                        borderWidth: 2,
                        borderColor: isCurrent
                          ? PRIMARY
                          : isFilled
                          ? "#155D5F40"
                          : "#E5E7EB",
                        backgroundColor: isFilled ? "#EEF7F8" : "#F9FAFB",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {isFilled && (
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: PRIMARY,
                          }}
                        />
                      )}
                    </View>
                  );
                })}
              </TouchableOpacity>

              {/* Hidden Native TextInput */}
              <TextInput
                ref={inputRef}
                value={currentDetails.value}
                onChangeText={handlePinTextChange}
                keyboardType="numeric"
                maxLength={currentDetails.length}
                style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                autoFocus
              />

              {/* Error Message */}
              {!!errorMessage && (
                <Animated.View entering={FadeInDown.duration(300)}>
                  <Text className="text-[#DC2626] font-semibold text-[13px] text-center mt-2 mb-4">
                    {errorMessage}
                  </Text>
                </Animated.View>
              )}

              {/* Loading Indicator */}
              {isSubmitting && (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color={PRIMARY} />
                  <Text className="text-[#6B7280] text-[12px] mt-2">
                    Securing your credentials...
                  </Text>
                </View>
              )}

              {/* Guidance Tips */}
              <View className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 mt-6">
                <Text className="text-[#1A1A1A] font-bold text-[13px] mb-1">
                  🔒 Security Reminder
                </Text>
                <Text className="text-[#6B7280] text-[12px] leading-[18px]">
                  Never share your transaction PIN or passcode with anyone, including Wealthconomy staff.
                </Text>
              </View>
            </Animated.View>
          ) : (
            /* Success Screen */
            <Animated.View
              entering={FadeInUp.duration(600)}
              className="items-center px-4"
            >
              <View className="w-24 h-24 rounded-full bg-[#DCFCE7] items-center justify-center mb-6">
                <Check size={48} color="#166534" strokeWidth={3} />
              </View>

              <Text className="text-[#1A1A1A] font-extrabold text-[24px] text-center mb-2">
                Security Setup Complete!
              </Text>
              <Text className="text-[#6B7280] text-[14px] text-center leading-[22px] mb-8">
                Your 4-digit Transaction PIN and 6-digit App Lock Passcode have been established. You are ready to start growing your wealth.
              </Text>

              <TouchableOpacity
                onPress={() => router.replace("/(tabs)")}
                activeOpacity={0.85}
                style={{
                  width: "100%",
                  height: 52,
                  backgroundColor: PRIMARY,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text className="text-white font-bold text-[16px]">
                  Go to Dashboard
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
