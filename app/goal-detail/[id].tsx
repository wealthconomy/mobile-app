import Header from "@/src/components/common/Header";
import { Trophy } from "@/src/components/icons/Trophy";
import { ThemedButton } from "@/src/components/ThemedButton";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Re-defining interface for local use
export interface WealthGoal {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  saved: string;
  progress: number;
  daysLeft: number;
  endDate: string;
  hasUpdate?: boolean;
  isCompleted?: boolean;
  automationFrequency: "Daily" | "Weekly" | "Monthly" | "Manual" | "One-time";
  source: string;
  progressiveAmount?: string;
}

// Minimal in-memory service for the detail page
const goalService = {
  getGoals: async (): Promise<WealthGoal[]> => {
    // Including same mocks for detail lookup
    const mockActive: WealthGoal[] = [
      {
        id: "mock-1",
        title: "Buy a Mac",
        subtitle: "Business",
        amount: "1,500,000.00",
        saved: "250,500.00",
        progress: 0.16,
        daysLeft: 120,
        endDate: "24th July 2026",
        automationFrequency: "Monthly",
        source: "Wealth Flex",
      },
      {
        id: "mock-3",
        title: "New Laptop",
        subtitle: "Education",
        amount: "500,000.00",
        saved: "350,000.00",
        progress: 0.7,
        daysLeft: 45,
        endDate: "15th May 2026",
        automationFrequency: "Weekly",
        source: "Bank Account",
        progressiveAmount: "₦50,000.00",
      },
      {
        id: "mock-4",
        title: "Emergency Fund",
        subtitle: "Savings",
        amount: "2,000,000.00",
        saved: "1,200,000.00",
        progress: 0.6,
        daysLeft: 200,
        endDate: "30th Oct 2026",
        automationFrequency: "Monthly",
        source: "Wealth Save",
      },
      {
        id: "mock-5",
        title: "Wedding Prep",
        subtitle: "Personal",
        amount: "5,000,000.00",
        saved: "500,000.00",
        progress: 0.1,
        daysLeft: 300,
        endDate: "12th Feb 2027",
        automationFrequency: "Monthly",
        source: "Wealth Flex",
      },
      {
        id: "mock-6",
        title: "Car Downpayment",
        subtitle: "Personal",
        amount: "3,000,000.00",
        saved: "1,500,000.00",
        progress: 0.5,
        daysLeft: 90,
        endDate: "30th June 2026",
        automationFrequency: "Monthly",
        source: "Wealth Save",
      },
    ];
    const mockCompleted: WealthGoal[] = [
      {
        id: "mock-2",
        title: "Summer Vacation",
        subtitle: "Vacation",
        amount: "800,000.00",
        saved: "800,000.00",
        progress: 1,
        daysLeft: 0,
        endDate: "12th Dec 2025",
        automationFrequency: "Monthly",
        source: "Wealth Save",
        isCompleted: true,
      },
      {
        id: "mock-7",
        title: "Rent 2025",
        subtitle: "Rent",
        amount: "1,200,000.00",
        saved: "1,200,000.00",
        progress: 1,
        daysLeft: 0,
        endDate: "1st Jan 2025",
        automationFrequency: "Monthly",
        source: "Wealth Flex",
        isCompleted: true,
      },
      {
        id: "mock-8",
        title: "Side Project",
        subtitle: "Business",
        amount: "200,000.00",
        saved: "200,000.00",
        progress: 1,
        daysLeft: 0,
        endDate: "15th Nov 2024",
        automationFrequency: "One-time",
        source: "Wealth Save",
        isCompleted: true,
      },
      {
        id: "mock-9",
        title: "Courses",
        subtitle: "Education",
        amount: "50,000.00",
        saved: "50,000.00",
        progress: 1,
        daysLeft: 0,
        endDate: "10th Oct 2024",
        automationFrequency: "Daily",
        progressiveAmount: "₦50,000.00",
        source: "Wealth Flex",
        isCompleted: true,
      },
    ];
    // Apply dummy progressiveAmount to all mocks
    return [...mockActive, ...mockCompleted].map((g) => ({
      ...g,
      progressiveAmount: "₦50,000.00",
    }));
  },
};

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [goal, setGoal] = useState<WealthGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  const PINK = "#FA85C0";
  const TEAL = "#0B575B";

  useEffect(() => {
    const loadGoal = async () => {
      const allGoals = await goalService.getGoals();
      const found = allGoals.find((g) => g.id === id);
      setGoal(found || null);
      setLoading(false);
    };
    loadGoal();
  }, [id]);

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

  const isCompleted = goal.isCompleted;

  const handleTerminate = () => {
    setShowTerminateModal(false);
    router.replace("/(tabs)/portfolios/wealth-goal");
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
            {goal.title}
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 14, marginBottom: 16 }}>
            {goal.subtitle}
          </Text>
          <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 28 }}>
            ₦{goal.saved}
          </Text>
        </View>
        <Image
          source={require("../../assets/images/arrow.png")}
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
              width: `${Math.max(goal.progress * 100, 2)}%`,
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
            {Math.round(goal.progress * 100)}%
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13, fontWeight: "500" }}>
            {goal.daysLeft} days Left
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
          source={require("../../assets/images/success.png")}
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
          "₦{goal.amount}"
        </Text>{" "}
        has been deposited into your Wealth Save account by {goal.endDate}.
      </Text>
    </View>
  );

  const formatAmount = (val: string | number) => {
    if (!val) return "0.00";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

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
                <Text style={styles.value}>₦{formatAmount(goal.amount)}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Category</Text>
                <Text style={styles.value}>{goal.subtitle}</Text>
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
                <Text style={styles.value}>₦2,463,00</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Progressive Amount</Text>
                <Text style={styles.value}>{goal.progressiveAmount}</Text>
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
                <Text style={styles.value}>{goal.source || "WinUp"}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.value}>{goal.endDate}</Text>
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
                  {goal.automationFrequency || "Monthly"}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Method</Text>
                <Text style={styles.value}>
                  {goal.automationFrequency === "Manual"
                    ? "Manual"
                    : "Automation"}
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
                  onPress={() =>
                    router.push({
                      pathname: "/top-up",
                      params: { portfolioName: "WealthGoal" },
                    })
                  }
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
                  onPress={() => setShowTerminateModal(true)}
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
              source={require("../../assets/images/terminate.png")}
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
              Terminate Wealth Fund?
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
                {goal.title}
              </Text>{" "}
              portfolio. This fund was created to secure a future legacy.
              {"\n\n"}
              Please note: Closing this will stop all automated goal
              contributions. We recommend moving these funds to Wealth Flex
              instead of withdrawing to keep the "Goal Wealth" habit alive.
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
                  width: 163,
                  height: 50,
                  borderRadius: 15,
                  borderWidth: 0.8,
                  borderColor: "#CDCDCD",
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#747474", fontWeight: "500" }}
                >
                  Keep building Legacy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTerminate}
                style={{
                  width: 163,
                  height: 50,
                  borderRadius: 15,
                  backgroundColor: "#FFD7D4",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#F44336", fontWeight: "500" }}
                >
                  Close goal
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
});

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
