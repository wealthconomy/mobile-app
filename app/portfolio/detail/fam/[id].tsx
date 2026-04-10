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

const PURPLE = "#560FF1";
const PURPLE_LIGHT = "#F3EEFF";
const TEAL = "#0B575B";

interface FamPlan {
  id: string;
  title: string;
  subtitle: string;
  members: string;
  category: string;
  amount: string;
  saved: string;
  progress: number;
  daysLeft: number;
  endDate: string;
  automationFrequency: "Manual" | "Automation";
  source: string;
  wealthGrowth: string;
  wealthGrowsInto: string;
  progressiveAmount: string;
}

const famService = {
  getPlans: async (): Promise<FamPlan[]> => {
    const base = {
      automationFrequency: "Manual" as const,
      source: "WealthFlex",
      wealthGrowth: "₦2,463.00",
      wealthGrowsInto: "WinUp",
      endDate: "31st Dec 2026",
      members: "Adeyemi, Juliet and Joy",
      category: "Kids",
      progressiveAmount: "₦50,000.00",
    };
    return [
      {
        ...base,
        id: "fam-1",
        title: "Wealth for Kids",
        subtitle: "Kids",
        amount: "50,373.28",
        saved: "40,298.00",
        progress: 0.8,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fam-2",
        title: "Wealth for Kids",
        subtitle: "Kids",
        amount: "50,373.28",
        saved: "30,223.00",
        progress: 0.6,
        daysLeft: 80,
      },
      {
        ...base,
        id: "fam-3",
        title: "Spouse Savings",
        subtitle: "Spouse",
        members: "Precious Grace",
        category: "Spouse",
        amount: "50,373.28",
        saved: "40,298.00",
        progress: 0.8,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fam-4",
        title: "Spouse Savings",
        subtitle: "Spouse",
        members: "Precious Grace",
        category: "Spouse",
        amount: "50,373.28",
        saved: "30,223.00",
        progress: 0.6,
        daysLeft: 120,
      },
      {
        ...base,
        id: "fam-5",
        title: "Care for Parents",
        subtitle: "Parents",
        members: "Baba & Mama Adeyemi",
        category: "Parents",
        amount: "75,000.00",
        saved: "25,000.00",
        progress: 0.33,
        daysLeft: 200,
      },
      {
        ...base,
        id: "fam-c1",
        title: "Wealth for Kids",
        subtitle: "Kids",
        amount: "143,736.00",
        saved: "143,736.00",
        progress: 1.0,
        daysLeft: 0,
      },
      {
        ...base,
        id: "fam-c2",
        title: "Spouse Savings",
        subtitle: "Spouse",
        members: "Precious Grace",
        category: "Spouse",
        amount: "104,736.00",
        saved: "104,736.00",
        progress: 1.0,
        daysLeft: 0,
      },
      {
        ...base,
        id: "fam-c3",
        title: "Wealth for Kids",
        subtitle: "Kids",
        amount: "143,736.00",
        saved: "143,736.00",
        progress: 1.0,
        daysLeft: 0,
      },
      {
        ...base,
        id: "fam-c4",
        title: "Sibling Support",
        subtitle: "Siblings",
        members: "Tunde Adeyemi",
        category: "Siblings",
        amount: "80,000.00",
        saved: "80,000.00",
        progress: 1.0,
        daysLeft: 0,
      },
    ];
  },
};

export default function FamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<FamPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    famService.getPlans().then((plans) => {
      setPlan(plans.find((p) => p.id === id) || null);
      setLoading(false);
    });
  }, [id]);

  const [showTerminateModal, setShowTerminateModal] = useState(false);

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
    router.replace("/(tabs)/portfolios/wealth-fam");
  };

  // ─── ONGOING HEADER (mirrors fix-detail locked header) ───────────────────
  const renderOngoingHeader = () => (
    <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
      {/* Title, members, amount & image row */}
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
            {plan.members}
          </Text>
          <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 28 }}>
            ₦{plan.saved}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>
            of ₦{plan.amount} target
          </Text>
        </View>
        <Image
          source={require("../../../../assets/images/fam1.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>

      {/* Progress bar */}
      <View style={{ width: "100%" }}>
        <View
          style={{
            height: 10,
            borderRadius: 20,
            backgroundColor: PURPLE_LIGHT,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: `${Math.max(progressPct, 2)}%`,
              height: 10,
              borderRadius: 20,
              backgroundColor: PURPLE,
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

      {/* Divider */}
      <View
        style={{ height: 1, backgroundColor: "#EEEEEE", marginBottom: 28 }}
      />
    </View>
  );

  // ─── COMPLETED HEADER (mirrors fix-detail unlocked header) ───────────────
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
        <Text style={{ fontSize: 24, marginRight: 8 }}>🎉</Text>
        <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 26 }}>
          Plan Completed!
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
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>WealthFam</Text>{" "}
        plan for{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          {plan.members}
        </Text>{" "}
        has matured. Your{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          ₦{plan.amount}
        </Text>{" "}
        has been sent to your WinUp wallet! 🏆
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
          {/* Header section */}
          {isCompleted ? renderCompletedHeader() : renderOngoingHeader()}

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
            {/* Row 1: Category & Target Amount */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Family Category</Text>
                <Text style={styles.value}>{plan.category}</Text>
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

            {/* Row 3: Members & End Date */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Family Members</Text>
                <Text style={styles.value}>{plan.members}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.value}>{plan.endDate}</Text>
              </View>
            </View>

            {/* Row 4: Method & Wealth from */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Method</Text>
                <Text style={styles.value}>{plan.automationFrequency}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Wealth from</Text>
                <Text style={styles.value}>{plan.source}</Text>
              </View>
            </View>

            {/* Row 5: Wealth grows Into */}
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Wealth grows Into</Text>
              <Text style={styles.value}>{plan.wealthGrowsInto}</Text>
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

          {/* Divider after jagged edge */}
          <View
            style={{
              height: 1,
              backgroundColor: "#EEEEEE",
              marginTop: 12,
              marginBottom: 28,
              marginHorizontal: 20,
            }}
          />

          {/* Action buttons */}
          <View style={{ paddingHorizontal: 20 }}>
            {!isCompleted && (
              <>
                <ThemedButton
                  title="TopUp Wealth"
                  onPress={() =>
                    router.push({
                      pathname: "/wallet/top-up",
                      params: { portfolioName: "WealthFam" },
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
              Terminate Family Fund?
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
              Please note: Closing this will stop all automated family
              contributions. We recommend moving these funds to Wealth Flex
              instead of withdrawing to keep the "Family Wealth" habit alive.
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
