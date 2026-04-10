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

export default function VerifyAddressScreen() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Verify Address" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-6 mb-8">
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Add Your Location
            </Text>
            <View className="relative">
              <TextInput
                placeholder="Enter your Address"
                placeholderTextColor="#9CA3AF"
                className="bg-[#F8F9FA] h-14 rounded-2xl pl-4 pr-12 text-[15px] font-semibold text-[#323232] border border-[#F0F0F0]"
                value={address}
                onChangeText={setAddress}
              />
              <TouchableOpacity className="absolute right-4 top-4">
                <Ionicons name="locate-outline" size={20} color="#155D5F" />
              </TouchableOpacity>
            </View>
          </View>

          <View
            className="bg-[#F2FFFF] p-5 rounded-[15px] border border-[#2FB0B5] mb-12 self-center justify-center"
            style={{ width: 364, height: 104 }}
          >
            <Text className="text-[14px] font-bold text-[#155D5F] mb-1">
              Why we need your Address?
            </Text>
            <Text className="text-[11px] text-[#155D5F] leading-[16px]">
              In line with Central Bank of Nigeria (CBN) guidelines, we need
              your address to verify your account. This process is essential for
              fraud prevention and to maintain the highest level of security for
              your funds.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-[#155D5F] h-14 rounded-2xl items-center justify-center"
          >
            <Text className="text-white text-base font-bold">Confirm</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-5">
          <View className="bg-white rounded-[32px] w-full p-8 items-center max-w-[340px]">
            <View className="w-20 h-20 bg-[#E7F5F5] rounded-full items-center justify-center mb-6">
              <Image
                source={require("../../../assets/images/address_added.png")}
                className="w-12 h-12"
                resizeMode="contain"
              />
            </View>

            <Text className="text-[20px] font-extrabold text-[#323232] mb-3 text-center">
              Address Verified ✅
            </Text>

            <Text className="text-[13px] text-[#6B7280] text-center leading-[20px] mb-8">
              Great news! Your address has been successfully verified. Your
              account is now fully compliant and secure.
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
