import Header from "@/src/components/common/Header";
import { Trophy } from "@/src/components/icons/Trophy";
import { ThemedButton } from "@/src/components/ThemedButton";
import {
  KeyboardDoneAccessory,
  KEYBOARD_ACCESSORY_ID,
} from "@/src/components/common/KeyboardDoneAccessory";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { saveSingleCompletedPortfolio } from "@/src/store/slices/completedPortfolioSlice";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useGetPortfoliosQuery,
  useTerminatePortfolioMutation,
  useTopUpPortfolioMutation,
  useGetPortfolioTransactionsQuery,
  useGetPortfolioConfigQuery,
} from "@/src/store/api/portfolioApi";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import {
  getCleanTransactionTitle,
  getPortfolioZeroBalanceBannerInfo,
  formatEarlyTerminationPenaltyRate,
} from "@/src/utils/formatters";
import ManageFundsSheet from "@/src/components/portfolio/ManageFundsSheet";
import { BlurView } from "expo-blur";
import ConfirmActionModal from "@/src/components/common/ConfirmActionModal";

const SCREEN_OPTIONS = { headerShown: false } as const;

export default function GoalDetailScreen() {
  const { id, openTopUp } = useLocalSearchParams<{ id: string; openTopUp?: string }>();
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(openTopUp === "true");
  const [showConfirmTopUpModal, setShowConfirmTopUpModal] = useState(false);
  const [showManageFundsModal, setShowManageFundsModal] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [topUpSource, setTopUpSource] = useState<"WALLET" | "CARD">("WALLET");

  const [terminatePortfolio, { isLoading: isTerminating }] = useTerminatePortfolioMutation();
  const [topUpPortfolio, { isLoading: isToppingUp }] = useTopUpPortfolioMutation();
  const { data, isLoading: loading, refetch: refetchPortfolios } = useGetPortfoliosQuery({ type: "wealthgoal" });
  const { data: configData } = useGetPortfolioConfigQuery();
  const rates = configData?.rates || (configData as any)?.data?.rates;
  const goalRate = rates?.wealthgoal;
  const penaltyRate = formatEarlyTerminationPenaltyRate(
    goalRate?.earlyLiquidationPenaltyRate ?? goalRate?.earlyWithdrawalPenaltyPercentage,
    "2.5%"
  );
  const penaltyRatio = (() => {
    const n = parseFloat(penaltyRate.replace("%", ""));
    return !isNaN(n) && n > 0 ? n / 100 : 0.025;
  })();
  const { data: walletSummary, refetch: refetchWallet } = useGetWalletSummaryQuery();
  const walletBalance = (parseFloat(walletSummary?.currentBalance || "0")) / 100;

  const { data: txnsData, isLoading: txnsLoading, refetch: refetchTxns } = useGetPortfolioTransactionsQuery(
    { id: id as string },
    { skip: !id, refetchOnMountOrArgChange: true }
  );

  useFocusEffect(
    useCallback(() => {
      refetchPortfolios();
      refetchTxns();
      refetchWallet();
    }, [refetchPortfolios, refetchTxns, refetchWallet])
  );

  const dispatch = useDispatch();
  const handleBack = useCallback(() => router.back(), []);
  const savedCompletedPlan = useSelector((state: RootState) =>
    id ? state.completedPortfolio.completedMap[id as string] : undefined
  );
  const allGoals = data?.items || [];
  const fetchedGoal = allGoals.find((g) => g.id === id);
  const lastGoalRef = useRef(fetchedGoal);
  if (fetchedGoal) {
    lastGoalRef.current = fetchedGoal;
  }
  const goal = fetchedGoal || savedCompletedPlan || lastGoalRef.current;

  useEffect(() => {
    if (!fetchedGoal) return;
    const isMatured =
      fetchedGoal.maturityDate &&
      new Date(fetchedGoal.maturityDate).getTime() <= Date.now();
    const isTargetReached =
      parseFloat(fetchedGoal.targetAmount || "0") > 0 &&
      parseFloat(fetchedGoal.balance || "0") >= parseFloat(fetchedGoal.targetAmount || "0");
    const isCompletedOrTerminated =
      fetchedGoal.status === "COMPLETED" ||
      fetchedGoal.status === "TERMINATED" ||
      fetchedGoal.status === "WITHDRAWN" ||
      isMatured ||
      isTargetReached;

    if (isCompletedOrTerminated) {
      const targetStatus =
        fetchedGoal.status === "TERMINATED" ? "TERMINATED" : "COMPLETED";
      if (
        !savedCompletedPlan ||
        savedCompletedPlan.status !== targetStatus ||
        savedCompletedPlan.balance !== fetchedGoal.balance
      ) {
        dispatch(saveSingleCompletedPortfolio(fetchedGoal));
      }
    }
  }, [
    fetchedGoal?.id,
    fetchedGoal?.status,
    fetchedGoal?.balance,
    fetchedGoal?.targetAmount,
    fetchedGoal?.maturityDate,
    savedCompletedPlan?.status,
    savedCompletedPlan?.balance,
    dispatch,
  ]);

  const PINK = "#FA85C0";
  const TEAL = "#0B575B";

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

  if (!goal) {
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
        <Text style={{ color: "#6B7280" }}>Goal not found</Text>
        <ThemedButton
          title="Go Back"
          onPress={handleBack}
          style={{ marginTop: 16 }}
        />
      </SafeAreaView>
    );
  }

  const isCompleted = goal.status === "COMPLETED" || parseFloat(goal.balance) >= parseFloat(goal.targetAmount);
  const hasRemainingBalance = parseFloat(goal.balance || "0") > 0;
  const zeroBalanceBanner = getPortfolioZeroBalanceBannerInfo(txnsData?.items);
  
  const progress = parseFloat(goal.targetAmount) > 0 ? parseFloat(goal.balance) / parseFloat(goal.targetAmount) : 0;
  
  const getDaysLeft = () => {
    const end = new Date(goal.maturityDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 3600 * 24));
  };
  
  const formattedDate = new Date(goal.maturityDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formatAmount = (val?: string) => {
    if (!val) return "0.00";
    const amountNum = Math.abs(parseFloat(val)) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const handleTopUpSubmit = async () => {
    const numAmount = parseFloat(topUpAmount.replace(/[^\d.]/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    try {
      const amountKobo = Math.round(numAmount * 100);
      await topUpPortfolio({
        id: goal.id,
        body: {
          amount: amountKobo,
          source: topUpSource,
        },
      }).unwrap();

      Alert.alert("Success", "Top-up completed successfully.");
      setTopUpAmount("");
      setShowTopUpModal(false);
      refetchPortfolios();
    } catch (err: any) {
      console.error("Top up portfolio failed:", err);
      Alert.alert("Failed", err?.data?.message || err?.message || "Top-up request failed.");
    }
  };

  const renderActiveHeader = () => (
    <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
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
            {goal.name}
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 14, marginBottom: 16 }}>
            {goal.metadata?.category || "Goal"}
          </Text>
          <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 28 }}>
            ₦{formatAmount(goal.balance)}
          </Text>
        </View>
        <Image
          source={require("../../../../assets/images/arrow.png")}
          style={{ width: 120, height: 100 }}
          resizeMode="contain"
        />
      </View>

      <View style={{ width: "100%" }}>
        <View
          style={{
            height: 10,
            borderRadius: 20,
            backgroundColor: "#FFEEF7",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: `${Math.max(Math.min(progress * 100, 100), 2)}%`,
              height: 10,
              borderRadius: 20,
              backgroundColor: PINK,
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
            {Math.round(Math.min(progress * 100, 100))}%
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
        <View>
          <Trophy size={130} />
        </View>
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Text style={{ fontSize: 24, marginRight: 8 }}>🎉</Text>
        <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 26 }}>
          Congratulation
        </Text>
        <Text style={{ fontSize: 24, marginLeft: 8 }}>🎉</Text>
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
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>Wealth Goal</Text>{" "}
        has been{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          achieved successfully
        </Text>
        , your{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          "₦{formatAmount(goal.targetAmount)}"
        </Text>{" "}
        has been deposited into your Wealth Save account by {formattedDate}.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={SCREEN_OPTIONS} />
      <Header
        title="Review"
        showBack={true}
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 8, paddingBottom: 40 }}>
          {isCompleted ? renderCompletedHeader() : renderActiveHeader()}

          {/* Jagged Receipt Card */}
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
                <Text style={styles.value}>{goal.name}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Target Amount</Text>
                <Text style={styles.value}>₦{formatAmount(goal.targetAmount)}</Text>
              </View>
            </View>

            {/* Row 2: Preference & Current Savings */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Preference</Text>
                <Text style={styles.value}>{goal.metadata?.wealthPreference || "Interest Based"}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Current Savings</Text>
                <Text style={styles.value}>₦{formatAmount(goal.balance)}</Text>
              </View>
            </View>

            {/* Row 3: Funding Source & Target Date */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Funding Source</Text>
                <Text style={styles.value}>Main Wallet</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Target Date</Text>
                <Text style={styles.value}>{formattedDate}</Text>
              </View>
            </View>

            {/* Row 4: Status & Interest Rate */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Status</Text>
                <Text style={[styles.value, { color: isCompleted || goal.status === "COMPLETED" ? "#10B981" : TEAL }]}>
                  {isCompleted ? "COMPLETED" : (goal.status || "ACTIVE")}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Interest Rate</Text>
                <Text style={styles.value}>{goal.interestRate || 12}% P.A</Text>
              </View>
            </View>

            {/* Jagged Edge Bottom */}
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
              marginBottom: 28,
              marginHorizontal: 20,
            }}
          />

          <View style={{ paddingHorizontal: 20 }}>
            {hasRemainingBalance ? (
              !isCompleted && (
                <ThemedButton
                  title="TopUp Wealth"
                  onPress={() => setShowTopUpModal(true)}
                  style={{
                    backgroundColor: TEAL,
                    borderRadius: 14,
                    height: 56,
                  }}
                />
              )
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

          {/* Recent Activity */}
          <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#1A1A1A", marginBottom: 14 }}>
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
                    <Text style={{ fontWeight: "700", color: "#1A1A1A", fontSize: 14 }}>
                      {getCleanTransactionTitle(txn, goal?.name)}
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

      {/* TopUp Modal */}
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
                  <Text style={styles.modalTitle}>Top Up WealthGoal: {goal.name}</Text>
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
                          style={{ flex: 1, fontSize: 22, fontWeight: "700", textAlign: "center", color: isExceeding ? "#EF4444" : "#1A1A1A" }}
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
                          width: "100%",
                          height: 52,
                          borderRadius: 14,
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
              action: "GOAL_TOPUP",
              targetId: goal.id,
              targetName: goal.name,
              returnUrl: `/portfolio/detail/goal/${goal.id}`,
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
          { label: "Plan Name", value: `${goal.name} (WealthGoal)` },
          { label: "Funding Source", value: "Main Wallet" },
        ]}
      />

      {/* Terminate Modal */}
      <Modal visible={showTerminateModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalCard}>
                <Image
                  source={require("../../../../assets/images/terminate.png")}
                  style={{ width: 80, height: 80, marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: "#1A1A1A",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Terminate Wealth Fund?
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    textAlign: "center",
                    marginBottom: 14,
                    lineHeight: 18,
                  }}
                >
                  You are about to close the{" "}
                  <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
                    {goal?.name}
                  </Text>{" "}
                  portfolio. This fund was created to secure a future legacy.
                </Text>

                {/* Early Termination Penalty Breakdown Card */}
                {(() => {
                  const balNaira = parseFloat(goal?.balance || "0") / 100;
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

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setShowTerminateModal(false)}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 15,
                      borderWidth: 0.8,
                      borderColor: "#CDCDCD",
                      backgroundColor: "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#747474", fontWeight: "500" }}
                    >
                      Keep building
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const balNum = parseFloat(goal.balance || "0") / 100;
                      setShowTerminateModal(false);
                      router.replace({
                        pathname: "/payment/insert-pin",
                        params: {
                          amount: balNum.toString(),
                          action: "GOAL_TERMINATE",
                          targetId: goal.id,
                          targetName: goal.name,
                          returnUrl: `/portfolio/detail/goal/${goal.id}`,
                        },
                      });
                    }}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 15,
                      backgroundColor: "#FEE2E2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#EF4444",
                        fontWeight: "700",
                      }}
                    >
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        <KeyboardDoneAccessory />
      </Modal>
      <KeyboardDoneAccessory />

      {/* Overflow Action Sheet */}
      <Modal visible={showOverflowMenu} transparent animationType="slide" onRequestClose={() => setShowOverflowMenu(false)}>
        <TouchableWithoutFeedback onPress={() => setShowOverflowMenu(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
            <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableWithoutFeedback>
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Manage Funds Sheet */}
      <ManageFundsSheet
        portfolioId={goal.id}
        portfolioName={goal.name}
        portfolioBalance={goal.balance}
        portfolioType="wealthgoal"
        visible={showManageFundsModal}
        onClose={() => setShowManageFundsModal(false)}
      />
    </SafeAreaView>
  );
}

function ActivityItem({ title, date, amount, type, isSuccess }: any) {
  const color = isSuccess || type === "deposit" ? "#4CAF50" : "#F3007A";

  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-[#F8F8F8] rounded-full items-center justify-center mr-3">
          <MaterialCommunityIcons
            name={
              isSuccess
                ? "check-circle"
                : type === "deposit"
                  ? "arrow-down-left"
                  : "arrow-up-right"
            }
            size={20}
            color={color}
          />
        </View>
        <View>
          <Text className="text-[#1A1A1A] font-bold text-sm tracking-tight">
            {title}
          </Text>
          <Text className="text-[#64748B] text-[10px] opacity-60">{date}</Text>
        </View>
      </View>
      <Text style={{ color }} className="font-bold text-[14px]">
        {type === "deposit" ? "+" : "-"}₦{amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
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
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
    alignSelf: "flex-start",
  },
});
