import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8F9FA]">
      <StatusBar barStyle="dark-content" />
      <Header title="Transaction Detail" showBack={true} />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
      >
        {/* Receipt Header Card */}
        <View className="bg-white rounded-[30px] p-6 border border-[#E5E7EB] mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-[13px] font-bold text-[#10B981] mb-1">
                Money Sent
              </Text>
              <Text className="text-[32px] font-bold text-[#323232]">
                -₦68,000<Text className="text-[#9CA3AF]">.00</Text>
              </Text>
              <Text className="text-[#9CA3AF] text-[11px] mt-1">
                April 12, 2023 • 03:05pm
              </Text>
            </View>
            <View className="items-end">
              <Image
                source={require("../assets/images/wealth.png")}
                className="mb-8"
                style={{ width: 110, height: 49 }}
                resizeMode="contain"
              />
              <TouchableOpacity className="flex-row items-center border border-[#F59E0B] px-3 py-1.5 rounded-full">
                <Ionicons
                  name="reader"
                  size={14}
                  color="#F59E0B"
                  className="mr-1.5"
                />
                <Text className="text-[#F59E0B] text-[11px] font-bold">
                  Receipt
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Detailed Info Card */}
        <View className="bg-white rounded-[30px] border border-[#E5E7EB] overflow-hidden">
          <View className="p-5 border-b border-[#F3F4F6]">
            <Text className="text-[15px] font-bold text-[#323232]">
              Details
            </Text>
          </View>

          <View className="p-5">
            <View className="bg-[#F9FAFB] p-4 rounded-xl mb-6">
              <Text className="text-[11px] text-[#6B7280] leading-[16px]">
                98237648905489789043597289021435794Simonpeterjoshua
              </Text>
            </View>

            <View className="gap-y-5">
              <DetailRow label="Status" value="Success" isSuccess />
              <DetailRow label="Account credited" value="763482239292" />
              <DetailRow label="Sender" value="Simon72357189" />
              <DetailRow label="Originating bank" value="Win up Wallet" />
              <DetailRow label="Transaction type" value="Credit transaction" />
              <DetailRow
                label="SessionID"
                value="98237648905489789043597289021435794"
              />
              <DetailRow label="Narrative" value="-" />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-x-4 mt-10">
          <TouchableOpacity className="flex-1 bg-white border border-[#E5E7EB] h-14 rounded-2xl flex-row items-center justify-center gap-x-2">
            <Ionicons name="image-outline" size={20} color="#6B7280" />
            <Text className="text-[#6B7280] font-bold">Share as Image</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white border border-[#E5E7EB] h-14 rounded-2xl flex-row items-center justify-center gap-x-2">
            <Ionicons name="document-text-outline" size={20} color="#6B7280" />
            <Text className="text-[#6B7280] font-bold">Share as Pdf</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({
  label,
  value,
  isSuccess,
}: {
  label: string;
  value: string;
  isSuccess?: boolean;
}) => (
  <View className="flex-row justify-between items-center">
    <Text className="text-[13px] text-[#9CA3AF] font-medium">{label}</Text>
    <View className="flex-row items-center">
      {isSuccess && (
        <Ionicons
          name="checkmark-circle"
          size={16}
          color="#10B981"
          className="mr-1.5"
        />
      )}
      <Text
        className={`text-[13px] font-bold ${isSuccess ? "text-[#10B981]" : "text-[#323232]"}`}
      >
        {value}
      </Text>
    </View>
  </View>
);
