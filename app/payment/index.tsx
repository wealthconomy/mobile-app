import Header from "@/src/components/common/Header";
import { RemoveConfirmationModal } from "@/src/features/payment/components/PaymentModals";
import { AppDispatch, RootState } from "@/src/store";
import {
  removeBank,
  removeCard,
  setDefaultCard,
} from "@/src/store/slices/paymentSlice";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
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
import { Path, Svg } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

const BankSVG = ({
  width = 13,
  height = 14,
}: {
  width?: number;
  height?: number;
}) => (
  <Svg width={width} height={height} viewBox="0 0 13 14" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.43941 0.0956249L11.5692 2.96228C11.7198 3.03746 11.8464 3.15313 11.9349 3.2963C12.0234 3.43947 12.0702 3.60448 12.0701 3.77279V4.64184C12.0701 5.05825 11.7322 5.39622 11.3157 5.39622H10.8631V10.2243H11.4666C11.6267 10.2243 11.7802 10.2878 11.8934 10.401C12.0065 10.5142 12.0701 10.6677 12.0701 10.8278C12.0701 10.9878 12.0065 11.1413 11.8934 11.2545C11.7802 11.3677 11.6267 11.4313 11.4666 11.4313H0.603506C0.443446 11.4313 0.289942 11.3677 0.176763 11.2545C0.0635834 11.1413 0 10.9878 0 10.8278C0 10.6677 0.0635834 10.5142 0.176763 10.401C0.289942 10.2878 0.443446 10.2243 0.603506 10.2243H1.20701V5.39622H0.754382C0.337963 5.39622 0 5.05825 0 4.64184V3.77279C0 3.45776 0.162947 3.16807 0.426075 3.00392L5.63011 0.0956249C5.75583 0.0327397 5.89448 0 6.03506 0C6.17564 0 6.31368 0.0327397 6.43941 0.0956249ZM9.05259 5.39622H3.01753V10.2243H4.22454V6.60323H5.43155V10.2243H6.63856V6.60323H7.84558V10.2243H9.05259V5.39622ZM6.03506 2.37869C5.875 2.37869 5.72149 2.44227 5.60831 2.55545C5.49514 2.66863 5.43155 2.82213 5.43155 2.98219C5.43155 3.14225 5.49514 3.29576 5.60831 3.40894C5.72149 3.52212 5.875 3.5857 6.03506 3.5857C6.19512 3.5857 6.34862 3.52212 6.4618 3.40894C6.57498 3.29576 6.63856 3.14225 6.63856 2.98219C6.63856 2.82213 6.57498 2.66863 6.4618 2.55545C6.34862 2.44227 6.19512 2.37869 6.03506 2.37869Z"
      fill="#155D5F"
    />
  </Svg>
);

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
            {banks.length > 0 ? (
              banks.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  onPress={() =>
                    router.push({
                      pathname: "/payment/account-details",
                      params: { bankId: bank.id },
                    } as any)
                  }
                  activeOpacity={0.7}
                  className="bg-white p-4 rounded-2xl flex-row items-center border border-[#F3F4F6]"
                >
                  <View className="w-10 h-10 bg-[#EFF7F8] rounded-full items-center justify-center mr-4">
                    <BankSVG />
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
              ))
            ) : (
              <View className="py-8 items-center justify-center">
                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mb-4 shadow-sm border border-[#F3F4F6]">
                  <BankSVG width={24} height={26} />
                </View>
                <Text className="text-[14px] text-[#6B7280] text-center leading-[22px] px-4">
                  You don't have a bank account added. {"\n"}Click the button to
                  start.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/payment/add-bank" as any)}
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
            {cards.length > 0 ? (
              cards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  onPress={() =>
                    router.push({
                      pathname: "/payment/account-details",
                      params: { cardId: card.id },
                    } as any)
                  }
                  activeOpacity={0.7}
                  className="bg-white p-4 rounded-2xl flex-row items-center border border-[#F3F4F6]"
                >
                  <View className="w-10 h-10 bg-[#F9FAFB] rounded-xl items-center justify-center mr-4 border border-[#F3F4F6]">
                    {card.brand === "visa" ? (
                      <FontAwesome name="cc-visa" size={18} color="#1A1F71" />
                    ) : card.brand === "mastercard" ? (
                      <FontAwesome
                        name="cc-mastercard"
                        size={18}
                        color="#EB001B"
                      />
                    ) : (
                      <Ionicons
                        name="card"
                        size={20}
                        color={card.brand === "verve" ? "#009245" : "#6B7280"}
                      />
                    )}
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
                        onPress={(e) => {
                          e.stopPropagation();
                          dispatch(setDefaultCard(card.id));
                        }}
                        className="mr-4"
                      >
                        <Text className="text-[12px] font-bold text-[#6B7280]">
                          Make Default
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setCardToRemove(card.id);
                      }}
                      className="flex-row items-center"
                    >
                      <Text className="text-[12px] font-bold text-[#EF4444] mr-1.5">
                        Remove
                      </Text>
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-8 items-center justify-center">
                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mb-4 shadow-sm border border-[#F3F4F6]">
                  <Ionicons name="card-outline" size={24} color="#D1D5DB" />
                </View>
                <Text className="text-[14px] text-[#6B7280] text-center leading-[22px] px-4">
                  You don't have a card added. {"\n"}Click the button below to
                  start.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/payment/use-card" as any)}
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
