import Header from "@/src/components/common/Header";
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
  const { bankId, cardId } = useLocalSearchParams<{
    bankId: string;
    cardId: string;
  }>();
  const { banks, cards } = useSelector((state: RootState) => state.payment);

  const selectedPaymentMethod = bankId
    ? banks.find((b) => b.id === bankId)
    : cards.find((c) => c.id === cardId);

  const displayData = selectedPaymentMethod
    ? {
        name:
          "name" in selectedPaymentMethod
            ? selectedPaymentMethod.name
            : selectedPaymentMethod.holderName,
        bankName:
          "bankName" in selectedPaymentMethod
            ? selectedPaymentMethod.bankName
            : selectedPaymentMethod.brand.charAt(0).toUpperCase() +
              selectedPaymentMethod.brand.slice(1),
        accountNumber:
          "accountNumber" in selectedPaymentMethod
            ? selectedPaymentMethod.accountNumber
            : `**** ${selectedPaymentMethod.lastFour}`,
      }
    : null;

  const [amount, setAmount] = useState("");
  const [narrative, setNarrative] = useState("");

  const handleMakePayment = () => {
    if (!amount || !displayData) return;
    router.push({
      pathname: "/payment/insert-pin",
      params: {
        amount,
        bankName: displayData.bankName,
        accountNumber: displayData.accountNumber,
        name: displayData.name,
      },
    } as any);
  };

  if (!displayData) return null;

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
            {displayData.name}
          </Text>
          <Text className="text-[14px] text-[#6B7280]">
            {displayData.bankName} - {displayData.accountNumber}
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
    </SafeAreaView>
  );
}
