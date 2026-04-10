import { WealthGoal } from "@/src/api/goalService";
import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = "#560FF1";
const THEME_BG = "#F3EEFF";
const THEME_CARD_BG = "#9C6EFF66";

const SUGGESTIONS = [
  {
    id: "kids",
    title: "Wealth for Kids",
    subtitle: `Start a university fund or a "head-start" nest egg for your children.`,
    icon: "👨‍👩‍👧‍👦",
    category: "Kids",
    amount: "3000",
    frequency: "Monthly",
  },
  {
    id: "spouse",
    title: "Spousal Savings",
    subtitle:
      "Work together with your partner toward shared family milestones.",
    icon: "💑",
    category: "Spouse",
    amount: "3000",
    frequency: "Monthly",
  },
  {
    id: "parents",
    title: "Care for Parents",
    subtitle: "Set aside funds to support and care for your aging parents.",
    icon: "👴👵",
    category: "Parents",
    amount: "5000",
    frequency: "Monthly",
  },
  {
    id: "siblings",
    title: "Sibling Support",
    subtitle: "Help a sibling with school fees, business, or personal goals.",
    icon: "🤝",
    category: "Siblings",
    amount: "2000",
    frequency: "Monthly",
  },
];

export default function WealthFamScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">(
    "ongoing",
  );
  const [ongoingPlans, setOngoingPlans] = useState<WealthGoal[]>([]);
  const [completedPlans, setCompletedPlans] = useState<WealthGoal[]>([]);

  useFocusEffect(
    useCallback(() => {
      const mockOngoing: WealthGoal[] = [
        {
          id: "fam-1",
          title: "Wealth for Kids",
          subtitle: "Adeyemi, Juliet and Joy",
          amount: "50,373.28",
          saved: "40,298.00",
          progress: 0.8,
          daysLeft: 54,
          endDate: "2nd Dec 2026",
          automationFrequency: "Monthly",
          source: "WealthFlex",
        },
        {
          id: "fam-2",
          title: "Wealth for Kids",
          subtitle: "Adeyemi, Juliet and Joy",
          amount: "50,373.28",
          saved: "30,223.00",
          progress: 0.6,
          daysLeft: 80,
          endDate: "2nd Dec 2026",
          automationFrequency: "Monthly",
          source: "WealthFlex",
        },
        {
          id: "fam-3",
          title: "Spouse Savings",
          subtitle: "Precious Grace",
          amount: "50,373.28",
          saved: "40,298.00",
          progress: 0.8,
          daysLeft: 54,
          endDate: "2nd Dec 2026",
          automationFrequency: "Monthly",
          source: "WealthFlex",
        },
        {
          id: "fam-4",
          title: "Spouse Savings",
          subtitle: "Precious Grace",
          amount: "50,373.28",
          saved: "30,223.00",
          progress: 0.6,
          daysLeft: 120,
          endDate: "2nd Dec 2026",
          automationFrequency: "Monthly",
          source: "WealthFlex",
        },
        {
          id: "fam-5",
          title: "Care for Parents",
          subtitle: "Baba & Mama Adeyemi",
          amount: "75,000.00",
          saved: "25,000.00",
          progress: 0.33,
          daysLeft: 200,
          endDate: "1st Jun 2027",
          automationFrequency: "Monthly",
          source: "WealthFlex",
        },
      ];

      const mockCompleted: WealthGoal[] = [
        {
          id: "fam-c1",
          title: "Wealth for Kids",
          subtitle: "Adeyemi, Juliet and Joy",
          amount: "143,736.00",
          saved: "143,736.00",
          progress: 1.0,
          daysLeft: 0,
          endDate: "2nd Dec 2024",
          automationFrequency: "Monthly",
          source: "WealthFlex",
          isCompleted: true,
        },
        {
          id: "fam-c2",
          title: "Spouse Savings",
          subtitle: "Precious Grace",
          amount: "104,736.00",
          saved: "104,736.00",
          progress: 1.0,
          daysLeft: 0,
          endDate: "2nd Dec 2024",
          automationFrequency: "Monthly",
          source: "WealthFlex",
          isCompleted: true,
        },
        {
          id: "fam-c3",
          title: "Wealth for Kids",
          subtitle: "Adeyemi, Juliet and Joy",
          amount: "143,736.00",
          saved: "143,736.00",
          progress: 1.0,
          daysLeft: 0,
          endDate: "2nd Dec 2024",
          automationFrequency: "Monthly",
          source: "WealthFlex",
          isCompleted: true,
        },
        {
          id: "fam-c4",
          title: "Sibling Support",
          subtitle: "Tunde Adeyemi",
          amount: "80,000.00",
          saved: "80,000.00",
          progress: 1.0,
          daysLeft: 0,
          endDate: "15th Aug 2024",
          automationFrequency: "Monthly",
          source: "WealthFlex",
          isCompleted: true,
        },
      ];

      setOngoingPlans(mockOngoing);
      setCompletedPlans(mockCompleted);
    }, []),
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <Header title="WealthFam" onBack={() => router.back()} />
        <PortfolioDetailSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="WealthFam" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-2">
          {/* ── Hero Card (same size/structure as WealthGoal) ─────── */}
          <View
            className="relative overflow-hidden mb-8"
            style={{
              width: 366,
              height: 180,
              borderRadius: 20,
              backgroundColor: THEME_CARD_BG,
              shadowColor: "#323232",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 13,
              elevation: 10,
              alignSelf: "center",
            }}
          >
            <Image
              source={require("../../../assets/images/fam.png")}
              className="absolute"
              style={{
                width: 200,
                height: 200,
                top: -17,
                left: 215,
                transform: [{ rotate: "368.33deg" }],
                opacity: 0.3,
              }}
              resizeMode="contain"
            />

            <View
              style={{
                position: "absolute",
                top: 28,
                left: 20,
                width: 326,
                zIndex: 10,
              }}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[#1A1A1A] text-[13px] font-medium opacity-90">
                  Total Savings
                </Text>
                <TouchableOpacity
                  onPress={() => setShowBalance(!showBalance)}
                  className="p-1"
                >
                  {showBalance ? (
                    <Eye size={18} color="#1A1A1A" />
                  ) : (
                    <EyeOff size={18} color="#1A1A1A" />
                  )}
                </TouchableOpacity>
              </View>

              <View className="flex-row items-baseline mb-1">
                {showBalance ? (
                  <BalanceText
                    amount="₦300,735.42"
                    fontSize={31}
                    color="#1A1A1A"
                  />
                ) : (
                  <Text className="text-[#1A1A1A] text-[31px] font-extrabold tracking-tight">
                    ••••••••
                  </Text>
                )}
              </View>

              <View className="flex-row items-center space-x-1">
                <Text className="text-[#1A1A1A] text-[12px] font-medium opacity-80">
                  Your wealth grew to ₦230.00 today
                </Text>
                <Text className="text-[#4CAF50] text-[15px] font-bold">↑</Text>
              </View>
            </View>

            <TouchableOpacity
              className="absolute bg-white items-center justify-center"
              style={{
                width: 200,
                height: 40,
                borderRadius: 10,
                bottom: 15,
                right: 20,
                elevation: 3,
                zIndex: 20,
              }}
              onPress={() => router.push("/portfolio/create/fam" as any)}
            >
              <Text style={{ color: THEME }} className="font-bold text-[14px]">
                Create a WealthFam
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Tips Box ──────────────────────────────────────────── */}
          {showTips && (
            <View
              className="rounded-[24px] p-6 mb-8"
              style={{ backgroundColor: "#EDE6FF" }}
            >
              <TouchableOpacity
                className="absolute right-4 top-4 z-10"
                onPress={() => setShowTips(false)}
              >
                <Ionicons name="close" size={20} color={THEME} />
              </TouchableOpacity>
              <Text
                className="font-extrabold text-[12px] mb-4"
                style={{ color: THEME }}
              >
                What's on WealthFam? 🏡✨
              </Text>
              <View>
                {[
                  {
                    title: "Automated Contributions:",
                    text: "Use the Wealth Auto feature to set daily, weekly, or monthly deposits into your family pots effortlessly.",
                  },
                  {
                    title: "Goal-Based Discipline:",
                    text: "Set specific amounts and timelines for family needs, like school fees or a family home.",
                  },
                  {
                    title: "Community-Driven Growth:",
                    text: "Leverage group saving options to reach family targets faster through collective discipline.",
                  },
                ].map((tip, i) => (
                  <View key={i} className="flex-row mb-3 items-start">
                    <Text className="mr-2 text-[10px]">✅</Text>
                    <Text
                      className="text-[10px] flex-1 leading-[15px]"
                      style={{ color: THEME }}
                    >
                      <Text className="font-bold">{tip.title}</Text> {tip.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Category Selector (same structure as WealthGoal) ───── */}
          <View className="mb-8">
            <Text className="text-[18px] font-bold text-[#323232] mb-4">
              Select a Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {SUGGESTIONS.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={{
                    width: 160,
                    height: 114,
                    backgroundColor: THEME_BG,
                    borderRadius: 15,
                    padding: 12,
                    marginRight: 15,
                    justifyContent: "center",
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/portfolio/create/fam",
                      params: {
                        category: cat.category,
                        amount: cat.amount,
                        frequency: cat.frequency,
                        title: cat.title,
                      },
                    })
                  }
                >
                  <View className="mb-2">
                    <Text className="text-[24px]">{cat.icon}</Text>
                  </View>
                  <Text
                    className="font-bold text-[14px] mb-0.5"
                    style={{ color: THEME }}
                  >
                    {cat.title}
                  </Text>
                  <Text
                    className="text-[9px] opacity-70"
                    style={{ color: THEME }}
                  >
                    {cat.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── HR Line ───────────────────────────────────────────── */}
          <View
            style={{
              height: 2,
              backgroundColor: "#EEEEEE",
              width: 365,
              alignSelf: "center",
              marginBottom: 30,
            }}
          />

          {/* ── Tabs (same structure as WealthGoal) ───────────────── */}
          <View
            style={{
              width: 365,
              height: 40,
              alignSelf: "center",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
            className="mb-8"
          >
            <TouchableOpacity
              onPress={() => setActiveTab("ongoing")}
              activeOpacity={1}
              style={{
                width: 182,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor:
                  activeTab === "ongoing" ? THEME_BG : "transparent",
                borderBottomWidth: activeTab === "ongoing" ? 2 : 0,
                borderBottomColor: THEME,
                borderTopLeftRadius: 15,
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: THEME,
                  fontSize: 12,
                  fontWeight: activeTab === "ongoing" ? "700" : "500",
                }}
              >
                Ongoing Plans
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("completed")}
              activeOpacity={1}
              style={{
                width: 182,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor:
                  activeTab === "completed" ? THEME_BG : "transparent",
                borderBottomWidth: activeTab === "completed" ? 2 : 0,
                borderBottomColor: THEME,
                borderTopLeftRadius: 15,
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: THEME,
                  fontSize: 12,
                  fontWeight: activeTab === "completed" ? "700" : "500",
                }}
              >
                Completed Plans
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Plan List (same structure as GoalListItem) ─────────── */}
          <View style={{ width: 355, alignSelf: "center" }}>
            {activeTab === "ongoing" ? (
              ongoingPlans.length === 0 ? (
                <View className="items-center justify-center py-20 px-10">
                  <Text className="text-[40px] mb-4">👨‍👩‍👧‍👦</Text>
                  <Text
                    className="font-bold text-[16px] mt-4 mb-2"
                    style={{ color: THEME }}
                  >
                    You haven't created a WealthFam yet!
                  </Text>
                  <Text
                    className="text-[11px] text-center opacity-60"
                    style={{ color: THEME }}
                  >
                    Start saving goals for the people you love.
                  </Text>
                </View>
              ) : (
                ongoingPlans.map((plan) => (
                  <FamListItem key={plan.id} plan={plan} isCompleted={false} />
                ))
              )
            ) : completedPlans.length === 0 ? (
              <View className="items-center justify-center py-20 px-10">
                <Text className="text-[#6B7280] italic">
                  No completed plans yet
                </Text>
              </View>
            ) : (
              completedPlans.map((plan) => (
                <FamListItem key={plan.id} plan={plan} isCompleted={true} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FamListItem({
  plan,
  isCompleted,
}: {
  plan: WealthGoal;
  isCompleted: boolean;
}) {
  const icon = plan.title.includes("Kids")
    ? "👨‍👩‍👧‍👦"
    : plan.title.includes("Spouse")
      ? "💑"
      : plan.title.includes("Parent")
        ? "👴"
        : "🤝";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/portfolio/detail/fam/[id]",
          params: { id: plan.id },
        })
      }
      style={{
        width: 355,
        height: 51,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        borderBottomWidth: 2,
        borderBottomColor: "#EEEEEE",
        marginBottom: 20,
        paddingBottom: 20,
      }}
    >
      {/* Icon Circle */}
      <View
        style={{
          width: 51,
          height: 51,
          borderRadius: 200,
          backgroundColor: THEME_BG,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>

      {/* Text Area */}
      <View style={{ width: 292, height: 51, justifyContent: "space-between" }}>
        {/* Row 1: Title & Amount */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1A1A" }}>
            {plan.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 12, marginRight: 2 }}>
              {isCompleted ? "🏆" : "🏡"}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1A1A" }}>
              ₦{plan.amount}
            </Text>
          </View>
        </View>

        {/* Row 2: Subtitle & Progress Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 9, color: "#9CA3AF" }}>
              {plan.subtitle} |{" "}
            </Text>
            <Text style={{ fontSize: 9, color: "#4CAF50", fontWeight: "700" }}>
              ₦{plan.saved}
            </Text>
            <Text style={{ fontSize: 10, color: "#4CAF50", marginLeft: 2 }}>
              ↑
            </Text>
            <Text style={{ fontSize: 9, color: "#9CA3AF" }}>
              {" "}
              | Progressive: ₦50,000.00
            </Text>
          </View>

          <View
            style={{
              width: 129,
              height: 4,
              borderRadius: 20,
              backgroundColor: THEME_BG,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${plan.progress * 100}%`,
                height: 4,
                backgroundColor: isCompleted ? "#4CAF50" : THEME,
              }}
            />
          </View>
        </View>

        {/* Row 3: End Date & Percent/Days */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 9, color: "#9CA3AF" }}>
            End Date: {plan.endDate}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: 129,
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 9, color: "#9CA3AF" }}>
              {Math.round(plan.progress * 100)}%
            </Text>
            <Text
              style={{
                fontSize: 9,
                color: isCompleted ? "#4CAF50" : "#9CA3AF",
                fontWeight: isCompleted ? "700" : "normal",
              }}
            >
              {isCompleted ? "Plan Achieved" : `${plan.daysLeft} days Left`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
