import Header from "@/src/components/common/Header";
import { TransferSuccessModal } from "@/src/features/payment/components/PaymentModals";
import { useContributeToGroupMutation } from "@/src/store/api/groupApi";
import { useTopUpPortfolioMutation } from "@/src/store/api/portfolioApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const {
    amount,
    bankName,
    accountNumber,
    name,
    action,
    targetId,
    targetName,
    returnUrl,
  } = useLocalSearchParams<{
    amount: string;
    bankName?: string;
    accountNumber?: string;
    name?: string;
    action?: string;
    targetId?: string;
    targetName?: string;
    returnUrl?: string;
  }>();

  const [pin, setPin] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const [verifyPin] = useVerifyPinMutation();
  const [contributeToGroup] = useContributeToGroupMutation();
  const [topUpPortfolio] = useTopUpPortfolioMutation();

  const numAmount = parseFloat(amount || "0");
  const formattedAmount = numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    // Auto-focus the input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handlePinChange = async (text: string) => {
    if (isProcessing) return;
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 4) {
      setPin(cleaned);
      if (cleaned.length === 4) {
        handleExecutePayment(cleaned);
      }
    }
  };

  const handleExecutePayment = async (enteredPin: string) => {
    setIsProcessing(true);
    try {
      // 1. Verify 4-digit PIN
      await verifyPin({ pin: enteredPin }).unwrap();

      const amountKobo = Math.round(numAmount * 100);

      // 2. Perform target action
      if (action === "GROUP_DEPOSIT" && targetId) {
        await contributeToGroup({
          id: targetId,
          body: { amount: amountKobo },
        }).unwrap();
      } else if ((action === "FAM_TOPUP" || action === "FLOW_TOPUP") && targetId) {
        await topUpPortfolio({
          id: targetId,
          body: { amount: amountKobo, source: "WALLET" },
        }).unwrap();
      }

      // 3. Show success
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("❌ [Payment Error]:", err);
      const msg =
        err?.data?.message ||
        err?.message ||
        "Transaction could not be completed. Please verify your PIN and wallet balance.";
      Alert.alert("Transaction Failed", msg);
      setPin("");
      inputRef.current?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    if (returnUrl) {
      router.replace(returnUrl as any);
    } else if (action === "GROUP_DEPOSIT" && targetId) {
      router.replace(`/portfolio/detail/group/${targetId}` as any);
    } else if (action === "FAM_TOPUP" && targetId) {
      router.replace(`/portfolio/detail/fam/${targetId}` as any);
    } else if (action === "FLOW_TOPUP" && targetId) {
      router.replace(`/portfolio/detail/flow/${targetId}` as any);
    } else {
      router.replace("/payment" as any);
    }
  };

  const getSuccessDescription = () => {
    if (action === "GROUP_DEPOSIT") {
      return `You have successfully deposited ₦${formattedAmount} from your wallet into ${targetName || "the tribe pool"}.`;
    }
    if (action === "FAM_TOPUP") {
      return `You have successfully topped up ₦${formattedAmount} from your wallet into your ${targetName || "Family"} pot.`;
    }
    if (action === "FLOW_TOPUP") {
      return `You have successfully topped up ₦${formattedAmount} from your wallet into your ${targetName || "WealthFlow"} savings goal.`;
    }
    return `Congratulations, WealthBuilder! You have successfully transferred ₦${formattedAmount} from your Wealth Flex account to ${name || ""} ${bankName || ""} Bank Account(${accountNumber || ""}).`;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="" />

      <View className="flex-1 px-8 pt-6 items-center">
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
        <Text className="text-[14px] text-[#6B7280] mb-8 text-center leading-[22px]">
          Please insert your 4-digit PIN to complete the transaction of{" "}
          <Text className="font-bold text-[#1A1A1A]">₦{formattedAmount}</Text>
        </Text>

        {/* Hidden TextInput for native keyboard */}
        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={handlePinChange}
          keyboardType="numeric"
          maxLength={4}
          editable={!isProcessing}
          secureTextEntry
          style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
          caretHidden
        />

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          className="flex-row gap-x-4 mb-8"
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

        {isProcessing && (
          <View className="flex-row items-center justify-center mb-6">
            <ActivityIndicator size="small" color="#155D5F" />
            <Text className="ml-2 text-[#155D5F] font-bold text-sm">
              Processing transaction...
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push("/profile/security/change-pin" as any)}
          style={{ borderBottomWidth: 1.5, borderBottomColor: "#155D5F", paddingBottom: 2 }}
        >
          <Text style={{ color: "#155D5F", fontWeight: "700", fontSize: 14 }}>
            Forgot your pin?
          </Text>
        </TouchableOpacity>
      </View>

      <TransferSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={handleSuccessConfirm}
        title={
          action === "GROUP_DEPOSIT"
            ? "Deposit Successful ✅"
            : action?.includes("TOPUP")
            ? "Top-Up Successful ✅"
            : "Funds Transferred Successfully ✅"
        }
        description={getSuccessDescription()}
      />
    </SafeAreaView>
  );
}
