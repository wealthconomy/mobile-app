import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
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

const THEME_BLUE = "#D5EDFF";
const TEAL = "#0B575B";

interface AutoPlan {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  amount: string;
  saved: string;
  progress: number;
  daysLeft: number;
  endDate: string;
  automationFrequency: string;
  source: string;
  wealthGrowth: string;
  wealthGrowsInto: string;
  progressiveAmount: string;
}

const autoService = {
  getPlans: async (): Promise<AutoPlan[]> => {
    const base = {
      automationFrequency: "Daily",
      source: "WinUp",
      wealthGrowth: "₦2,463.00",
      wealthGrowsInto: "WinUp",
      endDate: "24th Dec 2026",
      category: "Investment",
      progressiveAmount: "₦50,000.00",
    };
    return [
      {
        ...base,
        id: "auto-1",
        title: "Investment",
        subtitle: "Daily(₦5,000)",
        amount: "50,373.28",
        saved: "20,149.31",
        progress: 0.4,
        daysLeft: 70,
      },
      {
        ...base,
        id: "auto-2",
        title: "Investment",
        subtitle: "Daily(₦5,000)",
        amount: "50,373.28",
        saved: "46,343.42",
        progress: 0.92,
        daysLeft: 7,
      },
      {
        ...base,
        id: "auto-c1",
        title: "Investment",
        subtitle: "Daily(₦5,000)",
        amount: "143,736.00",
        saved: "143,736.00",
        progress: 1.0,
        daysLeft: 0,
        endDate: "24th Dec 2024",
      },
    ];
  },
};

export default function AutoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<AutoPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  useEffect(() => {
    autoService.getPlans().then((plans) => {
      setPlan(plans.find((p) => p.id === id) || null);
      setLoading(false);
    });
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
        <Text style={{ color: "#6B7280" }}>Plan not found</Text>
      </SafeAreaView>
    );
  }

  const isCompleted = plan.progress >= 1.0;
  const progressPct = Math.round((plan.progress || 0) * 100);

  const handleTerminate = () => {
    setShowTerminateModal(false);
    router.replace("/(tabs)/portfolios/wealth-auto");
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
            {plan.title}
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}>
            {plan.subtitle}
          </Text>
          <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 28 }}>
            ₦{plan.saved}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>
            of ₦{plan.amount} target
          </Text>
        </View>
        <Image
          source={require("../../assets/images/auto.png.png")}
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
            {plan.daysLeft} days Left
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
          source={require("../../assets/images/success.png")}
          style={{
            width: 220,
            height: 220,
            position: "absolute",
            opacity: 0.3,
          }}
          resizeMode="contain"
        />
        <Image
          source={require("../../assets/images/auto1.png")}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Text style={{ fontSize: 24, marginRight: 8 }}>🏆</Text>
        <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 26 }}>
          Auto Save Completed!
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
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>WealthAuto</Text>{" "}
        plan for{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          {plan.title}
        </Text>{" "}
        has been successfully sent into your Wealth Save account.{"\n"}
        Current Wealth Save Balance:{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>₦XX,XXX.XX</Text>
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
                <Text style={styles.label}>Title</Text>
                <Text style={styles.value}>{plan.title}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Target Amount</Text>
                <Text style={styles.value}>₦{plan.amount}</Text>
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
                <Text style={styles.value}>{plan.wealthGrowth}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Progressive Amount</Text>
                <Text style={styles.value}>{plan.progressiveAmount}</Text>
              </View>
            </View>

            {/* Row 3: Frequency & End Date */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Frequency</Text>
                <Text style={styles.value}>{plan.automationFrequency}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.value}>{plan.endDate}</Text>
              </View>
            </View>

            {/* Row 4: Wealth grow Into & Wealth from */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Wealth grow Into</Text>
                <Text style={styles.value}>WinUp</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Wealth from</Text>
                <Text style={styles.value}>{plan.source}</Text>
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
                      params: { portfolioName: "WealthAuto" },
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
              Terminate Auto Fund?
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
                {plan.title}
              </Text>{" "}
              portfolio. This fund was created to secure a future legacy.
              {"\n\n"}
              Please note: Closing this will stop all automated auto
              contributions. We recommend moving these funds to Wealth Flex
              instead of withdrawing to keep the "Auto Wealth" habit alive.
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
