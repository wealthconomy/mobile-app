import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { useGetPortfoliosQuery, useGetPortfolioTransactionsQuery } from "@/src/store/api/portfolioApi";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FixDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");

  const { data, isLoading: loading } = useGetPortfoliosQuery({ type: "wealthfix" });
  const allFixes = data?.items || [];
  const fix = allFixes.find((f) => f.id === id);

  const { data: txnsData, isLoading: txnsLoading } = useGetPortfolioTransactionsQuery(
    { id: id as string },
    { skip: !id }
  );

  const THEME_COLOR = "#D48E00";
  const TEAL = "#0B575B";

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
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: "#6B7280" }}>Fix not found</Text>
      </SafeAreaView>
    );
  }

  const isUnlocked =
    fix.status === "COMPLETED" ||
    fix.status === "TERMINATED" ||
    new Date(fix.maturityDate).getTime() <= Date.now();

  const isWithdrawn = parseFloat(fix.balance || "0") <= 0;

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
    const amountNum = parseFloat(val) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const growthVal = isUnlocked
    ? (fix as any).totalYieldEarned ??
      (fix as any).dailyGrowth ??
      (parseFloat(fix.targetAmount || "0") * 0.15).toString()
    : fix.dailyGrowth ?? fix.balance;

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
    router.push({
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
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Review" showBack={true} />

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
                <Text style={styles.value}>
                  {fix.metadata?.fundingSource || "Main Wallet"}
                </Text>
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
            {!isUnlocked ? (
              <>
                <ThemedButton
                  title="TopUp Wealth"
                  onPress={() => setShowTopUpModal(true)}
                  style={{
                    backgroundColor: TEAL,
                    borderRadius: 14,
                    height: 56,
                    marginBottom: 16,
                  }}
                />
                <ThemedButton
                  title="Terminate Fixed Fund"
                  onPress={() => setShowTerminateModal(true)}
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
            ) : !isWithdrawn ? (
              <ThemedButton
                title="Withdraw All to Wallet"
                onPress={handleProceedWithdraw}
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
                  Funds Transferred to Wallet
                </Text>
                <Text
                  style={{
                    color: "#15803D",
                    fontSize: 12,
                    textAlign: "center",
                    lineHeight: 18,
                  }}
                >
                  All matured funds from this fixed plan have been successfully withdrawn into your Main Wallet.
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
                      {txn.description || txn.type || "Transaction"}
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
                      fontSize: 14,
                      color:
                        txn.type === "DEPOSIT" || txn.type === "INTEREST"
                          ? "#10B981"
                          : "#EF4444",
                    }}
                  >
                    {txn.type === "DEPOSIT" || txn.type === "INTEREST"
                      ? "+"
                      : "-"}
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
      <Modal visible={showTopUpModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 24,
              width: "100%",
              maxWidth: 340,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}>
                Top Up WealthFix
              </Text>
              <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}>
              Enter amount to top up into {fix.name}:
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#1A1A1A",
                  marginRight: 6,
                }}
              >
                ₦
              </Text>
              <TextInput
                placeholder="5,000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#1A1A1A",
                }}
              />
            </View>

            <ThemedButton
              title="Continue to PIN"
              onPress={handleProceedTopUp}
              style={{ backgroundColor: TEAL, borderRadius: 14, height: 50 }}
            />
          </View>
        </View>
      </Modal>

      {/* Terminate Modal */}
      {showTerminateModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            zIndex: 100,
          }}
        >
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
              style={{ width: 120, height: 120, marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "900",
                color: "#1A1A1A",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Terminate Fixed Fund?
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                textAlign: "center",
                marginBottom: 28,
                lineHeight: 20,
              }}
            >
              You are about to close the{" "}
              <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
                {fix.name}
              </Text>{" "}
              portfolio. This fund was created to secure a future legacy.
              {"\n\n"}
              Please note: Closing this will return all accumulated funds to your
              Main Wallet with early breaking terms.
            </Text>
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
                  Terminate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
});
