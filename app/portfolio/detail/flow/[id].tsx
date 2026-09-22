import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import {
  KeyboardDoneAccessory,
  KEYBOARD_ACCESSORY_ID,
} from "@/src/components/common/KeyboardDoneAccessory";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import {
  useGetPortfoliosQuery,
  useGetPortfolioTransactionsQuery,
  useTerminatePortfolioMutation,
  useTopUpPortfolioMutation,
  useWithdrawToWalletMutation,
  useGetPortfolioConfigQuery,
} from "@/src/store/api/portfolioApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import { useGetSystemConfigsQuery } from "@/src/store/api/groupApi";
import {
  getCleanTransactionTitle,
  getPortfolioZeroBalanceBannerInfo,
  formatEarlyTerminationPenaltyRate,
  getDynamicPenaltyRate,
  getDynamicInterestRateLabel,
  isPortfolioCompleted,
} from "@/src/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import {
  saveSingleCompletedPortfolio,
  removeCompletedPortfolio,
} from "@/src/store/slices/completedPortfolioSlice";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppRefreshIndicator } from "@/src/components/common/AppRefreshIndicator";
import ManageFundsSheet from "@/src/components/portfolio/ManageFundsSheet";
import { BlurView } from "expo-blur";
import ConfirmActionModal from "@/src/components/common/ConfirmActionModal";

const THEME_BLUE = "#D5EDFF";
const TEAL = "#0B575B";
const TEAL_LIGHT = "#E0F2F1";
const TEXT_DARK = "#1A1A1A";

const SCREEN_OPTIONS = { headerShown: false } as const;

