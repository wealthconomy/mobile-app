import Header from "@/src/components/common/Header";
import { Trophy } from "@/src/components/icons/Trophy";
import { ThemedButton } from "@/src/components/ThemedButton";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useGetPortfoliosQuery,
  useTerminatePortfolioMutation,
  useTopUpPortfolioMutation,
} from "@/src/store/api/portfolioApi";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminatePin, setTerminatePin] = useState("");
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpSource, setTopUpSource] = useState<"WALLET" | "CARD">("WALLET");

  const [terminatePortfolio, { isLoading: isTerminating }] = useTerminatePortfolioMutation();
  const [topUpPortfolio, { isLoading: isToppingUp }] = useTopUpPortfolioMutation();
  const { data, isLoading: loading, refetch: refetchPortfolios } = useGetPortfoliosQuery({ type: "wealthgoal" });
  const allGoals = data?.items || [];
  const goal = allGoals.find((g) => g.id === id);

  const PINK = "#FA85C0";
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
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: "#6B7280" }}>Goal not found</Text>
        <ThemedButton
          title="Go Back"
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        />
      </SafeAreaView>
    );
  }

  const isCompleted = goal.status === "COMPLETED" || parseFloat(goal.balance) >= parseFloat(goal.targetAmount);
  
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
    const amountNum = parseFloat(val) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const handleTerminate = async () => {
    if (terminatePin.length !== 4) {
      Alert.alert("Error", "Please enter your 4-digit Transaction PIN.");
      return;
    }

    try {
      await terminatePortfolio({ id: goal.id, body: { pin: terminatePin } }).unwrap();
      Alert.alert("Success", "Goal terminated and refunded successfully.");
      setShowTerminateModal(false);
      router.replace("/(tabs)/portfolios/wealth-goal");
    } catch (err: any) {
      console.error("Terminate portfolio failed:", err);
      Alert.alert("Failed", err?.data?.message || err?.message || "Invalid transaction PIN or request failed.");
    }
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
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Review" showBack={true} />

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
            {/* Row 1: Target Amount & Category */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Target Amount</Text>
                <Text style={styles.value}>₦{formatAmount(goal.targetAmount)}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Category</Text>
                <Text style={styles.value}>{goal.metadata?.category || "Goal"}</Text>
              </View>
            </View>

            {/* Row 2: Wealth Preference & Progressive Amount */}
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

            {/* Row 3: Funding Source & End Date */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Funding Source</Text>
                <Text style={styles.value}>{goal.metadata?.source || "Wealth Save"}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.value}>{formattedDate}</Text>
              </View>
            </View>

            {/* Row 4: Automation Frequency & Method */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Automation Frequency</Text>
                <Text style={styles.value}>
                  {goal.metadata?.autoSaveFrequency || "Monthly"}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Method</Text>
                <Text style={styles.value}>
                  {goal.metadata?.autoSave ? "Automation" : "Manual"}
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

          <View style={{ paddingHorizontal: 20 }}>
            {!isCompleted && (
              <>
                <ThemedButton
                  title="TopUp Wealth"
                  onPress={() => setShowTopUpModal(true)}
                  style={{
                    backgroundColor: TEAL,
                    borderRadius: 14,
                    height: 56,
                    marginBottom: 12,
                  }}
                />
                <View style={{ height: 100 }} />
                <ThemedButton
                  title="Terminate Progress"
                  onPress={() => {
                    setTerminatePin("");
                    setShowTerminateModal(true);
                  }}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 14,
                    height: 56,
                    borderWidth: 1,
                    borderColor: "#e4e4e4",
                  }}
                  textStyle={{ color: "#E53935", fontWeight: "700" }}
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* TopUp Modal */}
      {showTopUpModal && (
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
              source={require("../../../../assets/images/topup.png")}
              style={{ width: 80, height: 80, marginBottom: 12 }}
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
              Top Up {goal.name}
            </Text>
            
            <View style={{ width: "100%", marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "700", marginBottom: 6 }}>Amount (₦)</Text>
              <TextInput
                placeholder="e.g. 5000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                style={{
                  backgroundColor: "#F3F4F6",
                  height: 50,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  fontSize: 16,
                  color: "#1A1A1A",
                }}
              />
            </View>

            <View style={{ width: "100%", marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "700", marginBottom: 8 }}>Funding Source</Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setTopUpSource("WALLET")}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: topUpSource === "WALLET" ? TEAL : "#E5E7EB",
                    backgroundColor: topUpSource === "WALLET" ? "#EEF6F6" : "white",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: topUpSource === "WALLET" ? TEAL : "#4B5563" }}>Main Wallet</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowTopUpModal(false);
                  setTopUpAmount("");
                }}
                disabled={isToppingUp}
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
                <Text style={{ fontSize: 14, color: "#747474", fontWeight: "500" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTopUpSubmit}
                disabled={isToppingUp || !topUpAmount}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 15,
                  backgroundColor: TEAL,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, color: "white", fontWeight: "500" }}>
                  {isToppingUp ? "Topping up..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
              style={{ width: 100, height: 100, marginBottom: 12 }}
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
              Terminate Wealth Fund?
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                textAlign: "center",
                marginBottom: 16,
                lineHeight: 18,
              }}
            >
              You are about to close the{" "}
              <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
                {goal.name}
              </Text>{" "}
              portfolio. This fund was created to secure a future legacy.
              {"\n\n"}
              Please note: Closing this will stop all automated goal
              contributions. We recommend moving these funds to Wealth Flex
              instead of withdrawing to keep the "Goal Wealth" habit alive.
            </Text>

            <TextInput
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              value={terminatePin}
              onChangeText={setTerminatePin}
              style={{
                backgroundColor: "#F3F4F6",
                height: 48,
                width: "100%",
                borderRadius: 12,
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 20,
              }}
            />

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
                disabled={isTerminating}
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
                onPress={handleTerminate}
                disabled={isTerminating || terminatePin.length !== 4}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 15,
                  backgroundColor: "#FFD7D4",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#F44336", fontWeight: "500" }}
                >
                  {isTerminating ? "Closing..." : "Close goal"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
});
