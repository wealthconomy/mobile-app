import Header from "@/src/components/common/Header";
import { CardAddedModal } from "@/src/features/payment/components/PaymentModals";
import { AppDispatch } from "@/src/store";
import { addCard } from "@/src/store/slices/paymentSlice";
import { useRouter } from "expo-router";
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
import { useDispatch } from "react-redux";

export default function UseCardScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [pin, setPin] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    if (!cardNumber || !expiry || !cvv || !nameOnCard || !pin) return;

    dispatch(
      addCard({
        id: Math.random().toString(36).substr(2, 9),
        holderName: nameOnCard,
        lastFour: cardNumber.slice(-4),
        brand: cardNumber.startsWith("4") ? "visa" : "mastercard",
        isDefault: false,
      }),
    );
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Use Card" />

      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-[14px] text-[#6B7280] mb-8">
          Input your card details
        </Text>

        <View className="gap-y-6">
          {/* Card Number */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Card number
            </Text>
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                placeholder="Enter card number"
                placeholderTextColor="#9CA3AF"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={16}
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>

          {/* Expiry and CVV */}
          <View className="flex-row gap-x-4">
            <View className="flex-1">
              <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
                Expiry Date
              </Text>
              <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
                <TextInput
                  placeholder="MM / YY"
                  placeholderTextColor="#9CA3AF"
                  value={expiry}
                  onChangeText={setExpiry}
                  maxLength={5}
                  className="text-[15px] font-semibold text-[#111827]"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
                CVV
              </Text>
              <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
                <TextInput
                  placeholder="Enter Code"
                  placeholderTextColor="#9CA3AF"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  className="text-[15px] font-semibold text-[#111827]"
                />
              </View>
            </View>
          </View>

          {/* Name on Card */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Name on card
            </Text>
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                placeholder="Enter name on card"
                placeholderTextColor="#9CA3AF"
                value={nameOnCard}
                onChangeText={setNameOnCard}
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>

          {/* PIN */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Pin
            </Text>
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                placeholder="Enter card PIN"
                placeholderTextColor="#9CA3AF"
                value={pin}
                onChangeText={setPin}
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          className="mt-10 h-16 bg-[#155D5F] rounded-2xl items-center justify-center shadow-sm"
        >
          <Text className="text-white text-base font-bold">Confirm</Text>
        </TouchableOpacity>
      </ScrollView>

      <CardAddedModal
        visible={showSuccess}
        onClose={handleSuccessClose}
        onConfirm={handleSuccessClose}
        title="Card Added Successfully ✅"
        description="Your card has been successfully added to your Wealthconomy account. You can now use it for seamless transactions."
      />
    </SafeAreaView>
  );
}
