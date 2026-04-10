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

export interface WealthFix {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  saved: string;
  progress: number;
  daysLeft: number;
  endDate: string;
  automationFrequency: "Daily" | "Weekly" | "Monthly" | "Manual" | "One-time";
  source: string;
  lockDuration: string;
  wealthGrowth: string;
  wealthGrowsInto: string;
  progressiveAmount: string;
}

const fixService = {
  getFixes: async (): Promise<WealthFix[]> => {
    const base = {
      automationFrequency: "Manual" as const,
      source: "WealthFlex",
      lockDuration: "365 days",
      wealthGrowth: "₦2,453.00",
      wealthGrowsInto: "WinUp",
      endDate: "31th Dec 2023",
      progressiveAmount: "₦50,000.00",
    };
    return [
      {
        ...base,
        id: "fix-1",
        title: "House Rent",
        subtitle: "Business",
        amount: "3,000,000.00",
        saved: "2,400,000.00",
        progress: 0.8,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fix-2",
        title: "Wedding Clothes",
        subtitle: "Personal",
        amount: "1,234,144.00",
        saved: "863,900.00",
        progress: 0.7,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fix-3",
        title: "House Rent",
        subtitle: "Business",
        amount: "3,000,000.00",
        saved: "1,800,000.00",
        progress: 0.6,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fix-u1",
        title: "Wedding Clothes",
        subtitle: "Personal",
        amount: "3,000,000.00",
        saved: "3,000,000.00",
        progress: 1.0,
        daysLeft: 0,
      },
    ];
  },
};

export default function FixDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fix, setFix] = useState<WealthFix | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  const THEME_COLOR = "#D48E00";
  const TEAL = "#0B575B";

  useEffect(() => {
    const loadFix = async () => {
      const allFixes = await fixService.getFixes();
      const found = allFixes.find((f) => f.id === id);
      setFix(found || null);
      setLoading(false);
    };
    loadFix();
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

  const isUnlocked = fix.progress >= 1;

  const handleTerminate = () => {
    setShowTerminateModal(false);
    router.replace("/(tabs)/portfolios/wealth-fix");
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
            {fix.title}
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 14, marginBottom: 16 }}>
            {fix.subtitle}
          </Text>
          <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 28 }}>
            ₦{fix.saved}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>
            of ₦{fix.amount} target
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
              width: `${Math.max(fix.progress * 100, 2)}%`,
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
            {Math.round(fix.progress * 100)}%
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13, fontWeight: "500" }}>
            {fix.daysLeft} days Left
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
        has been{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          unlocked successfully
        </Text>
        , your{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          "₦{fix.amount}"
        </Text>{" "}
        is sent into your Wealth Save account by {fix.endDate}.
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
                <Text style={styles.value}>₦{fix.amount}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Lock Duration</Text>
                <Text style={styles.value}>{fix.lockDuration}</Text>
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
                <Text style={styles.value}>{fix.wealthGrowth}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Progressive Amount</Text>
                <Text style={styles.value}>{fix.progressiveAmount}</Text>
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
                  {fix.automationFrequency === "Manual"
                    ? "Manual"
                    : "Automation"}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.value}>{fix.endDate}</Text>
              </View>
            </View>

            {/* Row 4: Wealth grows Into & Wealth from */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Wealth grows Into</Text>
                <Text style={styles.value}>{fix.wealthGrowsInto}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.label}>Wealth from:</Text>
                <Text style={styles.value}>{fix.source}</Text>
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
            {!isUnlocked && (
              <>
                <ThemedButton
                  title="TopUp Wealth"
                  onPress={() =>
                    router.push({
                      pathname: "/wallet/top-up",
                      params: { portfolioName: "WealthFix" },
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
                {fix.title}
              </Text>{" "}
              portfolio. This fund was created to secure a future legacy.
              {"\n\n"}
              Please note: Closing this will stop all automated Fixed Wealth
              contributions. We recommend moving these funds to Wealth Flex
              instead of withdrawing to keep the "Fixed Wealth" habit alive.
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
