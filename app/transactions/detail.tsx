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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot, { captureRef } from "react-native-view-shot";
import { useGetWalletTransactionByIdQuery } from "@/src/store/api/walletApi";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const viewShotRef = useRef<ViewShot>(null);
  const [sharingImage, setSharingImage] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);

  const { data: transaction, isLoading } = useGetWalletTransactionByIdQuery(id as string, { skip: !id });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#155D5F" />
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
        <Header title="Transaction Detail" showBack={true} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#6B7280" }}>Transaction not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCredit = transaction.type === "CREDIT";

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const amountNum = parseFloat(val) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const formattedDate = new Date(transaction.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  
  const formattedTime = new Date(transaction.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getTitle = () => {
    if (transaction.description) return transaction.description;
    switch (transaction.reason) {
      case "WALLET_TOPUP": return "Wallet Topup";
      case "WITHDRAWAL": return "Withdrawal";
      case "REFERRAL_CREDIT": return "Referral Bonus";
      default: return transaction.reason;
    }
  };

  const getStatusColor = () => {
    return "#10B981"; // success color by default
  };

  const amountFormatted = formatAmount(transaction.amount);

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
              <h2 style="color: ${getStatusColor()};">${getTitle()}</h2>
              <p style="font-size: 24px;"><b>${isCredit ? "+" : "-"}₦${amountFormatted}</b></p>
              <p>Date: ${formattedDate} | ${formattedTime}</p>
              <hr style="border: 0.5px solid #E2E8F0; margin: 20px 0;">
              <p><b>Status:</b> Success</p>
              <p><b>Transaction ID:</b> ${transaction.id}</p>
              ${transaction.reference ? `<p><b>Reference:</b> ${transaction.reference}</p>` : ""}
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
            <View className="flex-row justify-between items-start">
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text className="text-[13px] font-bold mb-1" style={{ color: getStatusColor() }}>
                  {getTitle()}
                </Text>
                <Text className="text-[28px] font-bold text-[#323232]">
                  {isCredit ? "+" : "-"}₦{amountFormatted.split('.')[0]}<Text className="text-[#9CA3AF]">.{amountFormatted.split('.')[1]}</Text>
                </Text>
                <Text className="text-[#9CA3AF] text-[11px] mt-1">
                  {formattedDate} • {formattedTime}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
                <Image
                  source={require("../../assets/images/wealth.png")}
                  style={{ width: 84, height: 36, marginBottom: 12 }}
                  resizeMode="contain"
                />
                <View className="flex-row items-center border border-[#F59E0B] px-3 py-1.5 rounded-full">
                  <Ionicons
                    name="reader"
                    size={14}
                    color="#F59E0B"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-[#F59E0B] text-[11px] font-bold">
                    Receipt
                  </Text>
                </View>
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
                <Text className="text-[12px] font-bold text-[#4B5563] leading-[18px]">
                  {transaction.description || getTitle()}
                </Text>
              </View>

              <View className="gap-y-5">
                <DetailRow label="Status" value="Success" isSuccess />
                {transaction.reference && (
                  <DetailRow label="Reference" value={transaction.reference} />
                )}
                <DetailRow label="Transaction type" value={isCredit ? "Credit transaction" : "Debit transaction"} />
                <DetailRow label="Transaction ID" value={transaction.id} />
                <DetailRow label="Narrative" value={transaction.reason} />
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
            <Ionicons name="image-outline" size={20} color="#374151" />
            <Text className="text-[#374151] font-extrabold">
              {sharingImage ? "Sharing..." : "Share as Image"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSharePdf}
            disabled={sharingImage || sharingPdf}
            className="flex-1 bg-white border border-[#E5E7EB] h-14 rounded-2xl flex-row items-center justify-center gap-x-2"
          >
            <Ionicons name="document-text-outline" size={20} color="#374151" />
            <Text className="text-[#374151] font-extrabold">
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
    <Text className="text-[14px] text-[#4B5563] font-bold flex-1 mr-2">{label}</Text>
    <View className="flex-row items-center flex-1 justify-end">
      {isSuccess && (
        <Ionicons
          name="checkmark-circle"
          size={16}
          color="#10B981"
          className="mr-1.5"
        />
      )}
      <Text
        className={`text-[13px] font-bold text-right ${isSuccess ? "text-[#10B981]" : "text-[#323232]"}`}
      >
        {value}
      </Text>
    </View>
  </View>
);
