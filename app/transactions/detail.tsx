import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot, { captureRef } from "react-native-view-shot";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const viewShotRef = useRef<ViewShot>(null);
  const [sharingImage, setSharingImage] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);

  const handleShareImage = async () => {
    try {
      setSharingImage(true);
      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 0.8,
      });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing image:", error);
    } finally {
      setSharingImage(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      setSharingPdf(true);
      const html = `
        <html>
          <body style="padding: 40px; font-family: sans-serif;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #155D5F;">Transaction Receipt</h1>
              <p style="color: #64748B;">Wealthconomy Transaction Details</p>
            </div>
            <div style="background: #F8FAFC; padding: 20px; border-radius: 10px;">
              <h2 style="color: #10B981;">Withdrawal Successful</h2>
              <p style="font-size: 24px;"><b>₦68,000.00</b></p>
              <p>Date: April 12, 2023 | 03:05pm</p>
              <hr style="border: 0.5px solid #E2E8F0; margin: 20px 0;">
              <p><b>Status:</b> Success</p>
              <p><b>Account Credited:</b> 763482239292</p>
              <p><b>Sender:</b> Simon72357189</p>
              <p><b>Bank:</b> Win up Wallet</p>
              <p><b>Session ID:</b> 98237648905489789043597289021435794</p>
            </div>
            <div style="margin-top: 40px; text-align: center; color: #94A3B8;">
              <p>Thank you for using Wealthconomy</p>
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing PDF:", error);
    } finally {
      setSharingPdf(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8F9FA]">
      <StatusBar barStyle="dark-content" />
      <Header title="Transaction Detail" showBack={true} />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
      >
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
          {/* Receipt Header Card */}
          <View className="bg-white rounded-[30px] p-6 border border-[#E5E7EB] mb-6">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-[13px] font-bold text-[#10B981] mb-1">
                  Wealth Withdrawal
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
                  source={require("../../assets/images/wealth.png")}
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
                <DetailRow
                  label="Transaction type"
                  value="Credit transaction"
                />
                <DetailRow
                  label="SessionID"
                  value="98237648905489789043597289021435794"
                />
                <DetailRow label="Narrative" value="-" />
              </View>
            </View>
          </View>
        </ViewShot>

        {/* Action Buttons */}
        <View className="flex-row gap-x-4 mt-10">
          <TouchableOpacity
            onPress={handleShareImage}
            disabled={sharingImage || sharingPdf}
            className="flex-1 bg-white border border-[#E5E7EB] h-14 rounded-2xl flex-row items-center justify-center gap-x-2"
          >
            <Ionicons name="image-outline" size={20} color="#6B7280" />
            <Text className="text-[#6B7280] font-bold">
              {sharingImage ? "Sharing..." : "Share as Image"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSharePdf}
            disabled={sharingImage || sharingPdf}
            className="flex-1 bg-white border border-[#E5E7EB] h-14 rounded-2xl flex-row items-center justify-center gap-x-2"
          >
            <Ionicons name="document-text-outline" size={20} color="#6B7280" />
            <Text className="text-[#6B7280] font-bold">
              {sharingPdf ? "Sharing..." : "Share as Pdf"}
            </Text>
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
