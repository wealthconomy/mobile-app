import { goalService, WealthGoal } from "@/src/api/goalService";
import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
  { id: "1", title: "Rent", subtitle: "Stay ahead of your landlord" },
  { id: "2", title: "Business", subtitle: "Fund your entrepreneurship dreams" },
  { id: "3", title: "School Fees", subtitle: "Fund your education dreams" },
  { id: "4", title: "Vacation", subtitle: "Save for your dream trip" },
];

export default function WealthGoalScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState("tracking"); // 'tracking' or 'completed'
  const [activeGoals, setActiveGoals] = useState<WealthGoal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<WealthGoal[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadGoals = async () => {
        const realGoals = await goalService.getGoals();

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
            source: "Wealth Flex",
            isCompleted: true,
          },
        ];

        const allActive = [
          ...mockActive,
          ...realGoals.filter((g) => !g.isCompleted),
        ];
        const allCompleted = [
          ...mockCompleted,
          ...realGoals.filter((g) => g.isCompleted),
        ];

        setActiveGoals(allActive);
        setCompletedGoals(allCompleted);
      };
      loadGoals();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="WealthGoal" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-2">
          {/* Main Card */}
          <View
            className="relative overflow-hidden mb-8"
            style={{
              width: 366,
              height: 180,
              borderRadius: 20,
              backgroundColor: "#F3007A33",
              shadowColor: "#323232",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 13,
              elevation: 10,
              alignSelf: "center",
            }}
          >
            <Image
              source={require("../../../assets/images/arrow.png")}
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

              <TouchableOpacity
                onPress={() => router.push("/win-up" as any)}
                activeOpacity={0.8}
                className="flex-row items-baseline mb-1"
              >
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
                <Text className="text-[#1A1A1A] text-[34px] font-light ml-4 mb-1">
                  ›
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center space-x-1">
                <Text className="text-[#1A1A1A] text-[12px] font-medium opacity-80">
                  Your wealth grew by N230.00 today
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
              onPress={() => router.push("/create-goal" as any)}
            >
              <Text className="text-[#F3007A] font-bold text-[14px]">
                Create a WealthGoal
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tips Box */}
          {showTips && (
            <View
              className="rounded-[24px] p-6 mb-8"
              style={{ backgroundColor: "#FFE6F2B2" }}
            >
              <TouchableOpacity
                className="absolute right-4 top-4 z-10"
                onPress={() => setShowTips(false)}
              >
                <Ionicons name="close" size={20} color="#F3007A" />
              </TouchableOpacity>
              <Text
                className="font-extrabold text-[12px] mb-4"
                style={{ color: "#F3007A" }}
              >
                What’s New on Wealth Goal? 🎯✨
              </Text>
              <View>
                {[
                  {
                    title: "Targeted Discipline:",
                    text: 'It helps users "smash every target" by providing a dedicated space for specific financial needs like rent, business startup costs, or education.',
                  },
                  {
                    title: "Visual Progress:",
                    text: 'The platform uses progress bars and milestone tracking to help users visualize their journey toward their "Win".',
                  },
                  {
                    title: "Blocked Temptation:",
                    text: "To ensure success, funds are locked until the user-defined target date is reached, preventing impulsive spending.",
                  },
                ].map((tip, i) => (
                  <View key={i} className="flex-row mb-3 items-start">
                    <Text className="mr-2 text-[10px]">✅</Text>
                    <Text
                      className="text-[10px] flex-1 leading-[15px]"
                      style={{ color: "#F3007A" }}
                    >
                      <Text className="font-bold">{tip.title}</Text> {tip.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Category Selector */}
          <View className="mb-8">
            <Text className="text-[18px] font-bold text-[#323232] mb-4">
              Select a Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={{
                    width: 160,
                    height: 114,
                    backgroundColor: "#FFEEF7",
                    borderRadius: 15,
                    padding: 12,
                    marginRight: 15,
                    justifyContent: "center",
                  }}
                  onPress={() =>
                    router.push(`/create-goal?category=${cat.title}` as any)
                  }
                >
                  <View className="mb-2">
                    {cat.title === "Rent" && (
                      <Text className="text-[24px]">🏠</Text>
                    )}
                    {cat.title === "Business" && (
                      <Text className="text-[24px]">💼</Text>
                    )}
                    {cat.title === "School Fees" && (
                      <Text className="text-[24px]">🎓</Text>
                    )}
                    {cat.title === "Vacation" && (
                      <Text className="text-[24px]">✈️</Text>
                    )}
                  </View>
                  <Text
                    className="font-bold text-[14px] mb-0.5"
                    style={{ color: "#F3007A" }}
                  >
                    {cat.title}
                  </Text>
                  <Text
                    className="text-[9px] opacity-70"
                    style={{ color: "#F3007A" }}
                  >
                    {cat.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* HR Line After Categories */}
          <View
            style={{
              height: 2,
              backgroundColor: "#EEEEEE",
              width: 365,
              alignSelf: "center",
              marginBottom: 30,
            }}
          />

          {/* Goal Tabs */}
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
              onPress={() => setActiveTab("tracking")}
              activeOpacity={1}
              style={{
                width: 182,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor:
                  activeTab === "tracking" ? "#FFEEF7" : "transparent",
                borderBottomWidth: activeTab === "tracking" ? 2 : 0,
                borderBottomColor: "#F3007A",
                borderTopLeftRadius: 15,
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: "#F3007A",
                  fontSize: 12,
                  fontWeight: activeTab === "tracking" ? "700" : "500",
                }}
              >
                Progress Tracking
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
                  activeTab === "completed" ? "#FFEEF7" : "transparent",
                borderBottomWidth: activeTab === "completed" ? 2 : 0,
                borderBottomColor: "#F3007A",
                borderTopLeftRadius: 15, // Mirror the design
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: "#F3007A",
                  fontSize: 12,
                  fontWeight: activeTab === "completed" ? "700" : "500",
                }}
              >
                Completed Goals
              </Text>
            </TouchableOpacity>
          </View>

          {/* Goal List (PIXEL PERFECT) */}
          <View style={{ width: 355, alignSelf: "center" }}>
            {activeTab === "tracking" ? (
              activeGoals.length === 0 ? (
                <View className="items-center justify-center py-20 px-10">
                  <MaterialCommunityIcons
                    name="target"
                    size={32}
                    color="#F3007A"
                  />
                  <Text className="text-[#F3007A] font-bold text-[16px] mt-4 mb-2">
                    You haven't created a Wealth Goal yet!
                  </Text>
                  <Text className="text-[#F3007A] opacity-60 text-[11px] text-center">
                    Start creating goals to visual your journey toward your Win.
                  </Text>
                </View>
              ) : (
                activeGoals.map((goal) => (
                  <GoalListItem key={goal.id} goal={goal} />
                ))
              )
            ) : completedGoals.length === 0 ? (
              <View className="items-center justify-center py-20 px-10">
                <Text className="text-[#6B7280] italic">
                  No completed goals yet
                </Text>
              </View>
            ) : (
              completedGoals.map((goal) => (
                <GoalListItem key={goal.id} goal={goal} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalListItem({ goal }: any) {
  const isCompleted = goal.isCompleted;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/goal-detail/${goal.id}` as any)}
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
      {/* Goal Icon Circle */}
      <View
        style={{
          width: 51,
          height: 51,
          borderRadius: 200,
          backgroundColor: "#FFEEF7",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {goal.subtitle === "Business" ? (
          <Text style={{ fontSize: 20 }}>💼</Text>
        ) : (
          <Text style={{ fontSize: 20 }}>🚗</Text>
        )}
      </View>

      {/* Text Area (Width 292) */}
      <View style={{ width: 292, height: 51, justifyContent: "space-between" }}>
        {/* Row 1: Title & Right Side (Arrow/Amount) */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1A1A" }}>
            {goal.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 12, marginRight: 2 }}>
              {isCompleted ? "🏆" : "🎯"}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1A1A" }}>
              ₦{goal.amount}
            </Text>
          </View>
        </View>

        {/* Row 2: Subtitle/Amount Up & Progress Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 9, color: "#9CA3AF" }}>
              {goal.subtitle} |{" "}
            </Text>
            <Text style={{ fontSize: 9, color: "#4CAF50", fontWeight: "700" }}>
              ₦{goal.saved}
            </Text>
            <Text style={{ fontSize: 10, color: "#4CAF50", marginLeft: 2 }}>
              ↑
            </Text>
          </View>

          {/* Progress Bar (Width 129) */}
          <View
            style={{
              width: 129,
              height: 4,
              borderRadius: 20,
              backgroundColor: "#FFEEF7",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${goal.progress * 100}%`,
                height: 4,
                backgroundColor: isCompleted ? "#4CAF50" : "#F3007A",
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
            End Date: {goal.endDate}
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
              {Math.round(goal.progress * 100)}%
            </Text>
            <Text
              style={{
                fontSize: 9,
                color: isCompleted ? "#4CAF50" : "#9CA3AF",
                fontWeight: isCompleted ? "700" : "normal",
              }}
            >
              {isCompleted ? "Goal Achieved" : `${goal.daysLeft} days Left`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
