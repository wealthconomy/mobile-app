import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { PortfolioPreferenceMenu } from "@/src/components/common/PortfolioPreferenceMenu";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useGetPortfoliosQuery } from "@/src/store/api/portfolioApi";
import { Portfolio } from "@/src/types/portfolio";

const THEME = "#005F61"; // Dark teal for text/buttons
const THEME_BG = "#D5EDFF"; // Theme light blue

interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  category: string;
  amount: string;
}

const CATEGORIES: Category[] = [
  {
    id: "daily",
    title: "Daily Wins",
    subtitle:
      "Perfect for small, consistent contributions that build up quickly.",
    icon: "sunny-outline",
    iconBg: "white",
    iconColor: "#0EA5E9",
    category: "Daily",
    amount: "5,000",
  },
  {
    id: "weekly",
    title: "Weekly Milestones",
    subtitle:
      "Ideal for those who receive weekly payments or want to track progress.",
    icon: "calendar-clear-outline",
    iconBg: "white",
    iconColor: "#EF4444",
    category: "Weekly",
    amount: "25,000",
  },
  {
    id: "monthly",
    title: "Monthly Momentum",
    subtitle:
      "Best for salary earners to automate their 'Wealth First' decision.",
    icon: "trending-up-outline",
    iconBg: "white",
    iconColor: "#10B981",
    category: "Monthly",
    amount: "100,000",
  },
  {
    id: "custom",
    title: "Add & Customize",
    subtitle: "Choose and setup your own Wealth Auto.",
    icon: "add-outline",
    iconBg: "white",
    iconColor: "#155D5F",
    category: "Custom",
    amount: "",
  },
];

