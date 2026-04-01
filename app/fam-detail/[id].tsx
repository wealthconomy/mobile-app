import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
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
    };
    return [
      { ...base, id: "fam-1", title: "Wealth for Kids", subtitle: "Kids", amount: "50,373.28", saved: "40,298.00", progress: 0.8, daysLeft: 54 },
      { ...base, id: "fam-2", title: "Wealth for Kids", subtitle: "Kids", amount: "50,373.28", saved: "30,223.00", progress: 0.6, daysLeft: 80 },
      { ...base, id: "fam-3", title: "Spouse Savings", subtitle: "Spouse", members: "Precious Grace", category: "Spouse", amount: "50,373.28", saved: "40,298.00", progress: 0.8, daysLeft: 54 },
      { ...base, id: "fam-4", title: "Spouse Savings", subtitle: "Spouse", members: "Precious Grace", category: "Spouse", amount: "50,373.28", saved: "30,223.00", progress: 0.6, daysLeft: 120 },
      { ...base, id: "fam-5", title: "Care for Parents", subtitle: "Parents", members: "Baba & Mama Adeyemi", category: "Parents", amount: "75,000.00", saved: "25,000.00", progress: 0.33, daysLeft: 200 },
      { ...base, id: "fam-c1", title: "Wealth for Kids", subtitle: "Kids", amount: "143,736.00", saved: "143,736.00", progress: 1.0, daysLeft: 0 },
      { ...base, id: "fam-c2", title: "Spouse Savings", subtitle: "Spouse", members: "Precious Grace", category: "Spouse", amount: "104,736.00", saved: "104,736.00", progress: 1.0, daysLeft: 0 },
      { ...base, id: "fam-c3", title: "Wealth for Kids", subtitle: "Kids", amount: "143,736.00", saved: "143,736.00", progress: 1.0, daysLeft: 0 },
      { ...base, id: "fam-c4", title: "Sibling Support", subtitle: "Siblings", members: "Tunde Adeyemi", category: "Siblings", amount: "80,000.00", saved: "80,000.00", progress: 1.0, daysLeft: 0 },
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator style={{ flex: 1 }} color={PURPLE} />
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white", alignItems: "center", justifyContent: "center" }} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: "#6B7280" }}>Plan not found</Text>
      </SafeAreaView>
    );
  }

  const isCompleted = plan.progress >= 1.0;
  const progressPct = Math.round((plan.progress || 0) * 100);

  // ─── ONGOING HEADER (mirrors fix-detail locked header) ───────────────────
  const renderOngoingHeader = () => (
    <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
      {/* Title, members, amount & image row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 24, marginBottom: 4 }}>
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
          source={require("../../assets/images/fam1.png")}
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 28 }}>
          <Text style={{ color: "#9CA3AF", fontSize: 13, fontWeight: "500" }}>
            {progressPct}%
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13, fontWeight: "500" }}>
            {plan.daysLeft} days Left
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "#EEEEEE", marginBottom: 28 }} />
    </View>
  );

  // ─── COMPLETED HEADER (mirrors fix-detail unlocked header) ───────────────
  const renderCompletedHeader = () => (
    <View style={{ alignItems: "center", paddingHorizontal: 20, marginBottom: 28 }}>
      <View style={{ width: 220, height: 220, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <Image
          source={require("../../assets/images/success.png")}
          style={{ width: 220, height: 220, position: "absolute", opacity: 0.3 }}
          resizeMode="contain"
        />
        <Image
          source={require("../../assets/images/fam2.png")}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 24, marginRight: 8 }}>🎉</Text>
        <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 26 }}>
          Plan Completed!
        </Text>
        <Text style={{ fontSize: 24, marginLeft: 8 }}>🎉</Text>
      </View>

      <Text style={{ color: "#6B7280", textAlign: "center", fontSize: 14, lineHeight: 22, paddingHorizontal: 16 }}>
        Your <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>WealthFam</Text> plan for{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>{plan.members}</Text> has matured.
        Your <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>₦{plan.amount}</Text> has
        been sent to your WinUp wallet! 🏆
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
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              padding: 28,
              marginHorizontal: 20,
              marginBottom: 0,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 28 }}>
              <View>
                <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>Family Category</Text>
                <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>{plan.category}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>Target Amount</Text>
                <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>₦{plan.amount}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 28 }}>
              <View>
                <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>Family Members</Text>
                <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>{plan.members}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>Wealth from</Text>
                <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>{plan.source}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 28 }}>
              <View>
                <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>Wealth Growth</Text>
                <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>{plan.wealthGrowth}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>End Date</Text>
                <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>{plan.endDate}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <View>
                <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>Wealth grows Into</Text>
                <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>{plan.wealthGrowsInto}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>Method</Text>
                <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>{plan.automationFrequency}</Text>
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

          {/* Divider after jagged edge */}
          <View style={{ height: 1, backgroundColor: "#EEEEEE", marginTop: 12, marginBottom: 28, marginHorizontal: 20 }} />

          {/* Action buttons */}
     <View style={{ paddingHorizontal: 20 }}>
  {!isCompleted && (
    <ThemedButton
      title="TopUp Wealth"
      onPress={() => {}}
      style={{
        backgroundColor: "#155D5F",
        borderRadius: 14,
        height: 56,
        marginBottom: 100,
      }}
    />
  )}
  <ThemedButton
    title="Terminate Progress"
    onPress={() => router.back()}
    style={{
      backgroundColor: "white",
      borderRadius: 14,
      height: 56,
      borderWidth: 1,
      borderColor: "#e4e4e4ff",
    }}
    textStyle={{ color: "#E53935", fontWeight: "700" }}
  />
</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}