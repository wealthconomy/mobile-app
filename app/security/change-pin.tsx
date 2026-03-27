import Header from "@/src/components/common/Header";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const pinInputRef = useRef<TextInput>(null);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (step === 2 && resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendCooldown]);

  useEffect(() => {
    if (step === 1 || step === 3) {
      setTimeout(() => pinInputRef.current?.focus(), 500);
    } else if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 500);
    }
  }, [step]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View className="items-center">
            <View className="w-24 h-24 items-center justify-center mb-6">
              <Image
                source={require("../../assets/images/change-pin.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
            <Text className="text-[20px] font-extrabold text-[#323232] mb-2">
              Change your Pin
            </Text>
            <Text className="text-[12px] text-[#6B7280] text-center mb-10 px-10">
              This pin is required for transaction and to secure your funds
            </Text>

            <View className="mb-12">
              <Text className="text-center text-[14px] font-medium text-[#6B7280] mb-4">
                Enter your old pin
              </Text>
              <PinInput
                value={pin}
                onChange={setPin}
                length={4}
                inputRef={pinInputRef}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View className="items-center">
            <View style={{ alignItems: "center", marginBottom: 28 }}>
              <Image
                source={require("../../assets/images/new.png")}
                style={{ width: 69, height: 73 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-[22px] font-bold text-[#323232] text-center mb-2">
              Confirm Email
            </Text>
            <Text className="text-[13px] text-[#6B7280] text-center mb-8 px-6 leading-5">
              Enter the code we have sent an OTP to email{"\n"}
              <Text className="font-bold text-[#323232]">
                odunayosimon@gmail.com
              </Text>
            </Text>

            <View className="flex-row justify-between w-full mb-8 px-2">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpRefs.current[index] = ref)}
                  value={digit}
                  onChangeText={(v) => handleOtpChange(v, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  style={{
                    width: 48,
                    height: 52,
                    borderWidth: 1.5,
                    borderColor: digit ? "#155D5F" : "#E5E5E5",
                    borderRadius: 12,
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#323232",
                    backgroundColor: digit ? "#EAF2F2" : "#FAFAFA",
                  }}
                />
              ))}
            </View>

            <View className="flex-row justify-center mb-8">
              <Text className="text-[13px] text-[#6B7280]">
                Haven't received an email?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => setResendCooldown(60)}
                disabled={resendCooldown > 0}
              >
                <Text
                  className={`text-[13px] font-bold ${resendCooldown > 0 ? "text-[#6B7280]" : "text-[#155D5F]"}`}
                >
                  {resendCooldown > 0
                    ? `Send again (${resendCooldown}s)`
                    : "Send again"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 3:
        return (
          <View className="items-center">
            <View className="w-24 h-24 items-center justify-center mb-6">
              <Image
                source={require("../../assets/images/change-pin.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
            <Text className="text-[20px] font-extrabold text-[#323232] mb-2">
              New Pin
            </Text>
            <Text className="text-[12px] text-[#6B7280] text-center mb-10 px-10">
              This pin is required for transaction and to secure your funds
            </Text>

            <View className="mb-12">
              <Text className="text-center text-[14px] font-medium text-[#6B7280] mb-4">
                Enter your new pin
              </Text>
              <PinInput
                value={pin}
                onChange={setPin}
                length={4}
                inputRef={pinInputRef}
              />
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Change your Pin" />

      <ScrollView
        className="flex-1 px-5 pt-8"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {renderStep()}

        <TouchableOpacity
          onPress={() => {
            if (step < 3) {
              setPin("");
              setOtp(["", "", "", "", "", ""]);
              setStep(step + 1);
            } else {
              setShowSuccess(true);
            }
          }}
          disabled={
            (step === 1 && pin.length < 4) ||
            (step === 2 && otp.join("").length < 6) ||
            (step === 3 && pin.length < 4)
          }
          className="bg-[#155D5F] h-14 rounded-2xl items-center justify-center"
          style={{
            opacity:
              (step === 1 && pin.length < 4) ||
              (step === 2 && otp.join("").length < 6) ||
              (step === 3 && pin.length < 4)
                ? 0.5
                : 1,
          }}
        >
          <Text className="text-white text-base font-bold">
            {step === 3 ? "Confirm" : "Continue"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-5">
          <View className="bg-white rounded-[32px] w-full p-8 items-center max-w-[340px]">
            <View className="w-20 h-20 bg-[#E7F5F5] rounded-full items-center justify-center mb-6">
              <Image
                source={require("../../assets/images/success.png")}
                className="w-12 h-12"
                resizeMode="contain"
              />
            </View>

            <Text className="text-[20px] font-extrabold text-[#323232] mb-3 text-center">
              PIN Changed Successfully ✅
            </Text>

            <Text className="text-[13px] text-[#6B7280] text-center leading-[20px] mb-8">
              Your transaction PIN has been updated successfully. You can now
              use your new PIN for all your transactions.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.replace("/security");
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

const PinInput = ({ value, onChange, length = 4, inputRef }: any) => {
  return (
    <Pressable onPress={() => inputRef.current?.focus()} className="relative">
      <View className="flex-row gap-x-3 justify-center">
        {Array(length)
          .fill(0)
          .map((_, i) => (
            <View
              key={i}
              className={`w-14 h-14 bg-[#F8F9FA] rounded-2xl border items-center justify-center ${value.length === i ? "border-[#155D5F]" : "border-[#F0F0F0]"}`}
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