export default function WealthFlowScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">(
    "ongoing",
  );

  const portfolioPreference = useSelector(
    (state: RootState) => state.portfolioPreference.flow
  );
  const showInterest = portfolioPreference !== "Impact Wealth";

  const { data, isLoading: loading } = useGetPortfoliosQuery({ type: "wealthflow" });
  const allGoals = data?.items || [];

  const ongoingPlans = allGoals.filter((g) => g.status === "ACTIVE" && parseFloat(g.balance || "0") > 0);
  const completedPlans = allGoals.filter((g) => g.status === "COMPLETED" || g.status === "TERMINATED" || (g.status === "ACTIVE" && parseFloat(g.balance || "0") === 0));

  const formatAmount = (val?: string) => {
    if (!val) return "0.00";
    const amountNum = parseFloat(val) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const totalBalance = allGoals.reduce((sum, g) => sum + parseFloat(g.balance || "0"), 0);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <Header
          title="WealthFlow"
          onBack={() => router.back()}
          rightElement={<PortfolioPreferenceMenu portfolioType="flow" />}
        />
        <PortfolioDetailSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header
        title="WealthFlow"
        onBack={() => router.back()}
        rightElement={<PortfolioPreferenceMenu portfolioType="flow" />}
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-2">
          {/* ── Hero Card ────────────────────────────────────────── */}
          <View
            className="relative overflow-hidden mb-8"
            style={{
              width: 365,
              height: 170,
              borderTopLeftRadius: 50,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 50,
              borderBottomLeftRadius: 20,
              backgroundColor: THEME_BG,
              shadowColor: "#323232",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 13,
              elevation: 5,
              alignSelf: "center",
            }}
          >
            <Image
              source={require("../../../assets/images/auto.png.png")}
              className="absolute"
              style={{
                width: 180,
                height: 180,
                right: -40,
                top: -10,
                opacity: 0.3,
              }}
              resizeMode="contain"
            />

            <View
              style={{ position: "absolute", top: 25, left: 20, zIndex: 10 }}
            >
              <View
                className="flex-row items-center justify-between mb-1"
                style={{ width: 280 }}
              >
                <Text className="text-[#1A1A1A] text-[13px] font-medium opacity-80">
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
                    amount={`₦${formatAmount(totalBalance.toString())}`}
                    fontSize={31}
                    color="#1A1A1A"
                  />
                ) : (
                  <Text className="text-[#1A1A1A] text-[31px] font-extrabold tracking-tight">
                    ••••••••
                  </Text>
                )}
              </View>

              {showInterest && (
                <View className="flex-row items-center space-x-1">
                  <Text className="text-[#1A1A1A] text-[12px] font-medium opacity-70">
                    Your wealth grew to ₦0.00 today
                  </Text>
                  <Text className="text-[#4CAF50] text-[15px] font-bold">↑</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              className="absolute bg-white items-center justify-center"
              style={{
                width: 160,
                height: 40,
                borderRadius: 18,
                bottom: 20,
                right: 20,
                elevation: 3,
                zIndex: 20,
              }}
              onPress={() => router.push("/portfolio/create/flow")}
            >
              <Text style={{ color: THEME }} className="font-bold text-[14px]">
                Create a WealthFlow
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Tips Box ─────────────────────────────────────────── */}
          {showTips && (
            <View
              className="relative rounded-[24px] p-6 mb-8"
              style={{ backgroundColor: THEME_BG }}
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
                What's on WealthFlow? 🚀
              </Text>
              <Text
                className="text-[10px] leading-[15px] mb-4"
                style={{ color: THEME }}
              >
                To make saving effortless and consistent,{" "}
                <Text className="font-bold">Wealth Flow</Text> allows you to put
                your{" "}
                <Text className="font-bold">wealth-building on autopilot.</Text>{" "}
                It is designed to{" "}
                <Text className="font-bold">remove the "decision fatigue"</Text>{" "}
                of saving manually, ensuring you stay disciplined without having
                to remember.
              </Text>
            </View>
          )}

          {/* ── Category Grid (2x2) ───────────────────────────────── */}
          <View className="mb-8">
            <Text className="text-[18px] font-bold text-[#323232] mb-4">
              Categories of Wealth Flow
            </Text>
            <View
              className="flex-row flex-wrap justify-between"
              style={{ gap: 12 }}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={{
                    width: "48%",
                    height: 114,
                    backgroundColor: THEME_BG,
                    borderRadius: 15,
                    padding: 12,
                    justifyContent: "center",
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/portfolio/create/flow",
                      params: {
                        category: cat.title,
                        amount: cat.amount,
                        frequency: cat.category,
                        title: cat.id === "custom" ? "" : cat.title,
                      },
                    })
                  }
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      backgroundColor: cat.iconBg,
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={20}
                      color={cat.iconColor}
                    />
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
                    numberOfLines={2}
                  >
                    {cat.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Tabs ─────────────────────────────────────────────── */}
          <View
            style={{
              width: "100%",
              height: 40,
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 30,
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("ongoing")}
              activeOpacity={1}
              style={{
                width: "49%",
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor:
                  activeTab === "ongoing" ? THEME_BG : "transparent",
                borderBottomWidth: activeTab === "ongoing" ? 2 : 0,
                borderBottomColor: THEME,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: THEME,
                  fontSize: 13,
                  fontWeight: activeTab === "ongoing" ? "700" : "500",
                }}
              >
                Progress Tracking
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("completed")}
              activeOpacity={1}
              style={{
                width: "49%",
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor:
                  activeTab === "completed" ? THEME_BG : "transparent",
                borderBottomWidth: activeTab === "completed" ? 2 : 0,
                borderBottomColor: THEME,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: THEME,
                  fontSize: 13,
                  fontWeight: activeTab === "completed" ? "700" : "500",
                }}
              >
                Completed Wealth
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Plan List ────────────────────────────────────────── */}
          <View style={{ width: "100%" }}>
            {activeTab === "ongoing" ? (
              ongoingPlans.length === 0 ? (
                <EmptyState
                  icon="🏎️"
                  text="You haven't created a Wealth Flow yet!"
                  subtext="Start creating goals, your funds are locked until your defined target date is reached, preventing impulsive spending."
                />
              ) : (
                ongoingPlans.map((plan) => (
                  <AutoListItem key={plan.id} plan={plan} />
                ))
              )
            ) : completedPlans.length === 0 ? (
              <EmptyState
                icon="🏆"
                text="No completed plans yet"
                subtext="Your completed plans will appear here."
              />
            ) : (
              completedPlans.map((plan) => (
                <AutoListItem key={plan.id} plan={plan} isCompleted />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({
  icon,
  text,
  subtext,
}: {
  icon: string;
  text: string;
  subtext: string;
}) {
  const THEME_BG = "#D5EDFF";
  return (
    <View className="items-center justify-center py-20 px-10">
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: THEME_BG,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 32 }}>{icon}</Text>
      </View>
      <Text
        className="font-bold text-[16px] text-center mb-2"
        style={{ color: "#323232" }}
      >
        {text}
      </Text>
      <Text
        className="text-[11px] text-center opacity-70"
        style={{ color: "#6B7280" }}
      >
        {subtext}
      </Text>
    </View>
  );
}

function AutoListItem({
  plan,
  isCompleted,
}: {
  plan: Portfolio;
  isCompleted?: boolean;
}) {
  const THEME_BG = "#D5EDFF";
  
  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const amountNum = parseFloat(val) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const progress = isCompleted
    ? 1
    : parseFloat(plan.targetAmount) > 0
    ? parseFloat(plan.balance) / parseFloat(plan.targetAmount)
    : 0;

  const growthVal = isCompleted
    ? (plan as any).totalYieldEarned ??
      (plan as any).dailyGrowth ??
      (parseFloat(plan.targetAmount || "0") * 0.12).toString()
    : plan.dailyGrowth ?? plan.balance;
  
  const formattedDate = new Date(plan.maturityDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const getDaysLeft = () => {
    const end = new Date(plan.maturityDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/portfolio/detail/flow/[id]",
          params: { id: plan.id },
        })
      }
      className="mb-6 flex-row items-center border-b border-[#F3F4F6] pb-4"
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: THEME_BG,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 20 }}>
          {plan.metadata?.autoSaveFrequency === "DAILY" ? "⏰" : "📅"}
        </Text>
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-[14px] font-bold text-[#1A1A1A]">
            {plan.name}
          </Text>
          <Text className="text-[14px] font-bold text-[#1A1A1A]">
            ₦{formatAmount(plan.targetAmount)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-[10px] text-[#6B7280]">{plan.metadata?.category || "Flow"}</Text>
            <Text className="text-[10px] text-[#4CAF50] font-bold">
              Wealth growth ₦{formatAmount(growthVal.toString())} ↑
            </Text>
          </View>
          <View className="flex-1 max-w-[120px] ml-4">
            <View
              style={{
                height: 4,
                backgroundColor: THEME_BG,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.min(progress * 100, 100)}%`,
                  height: 4,
                  backgroundColor: isCompleted ? "#4CAF50" : "#0EA5E9",
                }}
              />
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-[10px] text-[#9CA3AF] opacity-80">
            {Math.round(Math.min(progress * 100, 100))}%
          </Text>
          <Text
            className="text-[10px] font-bold"
            style={{ color: isCompleted ? "#4CAF50" : "#9CA3AF" }}
          >
            {isCompleted ? "Saving Completed" : `${getDaysLeft()} Days Left`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
