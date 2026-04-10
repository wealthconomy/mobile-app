import Header from "@/src/components/common/Header";
import { RemoveConfirmationModal } from "@/src/features/payment/components/PaymentModals";
import { AppDispatch, RootState } from "@/src/store";
import {
  removeBank,
  removeCard,
  setDefaultCard,
} from "@/src/store/slices/paymentSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function PaymentSettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { banks, cards } = useSelector((state: RootState) => state.payment);

  const [bankToRemove, setBankToRemove] = useState<string | null>(null);
  const [cardToRemove, setCardToRemove] = useState<string | null>(null);

  const handleRemoveBank = () => {
    if (bankToRemove) {
      dispatch(removeBank(bankToRemove));
      setBankToRemove(null);
    }
  };

  const handleRemoveCard = () => {
    if (cardToRemove) {
      dispatch(removeCard(cardToRemove));
      setCardToRemove(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Payment Settings" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        {/* Withdraw Funds Section */}
        <View className="bg-[#F9FAFB] rounded-[32px] p-6 mb-8 border border-[#F3F4F6]">
          <Text className="text-[14px] font-bold text-[#111827] mb-1">
            Withdraw Funds
          </Text>
          <Text className="text-[12px] text-[#6B7280] mb-6">
            Select or add a bank account to withdraw funds
          </Text>

          <View className="gap-y-4 mb-6">
            {banks.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                onPress={() =>
                  router.push({
                    pathname: "/account-details",
                    params: { bankId: bank.id },
                  } as any)
                }
                activeOpacity={0.7}
                className="bg-white p-4 rounded-2xl flex-row items-center border border-[#F3F4F6]"
              >
                <View className="w-10 h-10 bg-[#EFF7F8] rounded-full items-center justify-center mr-4">
                  <Ionicons name="library-outline" size={20} color="#155D5F" />
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-[#111827]">
                    {bank.name}
                  </Text>
                  <Text className="text-[12px] text-[#9CA3AF] uppercase">
                    {bank.bankName} - {bank.accountNumber}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setBankToRemove(bank.id);
                  }}
                  className="flex-row items-center"
                >
                  <Text className="text-[12px] font-bold text-[#EF4444] mr-1.5">
                    Remove
                  </Text>
                  <Ionicons name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/add-bank" as any)}
            className="bg-[#155D5F] h-14 rounded-2xl flex-row items-center justify-center"
          >
            <Ionicons name="add" size={24} color="white" className="mr-2" />
            <Text className="text-white text-base font-bold">
              Add Bank Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Manage Payment Methods Section */}
        <View className="bg-[#F9FAFB] rounded-[32px] p-6 border border-[#F3F4F6]">
          <Text className="text-[14px] font-bold text-[#111827] mb-1">
            Manage Payment Methods
          </Text>
          <Text className="text-[12px] text-[#6B7280] mb-6">
            Select or add card for top up your funds
          </Text>

          <View className="gap-y-4 mb-6">
            {cards.map((card) => (
              <View
                key={card.id}
                className="bg-white p-4 rounded-2xl flex-row items-center border border-[#F3F4F6]"
              >
                <View className="w-10 h-10 bg-[#F9FAFB] rounded-xl items-center justify-center mr-4 border border-[#F3F4F6]">
                  <Ionicons
                    name={card.brand === "mastercard" ? "logo-bitcoin" : "card"}
                    size={24}
                    color={card.brand === "mastercard" ? "#EB001B" : "#1A1F71"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-[#111827]">
                    {card.holderName}
                  </Text>
                  <Text className="text-[12px] text-[#9CA3AF]">
                    **** {card.lastFour}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  {card.isDefault ? (
                    <Text className="text-[12px] font-bold text-[#D1D5DB] mr-4">
                      Default
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={() => dispatch(setDefaultCard(card.id))}
                      className="mr-4"
                    >
                      <Text className="text-[12px] font-bold text-[#6B7280]">
                        Make Default
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => setCardToRemove(card.id)}
                    className="flex-row items-center"
                  >
                    <Text className="text-[12px] font-bold text-[#EF4444] mr-1.5">
                      Remove
                    </Text>
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/use-card" as any)}
            className="bg-white h-14 rounded-2xl flex-row items-center justify-center border border-[#E5E7EB]"
          >
            <Ionicons name="add" size={24} color="#111827" className="mr-2" />
            <Text className="text-[#111827] text-base font-bold">Add Card</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Removal Modals */}
      <RemoveConfirmationModal
        visible={!!bankToRemove}
        onClose={() => setBankToRemove(null)}
        onConfirm={handleRemoveBank}
        title="Remove bank account?"
        description="Are you sure you want to permanently delete your bank account from your Wealthconomy account?"
        type="bank"
      />

      <RemoveConfirmationModal
        visible={!!cardToRemove}
        onClose={() => setCardToRemove(null)}
        onConfirm={handleRemoveCard}
        title="Card Removal Confirmation!"
        description={`Are you sure you want to remove card ending in ***${cards.find((c) => c.id === cardToRemove)?.lastFour || ""} from your payment methods? This action cannot be undone, and you will need to add a new card for future transactions.`}
        type="card"
      />
    </SafeAreaView>
  );
}