export default function FlowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Modals state
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showConfirmTopUpModal, setShowConfirmTopUpModal] = useState(false);
  const [showManageFundsModal, setShowManageFundsModal] = useState(false);
  const [showTopUpPinModal, setShowTopUpPinModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  // Form states for modals
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpSource, setTopUpSource] = useState<"WALLET" | "CARD">("WALLET");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [actionPin, setActionPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const dispatch = useDispatch();
  const handleBack = useCallback(() => router.back(), []);

  // Queries & Mutations
  const { data, isLoading: loading, refetch: refetchFlow } = useGetPortfoliosQuery({ type: "wealthflow" });
  const { data: configData } = useGetPortfolioConfigQuery();
  const { data: systemConfigData } = useGetSystemConfigsQuery();
  const rates = configData?.rates || (configData as any)?.data?.rates;
  const { penaltyRate, penaltyRatio } = getDynamicPenaltyRate(
    "flow",
    systemConfigData,
    rates,
    "2.5%"
  );
  const flowInterestRateLabel = getDynamicInterestRateLabel(
    "flow",
    systemConfigData,
    rates,
    10
  );
  const { data: walletSummary, refetch: refetchWallet } = useGetWalletSummaryQuery();
  const walletBalance = (parseFloat(walletSummary?.currentBalance || "0")) / 100;

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchFlow(), refetchTxns(), refetchWallet()]);
    } finally {
      setRefreshing(false);
    }
  };
  const { data: txnsData, isLoading: txnsLoading, refetch: refetchTxns } = useGetPortfolioTransactionsQuery(
    { id: id as string },
    { skip: !id, refetchOnMountOrArgChange: true }
  );

  useFocusEffect(
    useCallback(() => {
      refetchFlow();
      refetchTxns();
      refetchWallet();
    }, [refetchFlow, refetchTxns, refetchWallet])
  );

  const [topUpPortfolio] = useTopUpPortfolioMutation();
  const [withdrawToWallet] = useWithdrawToWalletMutation();
  const [terminatePortfolio] = useTerminatePortfolioMutation();
  const [verifyPin] = useVerifyPinMutation();

  const savedCompletedPlan = useSelector((state: RootState) =>
    id ? state.completedPortfolio.completedMap[id as string] : undefined
  );
  const allPlans = data?.items || [];
  const fetchedPlan = allPlans.find((p) => p.id === id);
  const lastPlanRef = useRef(fetchedPlan);
  if (fetchedPlan) {
    lastPlanRef.current = fetchedPlan;
  }
  const plan = fetchedPlan || savedCompletedPlan || lastPlanRef.current;
  const flow = plan;

  const isTransferredOrWithdrawnInTxns = Boolean(
    txnsData?.items?.some((t) => {
      const type = (t.type || "").toUpperCase();
      const ref = (t.reference || "").toUpperCase();
      const action = ((t as any).action || "").toUpperCase();
      const reason = ((t as any).reason || "").toUpperCase();
      const desc = ((t as any).description || "").toUpperCase();
      return (
        type === "DEBIT" ||
        type.includes("DEBIT") ||
        type.includes("WITHDRAW") ||
        type.includes("TRANSFER") ||
        ref.includes("WITHDRAW") ||
        ref.includes("TRANSFER") ||
        action.includes("WITHDRAW") ||
        action.includes("TRANSFER") ||
        reason.includes("WITHDRAW") ||
        reason.includes("TRANSFER") ||
        desc.includes("WITHDRAW") ||
        desc.includes("TRANSFER")
      );
    })
  );

  const isCompleted =
    plan?.status === "COMPLETED" ||
    plan?.status === "TERMINATED" ||
    plan?.status === "WITHDRAWN" ||
    (plan?.maturityDate && new Date(plan.maturityDate).getTime() <= Date.now());

  const isFullyWithdrawn =
    plan?.status === "WITHDRAWN" ||
    parseFloat(plan?.balance || "0") <= 0 ||
    (isCompleted && isTransferredOrWithdrawnInTxns);

  const displayBalance = isFullyWithdrawn ? "0" : plan?.balance || "0";
  const hasRemainingBalance = !isFullyWithdrawn && parseFloat(displayBalance) > 0;

  useEffect(() => {
    if (isFullyWithdrawn) {
      if (savedCompletedPlan && (savedCompletedPlan.balance !== "0" || savedCompletedPlan.status !== "WITHDRAWN")) {
        dispatch(
          saveSingleCompletedPortfolio({
            ...savedCompletedPlan,
            type: savedCompletedPlan.type || "wealthflow",
            balance: "0",
            status: "WITHDRAWN",
          })
        );
      }
      return;
    }
    if (!fetchedPlan) return;
    const isMatured =
      fetchedPlan.maturityDate &&
      new Date(fetchedPlan.maturityDate).getTime() <= Date.now();
    const isCompletedOrTerminated =
      fetchedPlan.status === "COMPLETED" ||
      fetchedPlan.status === "TERMINATED" ||
      fetchedPlan.status === "WITHDRAWN" ||
      isMatured;

    if (isCompletedOrTerminated) {
      const targetStatus =
        fetchedPlan.status === "TERMINATED" ? "TERMINATED" : "COMPLETED";
      if (
        !savedCompletedPlan ||
        savedCompletedPlan.status !== targetStatus ||
        savedCompletedPlan.balance !== fetchedPlan.balance
      ) {
        dispatch(saveSingleCompletedPortfolio({
          ...fetchedPlan,
          type: fetchedPlan.type || "wealthflow",
        }));
      }
    } else if (savedCompletedPlan) {
      // If plan is active on backend, ensure it's not stored in completedMap
      dispatch(removeCompletedPortfolio(fetchedPlan.id));
    }
  }, [
    isFullyWithdrawn,
    fetchedPlan?.id,
    fetchedPlan?.status,
    fetchedPlan?.balance,
    fetchedPlan?.maturityDate,
    savedCompletedPlan?.status,
    savedCompletedPlan?.balance,
    dispatch,
  ]);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["top"]}
      >
        <StatusBar style="dark" />
        <Stack.Screen options={SCREEN_OPTIONS} />
        <Header title="Review" onBack={handleBack} />
        <PortfolioDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
        edges={["top"]}
      >
        <Stack.Screen options={SCREEN_OPTIONS} />
        <Header title="Review" onBack={handleBack} />
        <Text style={{ color: "#6B7280", marginTop: 20 }}>Plan not found</Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/portfolios/wealth-flow")}
          style={{ marginTop: 16, backgroundColor: TEAL, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const zeroBalanceBanner = getPortfolioZeroBalanceBannerInfo(txnsData?.items);

  const progress = parseFloat(plan.targetAmount) > 0 ? parseFloat(displayBalance) / parseFloat(plan.targetAmount) : 0;
  const progressPct = Math.round(Math.min(progress * 100, 100));

  const getDaysLeft = () => {
    const end = new Date(plan.maturityDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 3600 * 24));
  };
  
  const formattedDate = new Date(plan.maturityDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formatAmount = (val?: string) => {
    if (!val) return "0.00";
    const amountNum = Math.abs(parseFloat(val)) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const handleWithdrawSubmit = async () => {
    const num = parseFloat(withdrawAmount.replace(/,/g, ""));
    if (!num || num <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid withdrawal amount.");
      return;
    }
    if (actionPin.length !== 4) {
      Alert.alert("PIN Required", "Please enter your 4-digit transaction PIN.");
      return;
    }

    setIsProcessing(true);
    try {
      const amountKobo = Math.round(num * 100);
      const payload = {
        amount: amountKobo,
        pin: actionPin,
      };

      console.log(`🏎️ [WealthFlow Withdraw Request] POST /api/v1/portfolios/${plan.id}/withdraw-to-wallet:`, payload);
      const res = await withdrawToWallet({ id: plan.id, type: "wealthflow", body: payload }).unwrap();
      console.log("✅ [WealthFlow Withdraw Success] Response:", res);

      Alert.alert("Withdrawal Successful", `Successfully transferred ₦${num.toLocaleString()} to your main wallet.`);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setActionPin("");
      refetchFlow();
    } catch (err: any) {
      console.error("❌ [WealthFlow Withdraw Error]:", err);
      const message = err?.data?.message || err?.message || "Failed to withdraw funds. Please check your PIN and balance.";
      Alert.alert("Withdrawal Failed", message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTerminateSubmit = async () => {
    if (actionPin.length !== 4) {
      Alert.alert("PIN Required", "Please enter your 4-digit transaction PIN to confirm termination.");
      return;
    }

    setIsProcessing(true);
    try {
      console.log(`🏎️ [WealthFlow Terminate Request] POST /api/v1/portfolios/${plan.id}/terminate`);
      const res = await terminatePortfolio({ id: plan.id, body: { pin: actionPin } }).unwrap();
      console.log("✅ [WealthFlow Terminate Success] Response:", res);

      Alert.alert("Portfolio Terminated", "Your WealthFlow plan has been closed and funds returned to your wallet.");
      setShowTerminateModal(false);
      setActionPin("");
      router.replace("/(tabs)/portfolios/wealth-flow");
    } catch (err: any) {
      console.error("❌ [WealthFlow Terminate Error]:", err);
      const message = err?.data?.message || err?.message || "Failed to terminate portfolio. Please verify your PIN.";
      Alert.alert("Termination Failed", message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── ONGOING HEADER ──────────────────────────────────────────────────────
  const renderOngoingHeader = () => (
    <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text
            style={{
              color: "#1A1A1A",
              fontWeight: "800",
              fontSize: 24,
              marginBottom: 4,
            }}
          >
            {plan.name}
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}>
            {plan.metadata?.wealthPreference || "WealthFlow"}
          </Text>
          <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 28 }}>
            ₦{formatAmount(displayBalance)}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>
            of ₦{formatAmount(plan.targetAmount)} target
          </Text>
        </View>
        <Image
          source={require("../../../../assets/images/auto.png.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>

      <View style={{ width: "100%" }}>
        <View
          style={{
            height: 10,
            borderRadius: 20,
            backgroundColor: THEME_BLUE,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: `${Math.max(progressPct, 2)}%`,
              height: 10,
              borderRadius: 20,
              backgroundColor: "#0EA5E9",
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <Text style={{ color: "#9CA3AF", fontSize: 13, fontWeight: "500" }}>
            {progressPct}%
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13, fontWeight: "500" }}>
            {getDaysLeft()} days Left
          </Text>
        </View>
      </View>

      <View
        style={{ height: 1, backgroundColor: "#EEEEEE", marginBottom: 28 }}
      />
    </View>
  );

  // ─── COMPLETED HEADER ────────────────────────────────────────────────────
  const renderCompletedHeader = () => (
    <View
      style={{ alignItems: "center", paddingHorizontal: 20, marginBottom: 28 }}
    >
      <View
        style={{
          width: 220,
          height: 220,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Image
          source={require("../../../../assets/images/success.png")}
          style={{
            width: 220,
            height: 220,
            position: "absolute",
            opacity: 0.3,
          }}
          resizeMode="contain"
        />
        <Image
          source={require("../../../../assets/images/auto1.png")}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Text style={{ fontSize: 24, marginRight: 8 }}>🏆</Text>
        <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 26 }}>
          Flow Save Completed!
        </Text>
        <Text style={{ fontSize: 24, marginLeft: 8 }}>🥳</Text>
      </View>

      <Text
        style={{
          color: "#6B7280",
          textAlign: "center",
          fontSize: 14,
          lineHeight: 22,
          paddingHorizontal: 16,
        }}
      >
        Your{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>WealthFlow</Text>{" "}
        plan for{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          {plan.name}
        </Text>{" "}
        has matured.{"\n"}
        Total Accumulated Balance:{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>₦{formatAmount(displayBalance)}</Text>
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={SCREEN_OPTIONS} />
      <Header
        title="Review"
        onBack={handleBack}
        rightElement={
          hasRemainingBalance ? (
            <TouchableOpacity
              onPress={() => setShowOverflowMenu(true)}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          ) : null
        }
      />

      <AppRefreshIndicator refreshing={refreshing} topOffset={65} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={["transparent"]}
          />
        }
      >
        <View style={{ paddingTop: 8, paddingBottom: 40 }}>
          {isCompleted ? renderCompletedHeader() : renderOngoingHeader()}

          <View
            style={{
              backgroundColor: "#F6F6F6",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 28,
              marginHorizontal: 20,
            }}
          >
            {/* Row 1: Title & Target Amount */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Title</Text>
                <Text style={styles.value}>{plan.name}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Target Amount</Text>
                <Text style={styles.value}>₦{formatAmount(plan.targetAmount)}</Text>
              </View>
            </View>

            {/* Row 2: Current Balance & Interest */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Current Balance</Text>
                <Text style={styles.value}>₦{formatAmount(displayBalance)}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Interest Rate</Text>
                <Text style={styles.value}>{plan.interestRate ? `${plan.interestRate}% P.A` : flowInterestRateLabel}</Text>
              </View>
            </View>

            {/* Row 3: Status & End Date */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Status</Text>
                <Text style={[styles.value, { color: isCompleted || plan.status === "COMPLETED" ? "#10B981" : TEAL }]}>
                  {isCompleted ? "COMPLETED" : (plan.status || "ACTIVE")}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Maturity Date</Text>
                <Text style={styles.value}>{formattedDate}</Text>
              </View>
            </View>

            {/* Row 4: Preference & Source */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Preference</Text>
                <Text style={styles.value}>{plan.metadata?.wealthPreference || "Interest Based"}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Funding Source</Text>
                <Text style={styles.value}>Main Wallet</Text>
              </View>
            </View>

            {/* Jagged Edge */}
            <View
              style={{
                flexDirection: "row",
                position: "absolute",
                bottom: -10,
                left: 0,
                right: 0,
                overflow: "hidden",
              }}
            >
              {Array.from({ length: 40 }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "white",
                    transform: [{ rotate: "45deg" }],
                    marginTop: 4,
                  }}
                />
              ))}
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: "#EEEEEE",
              marginTop: 12,
              marginBottom: 24,
              marginHorizontal: 20,
            }}
          />

          {/* Action Buttons */}
          <View style={{ paddingHorizontal: 20 }}>
            {!isCompleted ? (
              <ThemedButton
                title="TopUp Wealth"
                onPress={() => setShowTopUpModal(true)}
                style={{
                  backgroundColor: TEAL,
                  borderRadius: 14,
                  height: 56,
                }}
              />
            ) : hasRemainingBalance ? (
              <ThemedButton
                title="Withdraw All to Wallet"
                onPress={() => setShowWithdrawModal(true)}
                style={{
                  backgroundColor: TEAL,
                  borderRadius: 14,
                  height: 56,
                }}
              />
            ) : (
              <View
                style={{
                  backgroundColor: "#F0FDF4",
                  borderWidth: 1,
                  borderColor: "#BBF7D0",
                  borderRadius: 16,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={26}
                  color="#15803D"
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={{
                    color: "#166534",
                    fontWeight: "800",
                    fontSize: 15,
                    marginBottom: 2,
                  }}
                >
                  {zeroBalanceBanner.title}
                </Text>
                <Text
                  style={{
                    color: "#15803D",
                    fontSize: 12,
                    textAlign: "center",
                    lineHeight: 18,
                  }}
                >
                  {zeroBalanceBanner.subtitle}
                </Text>
              </View>
            )}
          </View>

          {/* Transactions Section */}
          <View style={{ marginTop: 32, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: TEXT_DARK, marginBottom: 14 }}>
              Recent Activity
            </Text>

            {txnsLoading ? (
              <ActivityIndicator size="small" color={TEAL} style={{ marginVertical: 20 }} />
            ) : (txnsData?.items && txnsData.items.length > 0) ? (
              txnsData.items.map((txn) => (
                <View
                  key={txn.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F4F6",
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontWeight: "700", color: TEXT_DARK, fontSize: 14 }}>
                      {getCleanTransactionTitle(txn, plan?.name)}
                    </Text>
                    <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>
                      {new Date(txn.createdAt).toLocaleDateString()} • {txn.reference}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontWeight: "800",
                      fontSize: 15,
                      color: txn.type?.toLowerCase().includes("debit") || txn.type?.toLowerCase().includes("withdraw") ? "#E53935" : TEAL,
                    }}
                  >
                    {txn.type?.toLowerCase().includes("debit") || txn.type?.toLowerCase().includes("withdraw") ? "-" : "+"}₦{formatAmount(txn.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Text style={{ color: "#9CA3AF", fontSize: 13 }}>No transactions recorded yet.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ─── STEP 1: CLEAN TOP-UP AMOUNT MODAL ───────────────────────── */}
      <Modal visible={showTopUpModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 12 }}>
                  <Text style={styles.modalTitle}>Top Up WealthFlow: {flow?.name || ""}</Text>
                  <TouchableOpacity onPress={() => {
                    Keyboard.dismiss();
                    setShowTopUpModal(false);
                  }}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
                  Add extra funds directly from your main wallet to speed up your savings goal.
                </Text>

                {(() => {
                  const numTopUp = parseFloat(topUpAmount.replace(/,/g, "")) || 0;
                  const isExceeding = numTopUp > walletBalance;
                  const isValid = numTopUp > 0 && !isExceeding;
                  const formattedBal = walletBalance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");

                  return (
                    <>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 6 }}>
                        <Text style={styles.inputLabel}>Amount (₦)</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#6B7280" }}>
                          Wallet Balance: <Text style={{ fontWeight: "700", color: "#059669" }}>₦{formattedBal}</Text>
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#F3F4F6",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          height: 56,
                          marginBottom: isExceeding ? 6 : 20,
                          width: "100%",
                          borderWidth: isExceeding ? 1.5 : 0,
                          borderColor: isExceeding ? "#EF4444" : "transparent",
                        }}
                      >
                        <TextInput
                          style={{ flex: 1, fontSize: 22, fontWeight: "700", textAlign: "center", color: isExceeding ? "#EF4444" : TEXT_DARK }}
                          placeholder="₦0.00"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          returnKeyType="done"
                          inputAccessoryViewID={KEYBOARD_ACCESSORY_ID}
                          onSubmitEditing={() => Keyboard.dismiss()}
                          blurOnSubmit={true}
                          autoFocus
                          value={topUpAmount ? `₦${topUpAmount}` : ""}
                          onChangeText={(v) => {
                            const n = v.replace(/\D/g, "");
                            setTopUpAmount(n ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");
                          }}
                        />
                        {topUpAmount.length > 0 && (
                          <TouchableOpacity
                            onPress={() => Keyboard.dismiss()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{
                              backgroundColor: isExceeding ? "#FEE2E2" : "#E2E8F0",
                              borderRadius: 999,
                              padding: 4,
                              marginLeft: 8,
                            }}
                          >
                            <Ionicons name={isExceeding ? "alert-circle" : "checkmark"} size={14} color={isExceeding ? "#EF4444" : "#0B575B"} />
                          </TouchableOpacity>
                        )}
                      </View>

                      {isExceeding && (
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 16 }}>
                          <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "600" }}>
                            Insufficient wallet balance
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setShowTopUpModal(false);
                              setTopUpAmount("");
                              router.push("/wallet/deposit");
                            }}
                            style={{
                              backgroundColor: "#ECFDF5",
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: "#A7F3D0",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Ionicons name="wallet-outline" size={14} color="#059669" />
                            <Text style={{ color: "#059669", fontSize: 12, fontWeight: "700" }}>
                              Fund Wallet
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <ThemedButton
                        title="Continue"
                        disabled={!isValid || isNavigating}
                        loading={isNavigating}
                        onPress={() => {
                          if (!isValid || isNavigating) return;
                          Keyboard.dismiss();
                          setShowTopUpModal(false);
                          setShowConfirmTopUpModal(true);
                        }}
                        style={{
                          backgroundColor: isValid && !isNavigating ? TEAL : "#9CA3AF",
                          borderRadius: 14,
                          height: 52,
                          width: "100%",
                          opacity: isValid && !isNavigating ? 1 : 0.6,
                        }}
                      />
                    </>
                  );
                })()}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        <KeyboardDoneAccessory />
      </Modal>

      {/* TopUp Pre-PIN Confirmation Modal */}
      <ConfirmActionModal
        visible={showConfirmTopUpModal}
        title="Confirm Top-up"
        onCancel={() => {
          setShowConfirmTopUpModal(false);
          setShowTopUpModal(true);
        }}
        onConfirm={() => {
          const numTopUp = parseFloat(topUpAmount.replace(/,/g, "")) || 0;
          const amtStr = numTopUp.toString();
          setShowConfirmTopUpModal(false);
          setTopUpAmount("");
          router.push({
            pathname: "/payment/insert-pin",
            params: {
              amount: amtStr,
              action: "FLOW_TOPUP",
              targetId: flow?.id || "",
              targetName: flow?.name || "",
              returnUrl: `/portfolio/detail/flow/${flow?.id || ""}`,
            },
          });
        }}
        summaryRows={[
          {
            label: "Amount",
            value: `₦${(parseFloat(topUpAmount.replace(/,/g, "")) || 0).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          },
          { label: "Plan Name", value: `${flow?.name || plan.name} (WealthFlow)` },
          { label: "Funding Source", value: "Main Wallet" },
        ]}
      />

      {/* ─── WITHDRAW MODAL ────────────────────────────────────────────── */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 12 }}>
              <Text style={styles.modalTitle}>Withdraw to Main Wallet</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#E6F7ED", alignItems: "center", justifyContent: "center", marginVertical: 12 }}>
              <Ionicons name="wallet-outline" size={32} color={TEAL} />
            </View>

            <Text style={{ color: "#1F2937", fontSize: 16, fontWeight: "800", marginBottom: 6, textAlign: "center" }}>
              Ready to withdraw your savings?
            </Text>

            <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 20, textAlign: "center", lineHeight: 18, paddingHorizontal: 10 }}>
              Your plan has reached maturity! Your full savings balance of <Text style={{ color: TEAL, fontWeight: "bold" }}>₦{formatAmount(plan.balance)}</Text> will be transferred directly to your Main Wallet.
            </Text>

            <ThemedButton
              title="Confirm & Enter PIN"
              disabled={isNavigating}
              loading={isNavigating}
              onPress={() => {
                if (isNavigating) return;
                setIsNavigating(true);
                const balNum = parseFloat(plan.balance || "0") / 100;
                setShowWithdrawModal(false);
                router.push({
                  pathname: "/payment/insert-pin",
                  params: {
                    amount: balNum.toString(),
                    action: "FLOW_WITHDRAW",
                    targetId: plan.id,
                    targetName: plan.name,
                    returnUrl: `/portfolio/detail/flow/${plan.id}`,
                  },
                });
                setTimeout(() => setIsNavigating(false), 500);
              }}
              style={{
                backgroundColor: TEAL,
                borderRadius: 14,
                height: 52,
                width: "100%",
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ─── TERMINATE MODAL ───────────────────────────────────────────── */}
      {showTerminateModal && (
        <Modal visible={showTerminateModal} transparent animationType="fade">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.modalCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ width: "100%", alignItems: "center" }}
              >
                <Image
                  source={require("../../../../assets/images/terminate.png")}
                  style={{ width: 90, height: 90, marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text style={styles.modalTitle}>Terminate WealthFlow?</Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    textAlign: "center",
                    marginBottom: 14,
                    lineHeight: 20,
                  }}
                >
                  You are about to break your{" "}
                  <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>{plan.name}</Text>{" "}
                  plan. All accumulated funds will be returned to your main wallet balance.
                </Text>

                {/* Early Termination Penalty Breakdown Card */}
                {(() => {
                  const balNaira = parseFloat(plan.balance || "0") / 100;
                  const penaltyAmt = balNaira * penaltyRatio;
                  const estimatedPayout = Math.max(0, balNaira - penaltyAmt);

                  return balNaira > 0 ? (
                    <View
                      style={{
                        width: "100%",
                        backgroundColor: "#FEF2F2",
                        borderColor: "#FECACA",
                        borderWidth: 1,
                        borderRadius: 16,
                        padding: 14,
                        marginBottom: 16,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                        <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 13, fontWeight: "800", color: "#991B1B" }}>
                          Early Termination Deduction
                        </Text>
                      </View>

                      <Text style={{ fontSize: 12, color: "#7F1D1D", marginBottom: 12, lineHeight: 16 }}>
                        Terminating early will incur a <Text style={{ fontWeight: "700" }}>{penaltyRate}</Text> penalty, deducted from your current balance.
                      </Text>

                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                        <Text style={{ fontSize: 12, color: "#6B7280" }}>Current Balance</Text>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1A1A" }}>
                          ₦{balNaira.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: "#DC2626", fontWeight: "700" }}>
                          Penalty Fee ({penaltyRate})
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: "800", color: "#DC2626" }}>
                          -₦{penaltyAmt.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>

                      <View style={{ height: 1, backgroundColor: "#FECACA", marginBottom: 8 }} />

                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 13, fontWeight: "800", color: "#155D5F" }}>
                          Estimated Payout to Wallet
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: "900", color: "#155D5F" }}>
                          ₦{estimatedPayout.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        backgroundColor: "#FEF2F2",
                        borderColor: "#FECACA",
                        borderWidth: 1,
                        borderRadius: 14,
                        padding: 12,
                        marginBottom: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Ionicons name="alert-circle" size={22} color="#DC2626" />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: "#991B1B",
                          fontWeight: "700",
                          lineHeight: 18,
                        }}
                      >
                        Terminating early will incur a {penaltyRate} penalty, deducted from your current balance.
                      </Text>
                    </View>
                  );
                })()}

                <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                  <TouchableOpacity
                    onPress={() => setShowTerminateModal(false)}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "#E5E5E5",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "600" }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const balNum = parseFloat(plan.balance || "0") / 100;
                      setShowTerminateModal(false);
                      router.replace({
                        pathname: "/payment/insert-pin",
                        params: {
                          amount: balNum.toString(),
                          action: "FLOW_TERMINATE",
                          targetId: plan.id,
                          targetName: plan.name,
                          returnUrl: `/portfolio/detail/flow/${plan.id}`,
                        },
                      });
                    }}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 14,
                      backgroundColor: "#FEE2E2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#E53935", fontWeight: "700" }}>
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
      {/* Overflow Action Sheet */}
      <Modal visible={showOverflowMenu} transparent animationType="slide" onRequestClose={() => setShowOverflowMenu(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={() => setShowOverflowMenu(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={{ backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 36 : 24 }}>
            <View style={{ width: 44, height: 5, backgroundColor: "#D1D5DB", borderRadius: 999, alignSelf: "center", marginBottom: 16 }} />
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#1A1A1A", marginBottom: 16 }}>
                  Portfolio Options
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setShowOverflowMenu(false);
                    setShowManageFundsModal(true);
                  }}
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "#EEF6F6", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                    <Ionicons name="wallet-outline" size={20} color={TEAL} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>Transfer Funds</Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                {!isCompleted && (
                  <>
                    <View style={{ height: 1, backgroundColor: "#F3F4F6", marginVertical: 4 }} />

                    <TouchableOpacity
                      onPress={() => {
                        setShowOverflowMenu(false);
                        setShowTerminateModal(true);
                      }}
                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}
                    >
                      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                        <Ionicons name="alert-circle-outline" size={20} color="#E53935" />
                      </View>
                      <Text style={{ flex: 1, fontSize: 15, fontWeight: "700", color: "#E53935" }}>Terminate Plan</Text>
                      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
          </View>
      </Modal>

      {/* Manage Funds Sheet */}
      <ManageFundsSheet
        portfolioId={plan.id}
        portfolioName={plan.name}
        portfolioBalance={plan.balance}
        portfolioType="wealthflow"
        visible={showManageFundsModal}
        onClose={() => setShowManageFundsModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#6B7280",
    fontSize: 11,
    marginBottom: 6,
    fontWeight: "500",
  },
  value: {
    color: "#1A1A1A",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  textInput: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: TEXT_DARK,
  },
  sourceOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FAFAFA",
  },
  sourceOptionActive: {
    borderColor: TEAL,
    backgroundColor: "#E6F0F1",
  },
  sourceText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
});
