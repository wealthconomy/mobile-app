import { WealthGoal } from "@/src/api/goalService";
import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const UnlockedPadlock = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M11.75 1C10.9544 1 10.1913 1.31607 9.62868 1.87868C9.06607 2.44129 8.75 3.20435 8.75 4V5.5C8.74984 6.07455 8.91468 6.63706 9.2249 7.12066C9.53513 7.60426 9.9777 7.9886 10.5 8.228V6.725C10.1794 6.39783 9.99993 5.95803 10 5.5V4C10 3.53587 10.1844 3.09075 10.5126 2.76256C10.8408 2.43437 11.2859 2.25 11.75 2.25C12.2141 2.25 12.6592 2.43437 12.9874 2.76256C13.3156 3.09075 13.5 3.53587 13.5 4V4.875C13.5 5.04076 13.5658 5.19973 13.6831 5.31694C13.8003 5.33415 13.9592 5.5 14.125 5.5C14.2908 5.5 14.4497 5.43415 14.5669 5.31694C14.6842 5.19973 14.75 5.04076 14.75 4.875V4C14.75 3.20435 14.4339 2.44129 13.8713 1.87868C13.3087 1.31607 12.5456 1 11.75 1Z"
      fill="#B1B1B1"
    />
    <Path
      d="M1.5 7C1.5 6.60218 1.65804 6.22064 1.93934 5.93934C2.22064 5.65804 2.60218 5.5 3 5.5H11C11.3978 5.5 11.7794 5.65804 12.0607 5.93934C12.342 6.22064 12.5 6.60218 12.5 7V13.5C12.5 13.8978 12.342 14.2794 12.0607 14.5607C11.7794 14.842 11.3978 15 11 15H3C2.60218 15 2.22064 14.842 1.93934 14.5607C1.65804 14.2794 1.5 13.8978 1.5 13.5V7Z"
      fill="#F9C23C"
    />
    <Path
      d="M7.75 10.25C7.95988 10.0926 8.11492 9.87313 8.19314 9.62271C8.27137 9.37229 8.26882 9.10361 8.18585 8.85472C8.10289 8.60583 7.94372 8.38935 7.73089 8.23595C7.51806 8.08255 7.26235 8 7 8C6.73765 8 6.48194 8.08255 6.26911 8.23595C6.05628 8.38935 5.89711 8.60583 5.81415 8.85472C5.73118 9.10361 5.72863 9.37229 5.80686 9.62271C5.88508 9.87313 6.04012 10.0926 6.25 10.25V12C6.25 12.1989 6.32902 12.3897 6.46967 12.5303C6.61032 12.671 6.80109 12.75 7 12.75C7.19891 12.75 7.38968 12.671 7.53033 12.5303C7.67098 12.3897 7.75 12.1989 7.75 12V10.25Z"
      fill="#433B6B"
    />
  </Svg>
);

const RECOMMENDATIONS = [
  {
    id: "1",
    title: "Starter Lock",
    subtitle: "Lock ₦15,000 for 365 days",
    earn: "₦2,475",
  },
  {
    id: "2",
    title: "Mid-Term Growth",
    subtitle: "Lock ₦50,000 for 120 days",
    earn: "₦2,548",
  },
  {
    id: "3",
    title: "Long-Term Fix",
    subtitle: "Lock ₦100,000 for 2 years",
    earn: "₦25,000",
  },
];

import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";

