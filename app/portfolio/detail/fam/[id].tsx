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
} from "@/src/store/api/portfolioApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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

const TEAL = "#0B575B";
const TEAL_LIGHT = "#E0F2F1";
const TEXT_DARK = "#1A1A1A";

export default function FamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Modals state
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showTopUpPinModal, setShowTopUpPinModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Form states for modals
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpSource, setTopUpSource] = useState<"WALLET" | "CARD">("WALLET");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [actionPin, setActionPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Queries & Mutations
  const { data, isLoading: loading, refetch } = useGetPortfoliosQuery({ type: "wealthfam" });
  const { data: txnsData, isLoading: txnsLoading } = useGetPortfolioTransactionsQuery(
    { id: id as string },
    { skip: !id }
  );

  const [topUpPortfolio] = useTopUpPortfolioMutation();
  const [withdrawToWallet] = useWithdrawToWalletMutation();
  const [terminatePortfolio] = useTerminatePortfolioMutation();

  const allPlans = data?.items || [];
  const plan = allPlans.find((p) => p.id === id);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["top"]}
      >
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Review" onBack={() => router.back()} />
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
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Review" onBack={() => router.back()} />
        <Text style={{ color: "#6B7280", marginTop: 20 }}>Plan not found</Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/portfolios/wealth-fam")}
          style={{ marginTop: 16, backgroundColor: TEAL, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isCompleted = plan.status === "COMPLETED" || plan.status === "TERMINATED" || new Date(plan.maturityDate).getTime() <= Date.now();

  const progress = parseFloat(plan.targetAmount) > 0 ? parseFloat(plan.balance) / parseFloat(plan.targetAmount) : 0;
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
    const amountNum = parseFloat(val) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const [verifyPin] = useVerifyPinMutation();

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

      console.log(`👨‍👩‍👧 [WealthFam Withdraw Request] POST /api/v1/portfolios/${plan.id}/withdraw-to-wallet:`, payload);
      const res = await withdrawToWallet({ id: plan.id, body: payload }).unwrap();
      console.log("✅ [WealthFam Withdraw Success] Response:", res);

      Alert.alert("Withdrawal Successful", `Successfully transferred ₦${num.toLocaleString()} to your main wallet.`);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setActionPin("");
      refetch();
    } catch (err: any) {
      console.error("❌ [WealthFam Withdraw Error]:", err);
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
      console.log(`👨‍👩‍👧 [WealthFam Terminate Request] POST /api/v1/portfolios/${plan.id}/terminate`);
      const res = await terminatePortfolio({ id: plan.id, body: { pin: actionPin } }).unwrap();
      console.log("✅ [WealthFam Terminate Success] Response:", res);

      Alert.alert("Portfolio Terminated", "Your WealthFam plan has been closed and funds returned to your wallet.");
      setShowTerminateModal(false);
      setActionPin("");
      router.replace("/(tabs)/portfolios/wealth-fam");
    } catch (err: any) {
      console.error("❌ [WealthFam Terminate Error]:", err);
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
            {plan.metadata?.familyMemberName
              ? `For ${plan.metadata.familyMemberName} (${plan.metadata.familyCategory || "Family"})`
              : "Family Pot"}
          </Text>
          <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 28 }}>
            ₦{formatAmount(plan.balance)}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>
            of ₦{formatAmount(plan.targetAmount)} target
          </Text>
        </View>
        <Image
          source={require("../../../../assets/images/fam1.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>

      <View style={{ width: "100%" }}>
        <View
          style={{
            height: 10,
            borderRadius: 20,
            backgroundColor: TEAL_LIGHT,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: `${Math.max(progressPct, 2)}%`,
              height: 10,
              borderRadius: 20,
              backgroundColor: TEAL,
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
          source={require("../../../../assets/images/fam2.png")}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Text style={{ fontSize: 24, marginRight: 8 }}>🏡</Text>
        <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 26 }}>
          Family Goal Completed!
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
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>WealthFam</Text>{" "}
        target for{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          {plan.name}
        </Text>{" "}
        has matured.{"\n"}
        Total Accumulated Balance:{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>₦{formatAmount(plan.balance)}</Text>
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Review" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
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
                <Text style={styles.label}>Family Plan</Text>
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
                <Text style={styles.value}>₦{formatAmount(plan.balance)}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Interest Rate</Text>
                <Text style={styles.value}>{plan.interestRate || 12}% P.A</Text>
              </View>
            </View>

            {/* Row 3: Status & Maturity Date */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Status</Text>
                <Text style={[styles.value, { color: plan.status === "ACTIVE" ? TEAL : "#6B7280" }]}>
                  {plan.status || "ACTIVE"}
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
                <Text style={styles.value}>{plan.metadata?.fundingSource || "Wallet"}</Text>
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
              <>
                <ThemedButton
                  title="TopUp Family Pot"
                  onPress={() => setShowTopUpModal(true)}
                  style={{
                    backgroundColor: TEAL,
                    borderRadius: 14,
                    height: 56,
                    marginBottom: 16,
                  }}
                />

                <ThemedButton
                  title="Terminate Family Goal"
                  onPress={() => {
                    setActionPin("");
                    setShowTerminateModal(true);
                  }}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 14,
                    height: 56,
                    borderWidth: 1,
                    borderColor: "#FFCDD2",
                  }}
                  textStyle={{ color: "#E53935", fontWeight: "700" }}
                />
              </>
            ) : (
              <ThemedButton
                title="Withdraw All to Wallet"
                onPress={() => setShowWithdrawModal(true)}
                style={{
                  backgroundColor: TEAL,
                  borderRadius: 14,
                  height: 56,
                }}
              />
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
                      {txn.description || txn.type}
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
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 12 }}>
                  <Text style={styles.modalTitle}>Top Up Family Pot</Text>
                  <TouchableOpacity onPress={() => {
                    Keyboard.dismiss();
                    setShowTopUpModal(false);
                  }}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 20, textAlign: "center" }}>
                  Add extra funds directly from your main wallet to accelerate this family goal.
                </Text>

                <Text style={styles.inputLabel}>Amount (₦)</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F3F4F6",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    height: 56,
                    marginBottom: 20,
                    width: "100%",
                  }}
                >
                  <TextInput
                    style={{ flex: 1, fontSize: 22, fontWeight: "700", textAlign: "center", color: TEXT_DARK }}
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
                        backgroundColor: "#E2E8F0",
                        borderRadius: 999,
                        padding: 4,
                        marginLeft: 8,
                      }}
                    >
                      <Ionicons name="checkmark" size={14} color="#0B575B" />
                    </TouchableOpacity>
                  )}
                </View>

                <ThemedButton
                  title="Continue"
                  onPress={() => {
                    Keyboard.dismiss();
                    const num = parseFloat(topUpAmount.replace(/,/g, ""));
                    if (!num || num <= 0) {
                      Alert.alert("Invalid Amount", "Please enter a valid amount to top up.");
                      return;
                    }
                    const amtStr = num.toString();
                    setShowTopUpModal(false);
                    setTopUpAmount("");
                    router.push({
                      pathname: "/payment/insert-pin",
                      params: {
                        amount: amtStr,
                        action: "FAM_TOPUP",
                        targetId: plan.id,
                        targetName: plan.name,
                        returnUrl: `/portfolio/detail/fam/${plan.id}`,
                      },
                    });
                  }}
                  style={{ backgroundColor: TEAL, width: "100%", height: 52, borderRadius: 14 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        <KeyboardDoneAccessory />
      </Modal>

      {/* ─── WITHDRAW MODAL ────────────────────────────────────────────── */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ width: "100%", alignItems: "center" }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 16 }}>
                <Text style={styles.modalTitle}>Withdraw to Wallet</Text>
                <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
                Transfer funds from this family pot to your main wallet balance.
              </Text>

              <Text style={styles.inputLabel}>Withdrawal Amount (₦)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 20,000"
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={(v) => {
                  const n = v.replace(/\D/g, "");
                  setWithdrawAmount(n.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                }}
              />

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Transaction PIN</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 4-digit PIN"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={actionPin}
                onChangeText={setActionPin}
              />

              <ThemedButton
                title={isProcessing ? "Processing..." : "Confirm Withdrawal"}
                onPress={handleWithdrawSubmit}
                disabled={isProcessing}
                style={{ backgroundColor: TEAL, width: "100%", height: 52, borderRadius: 14, marginTop: 24 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── TERMINATE MODAL ───────────────────────────────────────────── */}
      {showTerminateModal && (
        <Modal visible={showTerminateModal} transparent animationType="fade">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
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
                <Text style={styles.modalTitle}>Terminate Family Goal?</Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    textAlign: "center",
                    marginBottom: 18,
                    lineHeight: 20,
                  }}
                >
                  You are about to close the{" "}
                  <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>{plan.name}</Text>{" "}
                  family pot. All accumulated funds will be returned to your main wallet balance.
                </Text>

                <Text style={[styles.inputLabel, { alignSelf: "flex-start" }]}>Enter PIN to Confirm</Text>
                <TextInput
                  style={[styles.textInput, { width: "100%", marginBottom: 20 }]}
                  placeholder="4-digit PIN"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  value={actionPin}
                  onChangeText={setActionPin}
                />

                <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                  <TouchableOpacity
                    onPress={() => setShowTerminateModal(false)}
                    disabled={isProcessing}
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
                    onPress={handleTerminateSubmit}
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 14,
                      backgroundColor: "#FEE2E2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#E53935" />
                    ) : (
                      <Text style={{ fontSize: 14, color: "#E53935", fontWeight: "700" }}>Terminate</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
      <KeyboardDoneAccessory />
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
    backgroundColor: TEAL_LIGHT,
  },
  sourceText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
});
