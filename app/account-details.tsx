import Header from "@/src/components/common/Header";
import {
  InsertPinModal,
  TransferSuccessModal,
} from "@/src/features/payment/components/PaymentModals";
import { RootState } from "@/src/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { bankId } = useLocalSearchParams<{ bankId: string }>();
  const banks = useSelector((state: RootState) => state.payment.banks);
  const selectedBank = banks.find((b) => b.id === bankId);

  const [amount, setAmount] = useState("");
  const [narrative, setNarrative] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleMakePayment = () => {
    if (!amount) return;
    setShowPinModal(true);
  };

  const handlePinConfirm = (pin: string) => {
    setShowPinModal(false);
    // Simulate API delay
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 500);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.replace("/payment-settings" as any);
  };

  if (!selectedBank) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Account Details" />

      <ScrollView
        className="flex-1 px-5 pt-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mb-10">
          <Text className="text-[18px] font-extrabold text-[#111827] mb-1">
            {selectedBank.name}
          </Text>
          <Text className="text-[14px] text-[#6B7280]">
            {selectedBank.bankName} - {selectedBank.accountNumber}
          </Text>
        </View>

        <View className="gap-y-6">
          {/* Amount */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Amount(₦)
            </Text>
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>

          {/* Narrative */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Narrative
            </Text>
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                placeholder="Enter narrative"
                placeholderTextColor="#9CA3AF"
                value={narrative}
                onChangeText={setNarrative}
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleMakePayment}
          disabled={!amount}
          className={`mt-10 h-16 rounded-2xl items-center justify-center ${amount ? "bg-[#155D5F]" : "bg-[#155D5F]/50"}`}
        >
          <Text className="text-white text-base font-bold">Make Payment</Text>
        </TouchableOpacity>
      </ScrollView>

      <InsertPinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handlePinConfirm}
      />

      <TransferSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={handleSuccessConfirm}
        title="Funds Transferred Successfully ✅"
        description={`Congratulations, WealthBuilder! You have successfully transfer ₦${parseFloat(amount).toLocaleString()} from your Wealth Flex account to ${selectedBank.name} ${selectedBank.bankName} Bank Account(${selectedBank.accountNumber}). Current Balance: ₦XX,XXX.XX`}
      />
    </SafeAreaView>
  );
}
