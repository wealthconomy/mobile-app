import Header from "@/src/components/common/Header";
import { TransferSuccessModal } from "@/src/features/payment/components/PaymentModals";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InsertPinScreen() {
  const router = useRouter();
  const { amount, bankName, accountNumber, name } = useLocalSearchParams<{
    amount: string;
    bankName: string;
    accountNumber: string;
    name: string;
  }>();

  const [pin, setPin] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus the input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePinChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 4) {
      setPin(cleaned);
      if (cleaned.length === 4) {
        // Automatically trigger success when 4 digits are entered
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 300);
      }
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.replace("/payment" as any);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="" />

      <View className="flex-1 px-8 pt-10 items-center">
        <View className="w-20 h-20 bg-[#EFF7F8] rounded-3xl items-center justify-center mb-6">
          <Image
            source={require("@/assets/images/change-pin.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-[26px] font-extrabold text-[#155D5F] mb-2">
          Insert your Pin
        </Text>
        <Text className="text-[14px] text-[#6B7280] mb-10 text-center leading-[22px]">
          Please insert pin to complete transaction
        </Text>

        {/* Hidden TextInput for native keyboard */}
        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={handlePinChange}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
          style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
          caretHidden
        />

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          className="flex-row gap-x-4 mb-12"
        >
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={`w-16 h-16 rounded-2xl items-center justify-center border-2 ${
                pin.length >= i
                  ? "bg-[#EFF7F8] border-[#155D5F]"
                  : "bg-[#F9FAFB] border-[#E5E7EB]"
              }`}
            >
              {pin.length >= i && (
                <View className="w-3.5 h-3.5 bg-[#155D5F] rounded-full" />
              )}
            </View>
          ))}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <Text className="text-[#155D5F] font-bold underline">
            Forgot your pin?
          </Text>
        </TouchableOpacity>
      </View>

      <TransferSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={handleSuccessConfirm}
        title="Funds Transferred Successfully ✅"
        description={`Congratulations, WealthBuilder! You have successfully transfer ₦${parseFloat(amount || "0").toLocaleString()} from your Wealth Flex account to ${name} ${bankName} Bank Account(${accountNumber}). Current Balance: ₦XX,XXX.XX`}
      />
    </SafeAreaView>
  );
}
