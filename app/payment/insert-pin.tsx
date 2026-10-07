import Header from "@/src/components/common/Header";
import { TransferSuccessModal } from "@/src/features/payment/components/PaymentModals";
import {
  useContributeToGroupMutation,
  useWithdrawFromGroupMutation,
} from "@/src/store/api/groupApi";
import {
  useTerminatePortfolioMutation,
  useTopUpPortfolioMutation,
  useWithdrawToWalletMutation,
  useTransferPortfolioFundsMutation,
} from "@/src/store/api/portfolioApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { saveSingleCompletedPortfolio } from "@/src/store/slices/completedPortfolioSlice";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#155D5F";
const TEXT_DARK = "#1A1A1A";

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
    destinationId,
    destinationName,
    returnUrl,
  } = useLocalSearchParams<{
    amount: string;
    bankName?: string;
    accountNumber?: string;
    name?: string;
    action?: string;
    targetId?: string;
    targetName?: string;
    destinationId?: string;
    destinationName?: string;
    returnUrl?: string;
  }>();

  const dispatch = useDispatch();
  const [pin, setPin] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const [verifyPin] = useVerifyPinMutation();
  const [contributeToGroup] = useContributeToGroupMutation();
  const [withdrawFromGroup] = useWithdrawFromGroupMutation();
  const [topUpPortfolio] = useTopUpPortfolioMutation();
  const [withdrawToWallet] = useWithdrawToWalletMutation();
  const [terminatePortfolio] = useTerminatePortfolioMutation();
  const [transferPortfolioFunds] = useTransferPortfolioFundsMutation();

  const numAmount = parseFloat(amount || "0");
  const formattedAmount = numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isProcessing && !showSuccessModal) {
        inputRef.current?.focus();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handlePinChange = (text: string) => {
    if (isProcessing) return;
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 4);
    setPin(cleaned);
    if (cleaned.length === 4) {
      Keyboard.dismiss();
      inputRef.current?.blur();
      handleExecutePayment(cleaned);
    }
  };

  const handleExecutePayment = async (enteredPin: string) => {
    Keyboard.dismiss();
    inputRef.current?.blur();
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
      } else if (action === "GROUP_WITHDRAW" && targetId) {
        await withdrawFromGroup({
          id: targetId,
          body: { amount: amountKobo },
        }).unwrap();
      } else if (
        (action === "FAM_TOPUP" ||
          action === "FLOW_TOPUP" ||
          action === "GOAL_TOPUP" ||
          action === "FIX_TOPUP") &&
        targetId
      ) {
        const portfolioType =
          action === "FAM_TOPUP"
            ? "wealthfam"
            : action === "FLOW_TOPUP"
            ? "wealthflow"
            : action === "FIX_TOPUP"
            ? "wealthfix"
            : "wealthgoal";

        await topUpPortfolio({
          id: targetId,
          type: portfolioType,
          body: { amount: amountKobo, source: "WALLET" },
        }).unwrap();
      } else if (
        (action === "PORTFOLIO_WITHDRAW" ||
          action?.endsWith("_WITHDRAW") ||
          action === "WITHDRAW_TO_WALLET") &&
        targetId
      ) {
        const portfolioType =
          action?.includes("FAM")
            ? "wealthfam"
            : action?.includes("FLOW")
            ? "wealthflow"
            : action?.includes("FIX")
            ? "wealthfix"
            : action?.includes("GOAL")
            ? "wealthgoal"
            : undefined;

        await withdrawToWallet({
          id: targetId,
          type: portfolioType,
          body: { amount: amountKobo, pin: enteredPin },
        }).unwrap();
      } else if (
        (action === "FAM_TERMINATE" ||
          action === "FLOW_TERMINATE" ||
          action === "FIX_TERMINATE" ||
          action === "GOAL_TERMINATE" ||
          action?.endsWith("_TERMINATE") ||
          action === "PORTFOLIO_TERMINATE") &&
        targetId
      ) {
        const portfolioType =
          action === "FAM_TERMINATE"
            ? "wealthfam"
            : action === "FLOW_TERMINATE"
            ? "wealthflow"
            : action === "FIX_TERMINATE"
            ? "wealthfix"
            : action === "GOAL_TERMINATE"
            ? "wealthgoal"
            : undefined;

        await terminatePortfolio({
          id: targetId,
          type: portfolioType,
          body: { pin: enteredPin },
        }).unwrap();
      } else if (action === "TRANSFER_PORTFOLIO" && targetId && destinationId) {
        await transferPortfolioFunds({
          id: targetId,
          body: {
            amount: amountKobo,
            destinationType: "PORTFOLIO",
            destinationId,
            pin: enteredPin,
          },
        }).unwrap();
      } else if (action === "TRANSFER_BANK" && targetId && destinationId) {
        await transferPortfolioFunds({
          id: targetId,
          body: {
            amount: amountKobo,
            destinationType: "BANK",
            destinationId,
            pin: enteredPin,
          },
        }).unwrap();
      }

      // 3. Save completed/withdrawn/terminated plan to Redux & AsyncStorage (for individual portfolios only, NOT shared groups)
      if (targetId && action !== "GROUP_WITHDRAW" && (action?.includes("WITHDRAW") || action?.includes("TERMINATE"))) {
        dispatch(
          saveSingleCompletedPortfolio({
            id: targetId,
            name: targetName || "Completed Plan",
            balance: "0",
            targetAmount: (numAmount * 100).toString(),
            status: action?.includes("TERMINATE") ? "TERMINATED" : "COMPLETED",
            maturityDate: new Date().toISOString(),
            type: action?.includes("FAM")
              ? "wealthfam"
              : action?.includes("FLOW")
              ? "wealthflow"
              : action?.includes("FIX")
              ? "wealthfix"
              : "wealthgoal",
            metadata: {
              category: targetName || "Completed",
            },
          } as any)
        );
      }

      // 4. Show success
      Keyboard.dismiss();
      inputRef.current?.blur();
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("❌ [Payment Error]:", err);
      const rawMsg = err?.data?.message;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(", ")
        : rawMsg ||
          err?.message ||
          "Transaction could not be completed. Please verify your PIN and wallet balance.";
      Alert.alert("Transaction Failed", msg);
      setPin("");
      inputRef.current?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBiometricAuth = () => {
    Alert.alert(
      "Biometric Authentication",
      "Please enter your 4-digit transaction PIN to proceed securely.",
      [{
        text: "OK",
        onPress: () => {
          if (!isProcessing && !showSuccessModal) {
            inputRef.current?.focus();
          }
        },
      }]
    );
  };

  const handleSuccessConfirm = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
    setShowSuccessModal(false);

    // Wait for native modal to dismiss on iOS before triggering the navigation transition
    setTimeout(() => {
      // 1. If returnUrl is provided, return directly to the originating plan page
      if (returnUrl) {
        router.replace(returnUrl as any);
        return;
      }

      // 2. If targetId exists, navigate directly to that plan's detail page
      if (targetId) {
        if (action?.includes("FAM")) {
          router.replace(`/portfolio/detail/fam/${targetId}` as any);
          return;
        }
        if (action?.includes("FLOW")) {
          router.replace(`/portfolio/detail/flow/${targetId}` as any);
          return;
        }
        if (action?.includes("GOAL")) {
          router.replace(`/portfolio/detail/goal/${targetId}` as any);
          return;
        }
        if (action?.includes("FIX")) {
          router.replace(`/portfolio/detail/fix/${targetId}` as any);
          return;
        }
        if (action?.includes("GROUP")) {
          router.replace(`/portfolio/detail/group/${targetId}` as any);
          return;
        }
      }

      // 3. Category tab fallback
      if (action?.includes("FLOW")) {
        router.replace("/(tabs)/portfolios/wealth-flow" as any);
      } else if (action?.includes("FIX")) {
        router.replace("/(tabs)/portfolios/wealth-fix" as any);
      } else if (action?.includes("GOAL")) {
        router.replace("/(tabs)/portfolios/wealth-goal" as any);
      } else if (action?.includes("GROUP")) {
        router.replace("/(tabs)/portfolios/wealth-group" as any);
      } else {
        router.replace("/(tabs)/portfolios/wealth-fam" as any);
      }
    }, 250);
  };

  const getSubtitle = () => {
    if (action === "GROUP_DEPOSIT") {
      return `Enter your transaction PIN to confirm deposit of ₦${formattedAmount} into ${targetName || "the tribe pool"}.`;
    }
    if (action === "FAM_TOPUP") {
      return `Enter your transaction PIN to confirm top-up of ₦${formattedAmount} into your ${targetName || "Family"} pot.`;
    }
    if (action === "FLOW_TOPUP") {
      return `Enter your transaction PIN to confirm top-up of ₦${formattedAmount} into your ${targetName || "WealthFlow"} savings goal.`;
    }
    if (action === "FAM_WITHDRAW" || action === "FLOW_WITHDRAW" || action?.endsWith("_WITHDRAW")) {
      return `Enter your transaction PIN to confirm withdrawal of ₦${formattedAmount} from ${targetName || "your plan"} to your wallet.`;
    }
    if (
      action === "FAM_TERMINATE" ||
      action === "FLOW_TERMINATE" ||
      action === "FIX_TERMINATE" ||
      action === "GOAL_TERMINATE"
    ) {
      return `Enter your transaction PIN to terminate ${targetName || "your plan"} and transfer accumulated funds to your wallet.`;
    }
    if (action === "TRANSFER_PORTFOLIO") {
      return `Enter your transaction PIN to confirm transfer of ₦${formattedAmount} to ${destinationName || "target portfolio"}.`;
    }
    if (action === "TRANSFER_BANK") {
      return `Enter your transaction PIN to confirm transfer of ₦${formattedAmount} to ${destinationName || "bank account"}.`;
    }
    return `Please insert your 4-digit transaction PIN to complete the transaction of ₦${formattedAmount}.`;
  };

  const getSuccessDescription = () => {
    if (
      action === "FAM_TERMINATE" ||
      action === "FLOW_TERMINATE" ||
      action === "FIX_TERMINATE" ||
      action === "GOAL_TERMINATE"
    ) {
      return `Your plan ${targetName ? `"${targetName}"` : ""} has been terminated successfully and the remaining funds have been transferred to your Main Wallet.`;
    }
    if (
      action === "PORTFOLIO_WITHDRAW" ||
      action?.endsWith("_WITHDRAW") ||
      action === "WITHDRAW_TO_WALLET"
    ) {
      return `Congratulations, WealthBuilder! You have successfully withdrawn ₦${formattedAmount} from ${targetName || "your plan"} into your Main Wallet.`;
    }
    if (action === "GROUP_DEPOSIT") {
      return `You have successfully deposited ₦${formattedAmount} from your wallet into ${targetName || "the tribe pool"}.`;
    }
    if (action === "FAM_TOPUP") {
      return `You have successfully topped up ₦${formattedAmount} from your wallet into your ${targetName || "Family"} pot.`;
    }
    if (action === "FLOW_TOPUP") {
      return `You have successfully topped up ₦${formattedAmount} from your wallet into your ${targetName || "WealthFlow"} savings goal.`;
    }
    if (action === "GOAL_TOPUP") {
      return `You have successfully topped up ₦${formattedAmount} from your wallet into your ${targetName || "WealthGoal"}.`;
    }
    if (action === "TRANSFER_PORTFOLIO") {
      return `Successfully transferred ₦${formattedAmount} to ${destinationName || "target portfolio"}.`;
    }
    if (action === "TRANSFER_BANK") {
      return `Successfully transferred ₦${formattedAmount} to ${destinationName || "bank account"}.`;
    }
    return `Congratulations, WealthBuilder! You have successfully transferred ₦${formattedAmount} from your Wealth Flex account to ${name || ""} ${bankName || ""} Bank Account(${accountNumber || ""}).`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <Header title="" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* Top Graphic */}
        <Image
          source={require("@/assets/images/change-pin.png")}
          style={{ width: 120, height: 120, marginBottom: 16 }}
          resizeMode="contain"
        />

        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            color: TEXT_DARK,
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Insert your Pin
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 13,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 36,
            lineHeight: 20,
            paddingHorizontal: 12,
          }}
        >
          {getSubtitle()}
        </Text>

        {/* 4-Box PIN Display */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (!isProcessing && !showSuccessModal) {
              inputRef.current?.focus();
            }
          }}
          style={{ flexDirection: "row", gap: 16, marginBottom: 32 }}
        >
          {[0, 1, 2, 3].map((i) => {
            const hasDigit = pin.length > i;
            return (
              <View
                key={i}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  backgroundColor: hasDigit ? "#EFF7F8" : "#F8F8F8",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: hasDigit ? TEAL : "#E5E5E5",
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: TEAL,
                  }}
                >
                  {hasDigit ? "●" : ""}
                </Text>
              </View>
            );
          })}
        </TouchableOpacity>

        {/* Hidden TextInput */}
        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={handlePinChange}
          keyboardType="numeric"
          maxLength={4}
          editable={!isProcessing && !showSuccessModal}
          secureTextEntry
          style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
          caretHidden
        />

        {isProcessing && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <ActivityIndicator size="small" color={TEAL} />
            <Text
              style={{
                marginLeft: 8,
                color: TEAL,
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              Processing transaction...
            </Text>
          </View>
        )}

        {/* Forgot Pin Helper */}
        <TouchableOpacity
          onPress={() => router.push("/profile/security/change-pin" as any)}
          style={{ marginBottom: 36, paddingHorizontal: 16 }}
        >
          <Text
            style={{
              color: "#6B7280",
              textAlign: "center",
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            If you have forgotten your pin,{" "}
            <Text style={{ color: TEAL, fontWeight: "700" }}>
              change it from your settings page
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Biometric Fingerprint Button */}
        <TouchableOpacity
          style={{ alignItems: "center", marginBottom: 20 }}
          onPress={handleBiometricAuth}
          activeOpacity={0.7}
        >
          <Ionicons name="finger-print" size={38} color={TEAL} />
          <Text
            style={{
              color: TEAL,
              fontWeight: "700",
              fontSize: 14,
              marginTop: 8,
            }}
          >
            Use fingerprint
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <TransferSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessConfirm}
        onConfirm={handleSuccessConfirm}
        title={
          action === "GROUP_DEPOSIT"
            ? "Deposit Successful ✅"
            : action?.includes("TOPUP")
            ? "Top-Up Successful ✅"
            : action?.includes("TERMINATE")
            ? "Plan Terminated Successfully ✅"
            : "Withdrawal Successful ✅"
        }
        description={getSuccessDescription()}
      />
    </SafeAreaView>
  );
}
