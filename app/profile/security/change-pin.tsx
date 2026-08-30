import Header from "@/src/components/common/Header";
import { useSetupPinMutation, useUpdatePinMutation } from "@/src/store/api/userApi";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePinScreen() {
  const router = useRouter();
  
  // mode: "setup" (if user has no pin yet) or "change" (if user wants to change existing pin)
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [step, setStep] = useState(1); // 1: Old PIN (or New PIN for setup), 2: New PIN (or Confirm PIN for setup), 3: Confirm PIN (for change)
  
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const pinInputRef = useRef<TextInput>(null);

  const [setupPinApi] = useSetupPinMutation();
  const [updatePinApi] = useUpdatePinMutation();

  useEffect(() => {
    setTimeout(() => pinInputRef.current?.focus(), 350);
  }, [step, isSetupMode]);

  const handleSubmit = async () => {
    if (isSetupMode) {
      if (step === 1) {
        if (newPin.length !== 4) return;
        setStep(2);
        return;
      }
      if (step === 2) {
        if (confirmPin !== newPin) {
          Alert.alert("PIN Mismatch", "The confirmed PIN does not match. Please try again.");
          setConfirmPin("");
          return;
        }

        setLoading(true);
        try {
          await setupPinApi({ pin: newPin }).unwrap();
          setShowSuccess(true);
        } catch (err: any) {
          // If already set, switch to change mode
          if (err?.data?.message?.toLowerCase()?.includes("already") || err?.status === 400) {
            setIsSetupMode(false);
            setStep(1);
            setOldPin("");
            setNewPin("");
            setConfirmPin("");
            Alert.alert("Notice", "A transaction PIN is already set. Please enter your existing PIN to change it.");
          } else {
            Alert.alert("Error", err?.data?.message || err?.message || "Failed to set transaction PIN.");
          }
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Change PIN flow
      if (step === 1) {
        if (oldPin.length !== 4) return;
        setStep(2);
        return;
      }
      if (step === 2) {
        if (newPin.length !== 4) return;
        setStep(3);
        return;
      }
      if (step === 3) {
        if (confirmPin !== newPin) {
          Alert.alert("PIN Mismatch", "The confirmed PIN does not match. Please try again.");
          setConfirmPin("");
          return;
        }

        setLoading(true);
        try {
          await updatePinApi({ oldPin, newPin }).unwrap();
          setShowSuccess(true);
        } catch (err: any) {
          Alert.alert("Error", err?.data?.message || err?.message || "Failed to update transaction PIN.");
          if (err?.data?.message?.toLowerCase()?.includes("invalid") || err?.data?.message?.toLowerCase()?.includes("incorrect")) {
            setStep(1);
            setOldPin("");
            setNewPin("");
            setConfirmPin("");
          }
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const getActiveValue = () => {
    if (isSetupMode) {
      return step === 1 ? newPin : confirmPin;
    }
    if (step === 1) return oldPin;
    if (step === 2) return newPin;
    return confirmPin;
  };

  const setActiveValue = (val: string) => {
    if (isSetupMode) {
      if (step === 1) setNewPin(val);
      else setConfirmPin(val);
    } else {
      if (step === 1) setOldPin(val);
      else if (step === 2) setNewPin(val);
      else setConfirmPin(val);
    }
  };

  const getStepTitle = () => {
    if (isSetupMode) {
      return step === 1 ? "Set Your Transaction PIN" : "Confirm Your PIN";
    }
    if (step === 1) return "Enter Current PIN";
    if (step === 2) return "Enter New PIN";
    return "Confirm New PIN";
  };

  const getStepSubtitle = () => {
    if (isSetupMode) {
      return step === 1
        ? "Create a 4-digit PIN to secure all your withdrawals and portfolio investments."
        : "Re-enter your 4-digit PIN to confirm.";
    }
    if (step === 1) return "Enter your existing 4-digit transaction PIN.";
    if (step === 2) return "Choose a new 4-digit transaction PIN.";
    return "Re-enter your new 4-digit PIN to confirm.";
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header
        title={isSetupMode ? "Setup PIN" : "Change PIN"}
        onBack={() => {
          if (step > 1) {
            setStep(step - 1);
          } else {
            router.back();
          }
        }}
      />

      <ScrollView
        className="flex-1 px-5 pt-8"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="items-center">
          <View className="w-24 h-24 items-center justify-center mb-6">
            <Image
              source={require("../../../assets/images/change-pin.png")}
              className="w-16 h-16"
              resizeMode="contain"
            />
          </View>
          <Text className="text-[20px] font-extrabold text-[#323232] mb-2 text-center">
            {getStepTitle()}
          </Text>
          <Text className="text-[13px] text-[#6B7280] text-center mb-10 px-8 leading-[18px]">
            {getStepSubtitle()}
          </Text>

          <View className="mb-10 w-full items-center">
            <PinInput
              value={getActiveValue()}
              onChange={setActiveValue}
              length={4}
              inputRef={pinInputRef}
            />
          </View>

          {/* Mode Switcher */}
          {step === 1 && (
            <TouchableOpacity
              onPress={() => {
                setIsSetupMode(!isSetupMode);
                setOldPin("");
                setNewPin("");
                setConfirmPin("");
              }}
              className="mb-8"
            >
              <Text className="text-[#155D5F] font-bold text-xs text-center">
                {isSetupMode ? "Already set a PIN? Change it here" : "First time? Setup new PIN instead"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={getActiveValue().length !== 4 || loading}
          className="bg-[#155D5F] h-14 rounded-2xl items-center justify-center"
          style={{
            opacity: getActiveValue().length !== 4 || loading ? 0.5 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-bold">
              {(isSetupMode && step === 2) || (!isSetupMode && step === 3) ? "Confirm & Save PIN" : "Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

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
              PIN {isSetupMode ? "Setup" : "Updated"} Successfully! ✅
            </Text>

            <Text className="text-[13px] text-[#6B7280] text-center leading-[20px] mb-8">
              Your transaction PIN has been saved securely. You can now use this PIN for all withdrawals and portfolio creation actions.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.back();
              }}
              className="bg-[#155D5F] h-14 w-full rounded-2xl items-center justify-center"
            >
              <Text className="text-white text-base font-bold">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const PinInput = ({ value, onChange, length = 4, inputRef }: any) => {
  return (
    <Pressable onPress={() => inputRef.current?.focus()} className="relative">
      <View className="flex-row gap-x-3 justify-center">
        {Array(length)
          .fill(0)
          .map((_, i) => (
            <View
              key={i}
              className={`w-14 h-14 bg-[#F8F9FA] rounded-2xl border items-center justify-center ${
                value.length === i ? "border-[#155D5F]" : "border-[#F0F0F0]"
              }`}
            >
              {value.length > i ? (
                <View className="w-3 h-3 bg-[#323232] rounded-full" />
              ) : null}
            </View>
          ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        maxLength={length}
        className="absolute w-full h-full opacity-0"
        caretHidden
      />
    </Pressable>
  );
};
