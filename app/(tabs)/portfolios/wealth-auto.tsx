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

export default function WealthAutoScreen() {
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
      // Mock data based on screenshots
      const mockOngoing: WealthGoal[] = [
        {
          id: "auto-1",
          title: "Investment",
          subtitle: "Daily(₦5,000)",
          amount: "50,373.28",
          saved: "20,149.31",
          progress: 0.4,
          daysLeft: 70, // 10 weeks
          endDate: "24th Dec 2026",
          automationFrequency: "Daily",
          source: "WinUp",
        },
        {
          id: "auto-2",
          title: "Investment",
          subtitle: "Daily(₦5,000)",
          amount: "50,373.28",
          saved: "46,343.42",
          progress: 0.92,
          daysLeft: 7, // 1 week
          endDate: "24th Dec 2026",
          automationFrequency: "Daily",
          source: "WinUp",
        },
        {
          id: "auto-3",
          title: "Savings Plan",
          subtitle: "Weekly(₦10,000)",
          amount: "100,000.00",
          saved: "15,000.00",
          progress: 0.15,
          daysLeft: 9, // 9 weeks
          endDate: "12th June 2026",
          automationFrequency: "Weekly",
          source: "WealthFlex",
        },
        {
          id: "auto-4",
          title: "Emergency Fund",
          subtitle: "Monthly(₦50,000)",
          amount: "500,000.00",
          saved: "300,000.00",
          progress: 0.6,
          daysLeft: 4, // 4 months
          endDate: "30th Sept 2026",
          automationFrequency: "Monthly",
          source: "WinUp",
        },
        {
          id: "auto-5",
          title: "Investment Pro",
          subtitle: "Daily(₦2,000)",
          amount: "25,000.00",
          saved: "20,000.00",
          progress: 0.8,
          daysLeft: 3, // 3 weeks
          endDate: "20th May 2026",
          automationFrequency: "Daily",
          source: "WealthFlex",
        },
      ];

      const mockCompleted: WealthGoal[] = [
        {
          id: "auto-c1",
          title: "Investment",
          subtitle: "Daily(₦5,000)",
          amount: "143,736.00",
          saved: "143,736.00",
          progress: 1.0,
          daysLeft: 0,
          endDate: "24th Dec 2024",
          automationFrequency: "Daily",
          source: "WinUp",
          isCompleted: true,
        },
        {
          id: "auto-c2",
          title: "Summer Trip",
          subtitle: "Weekly(₦20,000)",
          amount: "200,000.00",
          saved: "200,000.00",
          progress: 1.0,
          daysLeft: 0,
          endDate: "15th Aug 2024",
          automationFrequency: "Weekly",
          source: "WealthFlex",
          isCompleted: true,
        },
        {
          id: "auto-c3",
          title: "Holiday Fund",
          subtitle: "Monthly(₦100,000)",
          amount: "1,200,000.00",
          saved: "1,200,000.00",
          progress: 1.0,
          daysLeft: 0,
          endDate: "1st Jan 2025",
          automationFrequency: "Monthly",
          source: "WinUp",
          isCompleted: true,
        },
        {
          id: "auto-c4",
          title: "Gadget Savings",
          subtitle: "Daily(₦1,000)",
          amount: "30,000.00",
          saved: "30,000.00",
          progress: 1.0,
          daysLeft: 0,
          endDate: "10th Nov 2024",
          automationFrequency: "Daily",
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
        <Header title="WealthAuto" onBack={() => router.back()} />
        <PortfolioDetailSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="WealthAuto" onBack={() => router.back()} />

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
                <Text className="text-[#1A1A1A] text-[12px] font-medium opacity-70">
                  Your wealth grew to ₦230.00 today
                </Text>
                <Text className="text-[#4CAF50] text-[15px] font-bold">↑</Text>
              </View>
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
              onPress={() => router.push("/portfolio/create/auto")}
            >
              <Text style={{ color: THEME }} className="font-bold text-[14px]">
                Create a WealthAuto
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
                What's on WealthAuto? 🚀
              </Text>
              <Text
                className="text-[10px] leading-[15px] mb-4"
                style={{ color: THEME }}
              >
                To make saving effortless and consistent,{" "}
                <Text className="font-bold">Wealth Auto</Text> allows you to put
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
              Categories of Wealth Auto
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
                      pathname: "/portfolio/create/auto",
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
                  text="You haven't created a Wealth Goal yet!"
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
  plan: WealthGoal;
  isCompleted?: boolean;
}) {
  const THEME_BG = "#D5EDFF";
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/portfolio/detail/auto/[id]",
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
          {plan.automationFrequency === "Daily" ? "⏰" : "📅"}
        </Text>
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-[14px] font-bold text-[#1A1A1A]">
            {plan.title}
          </Text>
          <Text className="text-[14px] font-bold text-[#1A1A1A]">
            ₦{plan.amount}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-[10px] text-[#6B7280]">{plan.subtitle}</Text>
            <Text className="text-[10px] text-[#4CAF50] font-bold">
              Wealth growth ₦2,463.00 | Progressive: ₦50,000.00 ℹ️
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
                  width: `${plan.progress * 100}%`,
                  height: 4,
                  backgroundColor: isCompleted ? "#4CAF50" : "#0EA5E9",
                }}
              />
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-[10px] text-[#9CA3AF] opacity-80">
            {Math.round(plan.progress * 100)}%
          </Text>
          <Text
            className="text-[10px] font-bold"
            style={{ color: isCompleted ? "#4CAF50" : "#9CA3AF" }}
          >
            {isCompleted ? "Saving Completed" : `${plan.daysLeft} Weeks Left`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