export default function WealthFixScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState("locked"); // 'locked' or 'unlocked'
  const [lockedGoals, setLockedGoals] = useState<WealthGoal[]>([]);
  const [unlockedGoals, setUnlockedGoals] = useState<WealthGoal[]>([]);

  const THEME_COLOR = "#D48E00"; // Primary Gold
  const THEME_BG = "#FFCF6566"; // Gold with opacity
  const THEME_LIGHT = "#FFF8E1"; // Light gold/cream

  useFocusEffect(
    useCallback(() => {
      const loadGoals = async () => {
        const mockLocked: WealthGoal[] = [
          {
            id: "fix-1",
            title: "House Rent",
            subtitle: "Starter Lock",
            amount: "3,000,000.00",
            saved: "2,400,000.00",
            progress: 0.8,
            daysLeft: 54,
            endDate: "2nd Dec 2022",
            automationFrequency: "Monthly",
            source: "Wealth Flex",
          },
          {
            id: "fix-2",
            title: "Wedding Clothes",
            subtitle: "Mid-Term Growth",
            amount: "1,234,144.00",
            saved: "863,900.00",
            progress: 0.7,
            daysLeft: 54,
            endDate: "2nd Dec 2022",
            automationFrequency: "Weekly",
            source: "Wealth Goal",
          },
          {
            id: "fix-3",
            title: "House Rent",
            subtitle: "Starter Lock",
            amount: "3,000,000.00",
            saved: "1,800,000.00",
            progress: 0.6,
            daysLeft: 54,
            endDate: "2nd Dec 2022",
            automationFrequency: "Monthly",
            source: "Wealth Flex",
          },
          {
            id: "fix-4",
            title: "House Rent",
            subtitle: "Starter Lock",
            amount: "3,000,000.00",
            saved: "1,800,000.00",
            progress: 0.6,
            daysLeft: 54,
            endDate: "2nd Dec 2022",
            automationFrequency: "Monthly",
            source: "Wealth Flex",
          },
          {
            id: "fix-5",
            title: "Wedding Clothes",
            subtitle: "Mid-Term Growth",
            amount: "3,000,000.00",
            saved: "1,800,000.00",
            progress: 0.6,
            daysLeft: 54,
            endDate: "2nd Dec 2022",
            automationFrequency: "Monthly",
            source: "Wealth Goal",
          },
        ];

        const mockUnlocked: WealthGoal[] = [
          {
            id: "fix-u1",
            title: "Wedding Clothes",
            subtitle: "Mid-Term Growth",
            amount: "3,000,000.00",
            saved: "3,000,000.00",
            progress: 1.0,
            daysLeft: 0,
            endDate: "2nd Dec 2022",
            automationFrequency: "Monthly",
            source: "Wealth Goal",
          },
          {
            id: "fix-u2",
            title: "House Rent",
            subtitle: "Starter Lock",
            amount: "3,000,000.00",
            saved: "3,000,000.00",
            progress: 1.0,
            daysLeft: 0,
            endDate: "2nd Dec 2022",
            automationFrequency: "Monthly",
            source: "Wealth Flex",
          },
          {
            id: "fix-u3",
            title: "House Rent",
            subtitle: "Starter Lock",
            amount: "3,000,000.00",
            saved: "3,000,000.00",
            progress: 1.0,
            daysLeft: 0,
            endDate: "2nd Dec 2022",
            automationFrequency: "Monthly",
            source: "Wealth Flex",
          },
          {
            id: "fix-u4",
            title: "Wedding Clothes",
            subtitle: "Mid-Term Growth",
            amount: "3,000,000.00",
            saved: "3,000,000.00",
            progress: 1.0,
            daysLeft: 0,
            endDate: "2nd Dec 2022",
            automationFrequency: "Monthly",
            source: "Wealth Goal",
          },
        ];

        setLockedGoals(mockLocked);
        setUnlockedGoals(mockUnlocked);
      };
      loadGoals();
    }, []),
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <Header title="WealthFix" onBack={() => router.back()} />
        <PortfolioDetailSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="WealthFix" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-2">
          {/* Main Card (GOLD) */}
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
              elevation: 10,
              alignSelf: "center",
            }}
          >
            <Image
              source={require("../../../assets/images/fix.png")}
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
                <Text className="text-[#1A1A1A] text-[12px] font-medium opacity-70">
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
                    fontSize={34}
                    color="#1A1A1A"
                  />
                ) : (
                  <Text className="text-[#1A1A1A] text-[34px] font-extrabold tracking-tight">
                    ••••••••
                  </Text>
                )}
              </View>

              <View className="flex-row items-center space-x-1">
                <Text className="text-[#1A1A1A] text-[12px] font-medium opacity-80">
                  Your wealth grew to N230.00 today
                </Text>
                <Text className="text-[#4CAF50] text-[15px] font-bold">↑</Text>
              </View>
            </View>

            <TouchableOpacity
              className="absolute bg-white items-center justify-center"
              style={{
                width: 190,
                height: 38,
                borderRadius: 10,
                bottom: 15,
                right: 20,
                elevation: 3,
                zIndex: 20,
              }}
              onPress={() => router.push("/portfolio/create/fix" as any)}
            >
              <Text
                style={{ color: "#323232" }}
                className="font-bold text-[13px]"
              >
                Create a WealthFix
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tips Box */}
          {showTips && (
            <View
              className="rounded-[24px] p-6 mb-8"
              style={{ backgroundColor: "#FFF7E1" }}
            >
              <TouchableOpacity
                className="absolute right-4 top-4 z-10"
                onPress={() => setShowTips(false)}
              >
                <Ionicons name="close" size={20} color={THEME_COLOR} />
              </TouchableOpacity>
              <View className="flex-row items-center mb-4">
                <Text
                  className="font-extrabold text-[12px] mr-1"
                  style={{ color: THEME_COLOR }}
                >
                  What’s New on WealthFix? 🔓
                </Text>
              </View>
              <View>
                {[
                  {
                    title: "Long-term Wealth Building:",
                    text: "You can now lock funds for up to 1,000 days to secure your future.",
                  },
                  {
                    title: "Maturity Rewards:",
                    text: "For all locks over 365 days, your interest or impact growth is paid at maturity.",
                  },
                  {
                    title: "Flexible Payouts:",
                    text: "Choose to receive your returns upfront or at maturity for funds locked between 10 and 365 days.",
                  },
                ].map((tip, i) => (
                  <View key={i} className="flex-row mb-3 items-start">
                    <Text className="mr-2 text-[10px] opacity-70">⭐</Text>
                    <Text
                      className="text-[10px] flex-1 leading-[15px]"
                      style={{ color: THEME_COLOR }}
                    >
                      <Text className="font-extrabold">{tip.title}</Text>{" "}
                      {tip.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* WealthBuilder Recommendations */}
          <View className="mb-8">
            <Text className="text-[18px] font-bold text-[#323232] mb-4">
              WealthBuilder Recommendations
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {[
                {
                  id: "1",
                  title: "Starter Lock",
                  subtitle: "Lock ₦15,000 for 365 days",
                  earn: "₦2,475",
                  amount: "15000",
                  duration: "365",
                },
                {
                  id: "2",
                  title: "Mid-Term Growth",
                  subtitle: "Lock ₦50,000 for 120 days",
                  earn: "₦2,548",
                  amount: "50000",
                  duration: "120",
                },
                {
                  id: "3",
                  title: "Long-Term Fix",
                  subtitle: "Lock ₦100,000 for 2 years",
                  earn: "₦25,000",
                  amount: "100000",
                  duration: "730",
                },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() =>
                    router.push({
                      pathname: "/portfolio/create/fix",
                      params: {
                        lockType: cat.title,
                        amount: cat.amount,
                        duration: cat.duration,
                      },
                    })
                  }
                  style={{
                    width: 170,
                    height: 100,
                    backgroundColor: "#FFF7E1",
                    borderRadius: 15,
                    padding: 12,
                    marginRight: 15,
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text
                      className="font-bold text-[14px] mb-0.5"
                      style={{ color: THEME_COLOR }}
                    >
                      {cat.title}
                    </Text>
                    <Text
                      className="text-[9px] font-medium"
                      style={{ color: THEME_COLOR, opacity: 0.8 }}
                    >
                      {cat.subtitle}
                    </Text>
                  </View>
                  <View
                    className="bg-white rounded-full items-center justify-center self-end"
                    style={{ paddingHorizontal: 12, paddingVertical: 4 }}
                  >
                    <Text
                      className="text-[10px] font-bold"
                      style={{ color: THEME_COLOR }}
                    >
                      Earn {cat.earn}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* HR Line */}
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
              onPress={() => setActiveTab("locked")}
              activeOpacity={1}
              style={{
                width: 182,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor:
                  activeTab === "locked" ? "#FFF7E1" : "transparent",
                borderBottomWidth: activeTab === "locked" ? 2 : 0,
                borderBottomColor: THEME_COLOR,
                borderTopLeftRadius: 15,
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: THEME_COLOR,
                  fontSize: 12,
                  fontWeight: activeTab === "locked" ? "700" : "500",
                }}
              >
                Locked funds
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("unlocked")}
              activeOpacity={1}
              style={{
                width: 182,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor:
                  activeTab === "unlocked" ? "#FFF7E1" : "transparent",
                borderBottomWidth: activeTab === "unlocked" ? 2 : 0,
                borderBottomColor: THEME_COLOR,
                borderTopLeftRadius: 15,
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: THEME_COLOR,
                  fontSize: 12,
                  fontWeight: activeTab === "unlocked" ? "700" : "500",
                }}
              >
                Unlocked funds
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fix List View */}
          <View style={{ width: 355, alignSelf: "center" }}>
            {activeTab === "locked"
              ? lockedGoals.map((goal, index) => (
                  <View key={goal.id}>
                    <FixListItem goal={goal} themeColor={THEME_COLOR} />
                    {index < lockedGoals.length - 1 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: "#EEEEEE",
                          marginBottom: 24,
                        }}
                      />
                    )}
                  </View>
                ))
              : unlockedGoals.map((goal, index) => (
                  <View key={goal.id}>
                    <FixListItem
                      goal={goal}
                      themeColor={THEME_COLOR}
                      isUnlocked
                    />
                    {index < unlockedGoals.length - 1 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: "#EEEEEE",
                          marginBottom: 24,
                        }}
                      />
                    )}
                  </View>
                ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FixListItem({ goal, themeColor, isUnlocked }: any) {
  const initial = (goal.title || "W")[0].toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/portfolio/detail/fix/[id]",
          params: { id: goal.id },
        })
      }
      style={{
        width: 355,
        height: 60,
        backgroundColor: "white",
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* Initial Icon Circle */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#FFF8E1",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ color: themeColor, fontSize: 16, fontWeight: "bold" }}>
          {initial}
        </Text>
      </View>

      <View style={{ flex: 1, height: 60, justifyContent: "space-between" }}>
        {/* Row 1: Title & Amount */}
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
            {isUnlocked && (
              <View style={{ marginRight: 4 }}>
                <UnlockedPadlock />
              </View>
            )}
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: isUnlocked ? "#4CAF50" : "#1A1A1A",
              }}
            >
              {!isUnlocked && "🔒 "}₦{goal.amount}
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
            <Text style={{ fontSize: 9, color: "#9CA3AF" }}>
              {" "}
              | Progressive: ₦50,000.00
            </Text>
          </View>

          {/* Progress Bar (Width 129) */}
          <View
            style={{
              width: 129,
              height: 4,
              borderRadius: 20,
              backgroundColor: "#FFF7E1",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${goal.progress * 100}%`,
                height: 4,
                backgroundColor: isUnlocked ? "#4CAF50" : themeColor,
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
                color: isUnlocked ? "#4CAF50" : "#9CA3AF",
                fontWeight: isUnlocked ? "700" : "normal",
              }}
            >
              {isUnlocked ? "Wealth Retrieved" : `${goal.daysLeft} days Left`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
