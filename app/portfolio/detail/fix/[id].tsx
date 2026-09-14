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
  useGetPortfolioConfigQuery,
} from "@/src/store/api/portfolioApi";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import {
  getCleanTransactionTitle,
  getPortfolioZeroBalanceBannerInfo,
  formatEarlyTerminationPenaltyRate,
} from "@/src/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { saveSingleCompletedPortfolio } from "@/src/store/slices/completedPortfolioSlice";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManageFundsSheet from "@/src/components/portfolio/ManageFundsSheet";
import { BlurView } from "expo-blur";
import ConfirmActionModal from "@/src/components/common/ConfirmActionModal";

const SCREEN_OPTIONS = { headerShown: false } as const;

export default function FixDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showConfirmTopUpModal, setShowConfirmTopUpModal] = useState(false);
  const [showManageFundsModal, setShowManageFundsModal] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [showTransferLockedModal, setShowTransferLockedModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const dispatch = useDispatch();
  const handleBack = useCallback(() => router.back(), []);
  const savedCompletedPlan = useSelector((state: RootState) =>
    id ? state.completedPortfolio.completedMap[id as string] : undefined
  );
  const { data, isLoading: loading, refetch: refetchFix } = useGetPortfoliosQuery({ type: "wealthfix" });
  const { data: configData } = useGetPortfolioConfigQuery();
  const rates = configData?.rates || (configData as any)?.data?.rates;
  const fixRate = rates?.wealthfix;
  const penaltyRate = formatEarlyTerminationPenaltyRate(
    fixRate?.earlyLiquidationPenaltyRate ?? fixRate?.earlyWithdrawalPenaltyPercentage,
    "2.5%"
  );
  const penaltyRatio = (() => {
    const n = parseFloat(penaltyRate.replace("%", ""));
    return !isNaN(n) && n > 0 ? n / 100 : 0.025;
  })();
  const allFixes = data?.items || [];
  const fetchedFix = allFixes.find((f) => f.id === id);
  const lastFixRef = useRef(fetchedFix);
  if (fetchedFix) {
    lastFixRef.current = fetchedFix;
  }
  const fix = fetchedFix || savedCompletedPlan || lastFixRef.current;

  useEffect(() => {
    if (!fetchedFix) return;
    const isMatured =
      fetchedFix.maturityDate &&
      new Date(fetchedFix.maturityDate).getTime() <= Date.now();
    const isCompletedOrTerminated =
      fetchedFix.status === "COMPLETED" ||
      fetchedFix.status === "TERMINATED" ||
      fetchedFix.status === "WITHDRAWN" ||
      isMatured;

    if (isCompletedOrTerminated) {
      const targetStatus =
        fetchedFix.status === "TERMINATED" ? "TERMINATED" : "COMPLETED";
      if (
        !savedCompletedPlan ||
        savedCompletedPlan.status !== targetStatus ||
        savedCompletedPlan.balance !== fetchedFix.balance
      ) {
        dispatch(saveSingleCompletedPortfolio(fetchedFix));
      }
    }
  }, [
    fetchedFix?.id,
    fetchedFix?.status,
    fetchedFix?.balance,
    fetchedFix?.maturityDate,
    savedCompletedPlan?.status,
    savedCompletedPlan?.balance,
    dispatch,
  ]);

  const { data: txnsData, isLoading: txnsLoading, refetch: refetchTxns } = useGetPortfolioTransactionsQuery(
    { id: id as string },
    { skip: !id, refetchOnMountOrArgChange: true }
  );
  const { data: walletSummary, refetch: refetchWallet } = useGetWalletSummaryQuery();
  const walletBalance = (parseFloat(walletSummary?.currentBalance || "0")) / 100;

  useFocusEffect(
    useCallback(() => {
      refetchFix();
      refetchTxns();
      refetchWallet();
    }, [refetchFix, refetchTxns, refetchWallet])
  );

  const THEME_COLOR = "#D48E00";
  const TEAL = "#0B575B";
  const TEXT_DARK = "#1A1A1A";

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

  if (!fix) {
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
        <Text style={{ color: "#6B7280" }}>Fix not found</Text>
      </SafeAreaView>
    );
  }

  const isMatured = fix.maturityDate ? new Date(fix.maturityDate).getTime() <= Date.now() : false;

  const isUnlocked =
    fix.status === "COMPLETED" ||
    fix.status === "TERMINATED" ||
    isMatured;

  const isWithdrawn = parseFloat(fix.balance || "0") <= 0;
  const hasRemainingBalance = parseFloat(fix.balance || "0") > 0;
  const zeroBalanceBanner = getPortfolioZeroBalanceBannerInfo(txnsData?.items);

  const progress = isUnlocked
    ? 1
    : parseFloat(fix.targetAmount) > 0
    ? parseFloat(fix.balance) / parseFloat(fix.targetAmount)
    : 0;

  const getDaysLeft = () => {
    const end = new Date(fix.maturityDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const formattedDate = new Date(fix.maturityDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formatAmount = (val?: string) => {
    if (!val) return "0.00";
    const amountNum = Math.abs(parseFloat(val)) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const growthVal =
    (fix as any).interestAccrued ??
    (fix as any).accruedInterest ??
    fix.dailyGrowth ??
    (fix as any).totalYieldEarned ??
    "0";

  const handleProceedTopUp = () => {
    const cleanAmt = topUpAmount.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleanAmt);
    if (!num || num < 100) {
      Alert.alert("Invalid Amount", "Please enter a top-up amount of at least ₦100.");
      return;
    }
    setShowTopUpModal(false);
    setTopUpAmount("");
    router.push({
      pathname: "/payment/insert-pin",
      params: {
        amount: num.toString(),
        action: "FIX_TOPUP",
        targetId: fix.id,
        targetName: fix.name,
        returnUrl: `/portfolio/detail/fix/${fix.id}`,
      },
    });
  };

  const handleProceedWithdraw = () => {
    const num = parseFloat(fix.balance || "0") / 100;
    router.push({
      pathname: "/payment/insert-pin",
      params: {
        amount: num.toString(),
        action: "FIX_WITHDRAW",
        targetId: fix.id,
        targetName: fix.name,
        returnUrl: `/portfolio/detail/fix/${fix.id}`,
      },
    });
  };

  const handleProceedTerminate = () => {
    setShowTerminateModal(false);
    const num = parseFloat(fix.balance || "0") / 100;
    router.replace({
      pathname: "/payment/insert-pin",
      params: {
        amount: num.toString(),
        action: "FIX_TERMINATE",
        targetId: fix.id,
        targetName: fix.name,
        returnUrl: `/portfolio/detail/fix/${fix.id}`,
      },
    });
  };

  const renderLockedHeader = () => (
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
            {fix.name}
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 14, marginBottom: 16 }}>
            {fix.metadata?.category || "Fix"}
          </Text>
          <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 28 }}>
            ₦{formatAmount(fix.balance)}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>
            of ₦{formatAmount(fix.targetAmount)} target
          </Text>
        </View>
        <Image
          source={require("../../../../assets/images/fix1.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>

      <View style={{ width: "100%" }}>
        <View
          style={{
            height: 10,
            borderRadius: 20,
            backgroundColor: "#FFF8E1",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: `${Math.max(Math.min(progress * 100, 100), 2)}%`,
              height: 10,
              borderRadius: 20,
              backgroundColor: THEME_COLOR,
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

  const renderUnlockedHeader = () => (
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
          source={require("../../../../assets/images/fix2.png")}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Text style={{ fontSize: 24, marginRight: 8 }}>🎉</Text>
        <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 26 }}>
          Wealth Unlocked
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
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          Fixed Wealth
        </Text>{" "}
        has matured successfully, with a target of{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          "₦{formatAmount(fix.targetAmount)}"
        </Text>{" "}
        by {formattedDate}.
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
          {isUnlocked ? renderUnlockedHeader() : renderLockedHeader()}

          {/* Jagged Summary Card */}
          <View
            style={{
              backgroundColor: "#F6F6F6",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 28,
              marginHorizontal: 20,
            }}
          >
            {/* Row 1: Amount To Fix & Lock Duration */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Amount To Fix</Text>
                <Text style={styles.value}>₦{formatAmount(fix.targetAmount)}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Lock Duration</Text>
                <Text style={styles.value}>
                  {fix.metadata?.lockDuration || `${getDaysLeft() + 30} days`}
                </Text>
              </View>
            </View>

            {/* Row 2: Wealth Growth & Progressive Amount */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Wealth Growth</Text>
                <Text style={styles.value}>₦{formatAmount(growthVal.toString())}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Progressive Amount</Text>
                <Text style={styles.value}>₦{formatAmount(fix.balance)}</Text>
              </View>
            </View>

            {/* Row 3: Method & End Date */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Method</Text>
                <Text style={styles.value}>
                  {fix.metadata?.autoSave ? "Automation" : "Manual"}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.value}>{formattedDate}</Text>
              </View>
            </View>

            {/* Row 4: Interest Rate & Funding Source */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Interest Rate</Text>
                <Text style={styles.value}>
                  {fix.interestRate ? `${fix.interestRate}% P.A` : "15% P.A"}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Funding Source:</Text>
                <Text style={styles.value}>Main Wallet</Text>
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

          {/* Action Buttons */}
          <View style={{ paddingHorizontal: 20 }}>
            {!isWithdrawn ? (
              <ThemedButton
                title="TopUp Wealth"
                onPress={() => setShowTopUpModal(true)}
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

          {/* Recent Activity Section */}
          <View style={{ marginTop: 32, paddingHorizontal: 20 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: "#1A1A1A",
                marginBottom: 14,
              }}
            >
              Recent Activity
            </Text>

            {txnsLoading ? (
              <ActivityIndicator
                size="small"
                color={TEAL}
                style={{ marginVertical: 20 }}
              />
            ) : txnsData?.items && txnsData.items.length > 0 ? (
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
                  <View>
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 14,
                        color: "#1A1A1A",
                      }}
                    >
                      {getCleanTransactionTitle(txn, fix.name)}
                    </Text>
                    <Text
                      style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}
                    >
                      {new Date(txn.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontWeight: "800",
                      fontSize: 15,
                      color:
                        txn.type?.toLowerCase().includes("debit") ||
                        txn.type?.toLowerCase().includes("withdraw")
                          ? "#E53935"
                          : TEAL,
                    }}
                  >
                    {txn.type?.toLowerCase().includes("debit") ||
                    txn.type?.toLowerCase().includes("withdraw")
                      ? "-"
                      : "+"}
                    ₦{formatAmount(txn.amount?.toString())}
                  </Text>
                </View>
              ))
            ) : (
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  padding: 20,
                  borderRadius: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                  No recent transactions found
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* TopUp Amount Input Modal */}
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
                  <Text style={styles.modalTitle}>Top Up WealthFix: {fix.name}</Text>
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
              action: "FIX_TOPUP",
              targetId: fix.id,
              targetName: fix.name,
              returnUrl: `/portfolio/detail/fix/${fix.id}`,
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
          { label: "Plan Name", value: `${fix.name} (WealthFix)` },
          { label: "Funding Source", value: "Main Wallet" },
        ]}
      />

      {/* Terminate Modal */}
      {showTerminateModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            zIndex: 100,
          }}
        >
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../../../assets/images/terminate.png")}
              style={{ width: 90, height: 90, marginBottom: 10 }}
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
              Terminate Fixed Fund?
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                textAlign: "center",
                marginBottom: 14,
                lineHeight: 18,
              }}
            >
              You are about to break your{" "}
              <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
                {fix.name}
              </Text>{" "}
              plan before maturity.
            </Text>

            {/* Early Termination Penalty Breakdown Card */}
            {(() => {
              const balNaira = parseFloat(fix.balance || "0") / 100;
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
              }}
            >
              <TouchableOpacity
                onPress={() => setShowTerminateModal(false)}
                style={{
                  flex: 1,
                  height: 50,
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
                  Keep Legacy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleProceedTerminate}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 15,
                  backgroundColor: "#FFD7D4",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#E53935", fontWeight: "700" }}
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Overflow Action Sheet */}
      <Modal visible={showOverflowMenu} transparent animationType="slide" onRequestClose={() => setShowOverflowMenu(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setShowOverflowMenu(false)}
        >
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity activeOpacity={1}>
            <View style={{ backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 }}>
              <View style={{ width: 44, height: 5, backgroundColor: "#D1D5DB", borderRadius: 999, alignSelf: "center", marginBottom: 16 }} />
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#1A1A1A", marginBottom: 16 }}>
                Portfolio Options
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setShowOverflowMenu(false);
                  if (isMatured) {
                    setShowManageFundsModal(true);
                  } else {
                    setShowTransferLockedModal(true);
                  }
                }}
                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}
              >
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "#EEF6F6", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <Ionicons name="wallet-outline" size={20} color={TEAL} />
                </View>
                <Text style={{ flex: 1, fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>Transfer Funds</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>

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
                <Text style={{ flex: 1, fontSize: 15, fontWeight: "700", color: "#E53935" }}>
                  {isMatured ? "Terminate Plan" : "Terminate Fixed Fund"}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Transfer Locked Until Maturity Modal */}
      {showTransferLockedModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            zIndex: 110,
          }}
        >
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 24,
              width: "100%",
              maxWidth: 380,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                backgroundColor: "#FEF3C7",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="lock-closed" size={32} color="#D97706" />
            </View>

            <Text
              style={{
                fontSize: 19,
                fontWeight: "800",
                color: "#1A1A1A",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Transfer Locked Until Maturity
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 16,
              }}
            >
              Transfer of funds is not available on{" "}
              <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
                {fix.name}
              </Text>{" "}
              until it reaches maturity on{" "}
              <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
                {formattedDate}
              </Text>
              .
            </Text>

            <View
              style={{
                width: "100%",
                backgroundColor: "#FEF2F2",
                borderColor: "#FECACA",
                borderWidth: 1,
                borderRadius: 14,
                padding: 12,
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 12, color: "#991B1B", lineHeight: 18 }}>
                  If you urgently need access to your funds before maturity, you can only{" "}
                  <Text style={{ fontWeight: "800" }}>terminate</Text> the plan, which incurs an early breaking penalty fee ({penaltyRate}).
                </Text>
              </View>
            </View>

            <View style={{ width: "100%", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowTransferLockedModal(false)}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: TEAL,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "white" }}>
                  Keep Plan (Recommended)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowTransferLockedModal(false);
                  setShowTerminateModal(true);
                }}
                style={{
                  width: "100%",
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: "#FFF1F2",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#FFE4E6",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#E11D48" }}>
                  Terminate Plan (with penalty)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Manage Funds Sheet */}
      <ManageFundsSheet
        portfolioId={fix.id}
        portfolioName={fix.name}
        portfolioBalance={fix.balance}
        portfolioType="wealthfix"
        visible={showManageFundsModal}
        onClose={() => setShowManageFundsModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
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
    fontWeight: "600",
    color: "#4B5563",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
});
