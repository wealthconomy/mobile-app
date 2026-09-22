import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { PortfolioPreferenceMenu } from "@/src/components/common/PortfolioPreferenceMenu";
import { AppRefreshIndicator } from "@/src/components/common/AppRefreshIndicator";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowUp, Eye, EyeOff } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import {
  useGetPortfoliosQuery,
  useGetPortfolioConfigQuery,
} from "@/src/store/api/portfolioApi";
import { useGetSystemConfigsQuery } from "@/src/store/api/groupApi";
import { Portfolio } from "@/src/types/portfolio";
import {
  saveCompletedPortfolios,
  hydrateCompletedPortfolios,
  removeCompletedPortfolio,
} from "@/src/store/slices/completedPortfolioSlice";
import { isPortfolioCompleted, getDynamicInterestRateLabel } from "@/src/utils/formatters";

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
  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">(
    "ongoing",
  );
  const [refreshing, setRefreshing] = useState(false);

  const portfolioPreference = useSelector(
    (state: RootState) => state.portfolioPreference.fam
  );
  const showInterest = portfolioPreference !== "Impact Wealth";

  const dispatch = useDispatch();
  const completedMap = useSelector(
    (state: RootState) => state.completedPortfolio.completedMap
  );

  const { data, isLoading: loading, refetch: refetchFam } = useGetPortfoliosQuery({ type: "wealthfam" });
  const { data: configData } = useGetPortfolioConfigQuery();
  const { data: systemConfigData } = useGetSystemConfigsQuery();
  const rates = configData?.rates || (configData as any)?.data?.rates;
  const famRateLabel = getDynamicInterestRateLabel("fam", systemConfigData, rates, 10);
  const allGoals = data?.items || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchFam();
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refetchFam();
      (dispatch as any)(hydrateCompletedPortfolios());
    }, [refetchFam, dispatch])
  );

  useEffect(() => {
    (dispatch as any)(hydrateCompletedPortfolios());
  }, [dispatch]);

  useEffect(() => {
    if (allGoals.length > 0) {
      const completed = allGoals.filter(isPortfolioCompleted);
      if (completed.length > 0) {
        dispatch(
          saveCompletedPortfolios(
            completed.map((p) => ({ ...p, type: p.type || "wealthfam" }))
          )
        );
      }
      // Evict any active plan that was mistakenly stored in completedMap
      allGoals.forEach((p) => {
        if (!isPortfolioCompleted(p) && completedMap[p.id]) {
          dispatch(removeCompletedPortfolio(p.id));
        }
      });
    }
  }, [allGoals, completedMap, dispatch]);

  const ongoingPlans = allGoals.filter((g: Portfolio) => !isPortfolioCompleted(g));
  const completedPlans = useMemo(() => {
    const fromApi = allGoals.filter(isPortfolioCompleted);
    const fromCache = Object.values(completedMap)
      .filter(isPortfolioCompleted)
      .filter((g) => {
        const normType = (g.type || "").toLowerCase().replace(/[-_]/g, "");
        if (normType === "wealthfam" || normType === "fam") return true;
        if (g.metadata?.familyMemberName || g.metadata?.familyCategory) return true;
        if (
          !normType &&
          !g.metadata?.autoSaveFrequency &&
          !g.metadata?.lockType &&
          (g.name?.includes("Kids") ||
            g.name?.includes("Spouse") ||
            g.name?.includes("Parent") ||
            g.name?.includes("Sibling") ||
            g.name?.includes("Fam") ||
            g.name?.includes("Family"))
        ) {
          return true;
        }
        return false;
      });
    const combined = new Map<string, Portfolio>();
    fromCache.forEach((item) => combined.set(item.id, item));
    fromApi.forEach((item) =>
      combined.set(item.id, {
        ...item,
        type: item.type || "wealthfam",
      })
    );
    return Array.from(combined.values());
  }, [allGoals, completedMap]);

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
        <Header title="WealthFam" onBack={() => router.back()} />
        <PortfolioDetailSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header
        title="WealthFam"
        onBack={() => router.back()}
        rightElement={<PortfolioPreferenceMenu portfolioType="fam" />}
      />

      <AppRefreshIndicator refreshing={refreshing} topOffset={65} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={["#560FF1"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        <View className="px-5 py-2">
          {/* ── Hero Card (same size/structure as WealthGoal) ─────── */}
          <View
            className="relative overflow-hidden mb-8"
            style={{
              width: "100%",
              maxWidth: 365,
              height: 170,
              borderTopLeftRadius: 50,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 50,
              borderBottomLeftRadius: 20,
              backgroundColor: THEME_CARD_BG,
              shadowColor: "#323232",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 13,
              elevation: 10,
              alignSelf: "center",
            }}
          >
            {/* Decorative Background Graphic */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                top: -17,
                left: 215,
                transform: [{ rotate: "368.33deg" }],
                opacity: 0.3,
                zIndex: 1,
              }}
            >
              <Image
                source={require("../../../assets/images/fam.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </View>

            <View
              style={{
                position: "absolute",
                top: 28,
                left: 20,
                right: 20,
                zIndex: 10,
              }}
            >
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[#1A1A1A] text-[13px] font-medium opacity-90">
                    Total Savings
                  </Text>
                  {showInterest && (
                    <View
                      style={{
                        backgroundColor: "#6366F1",
                        paddingHorizontal: 8,
                        paddingVertical: 2.5,
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 9 }}>
                        {famRateLabel}
                      </Text>
                    </View>
                  )}
                </View>
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
                    ***
                  </Text>
                )}
              </View>

              {showInterest && (
                <View className="flex-row items-center space-x-1">
                  <Text className="text-[#1A1A1A] text-[12px] font-medium opacity-80">
                    Your wealth grew to ₦0.00 today
                  </Text>
                  <ArrowUp size={14} color="#4CAF50" />
                </View>
              )}
            </View>

            <TouchableOpacity
              className="absolute bg-white items-center justify-center"
              style={{
                width: 200,
                height: 40,
                borderRadius: 18,
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
              width: "100%",
              alignSelf: "center",
              marginBottom: 30,
            }}
          />

          {/* ── Tabs (same structure as WealthGoal) ───────────────── */}
          <View
            style={{
              width: "100%",
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
  plan: Portfolio;
  isCompleted?: boolean;
}) {
  const completed = Boolean(isCompleted || isPortfolioCompleted(plan));
  const icon = (plan.name || "").includes("Kids")
    ? "👨‍👩‍👧‍👦"
    : (plan.name || "").includes("Spouse")
      ? "💑"
      : (plan.name || "").includes("Parent")
        ? "👴"
        : "🤝";

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const amountNum = parseFloat(val) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const progress = completed
    ? 1
    : parseFloat(plan.targetAmount) > 0
    ? parseFloat(plan.balance) / parseFloat(plan.targetAmount)
    : 0;

  const growthVal =
    (plan as any).interestAccrued ??
    (plan as any).accruedInterest ??
    plan.dailyGrowth ??
    (plan as any).totalYieldEarned ??
    "0";

  const formattedDate = new Date(plan.maturityDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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
            {plan.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 12, marginRight: 2 }}>
              {isCompleted ? "🏆" : "🏡"}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1A1A" }}>
              ₦{formatAmount(plan.targetAmount)}
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
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
              {plan.metadata?.category || "Fam"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 10, color: "#4CAF50", fontWeight: "700" }}>
                Wealth growth ₦{formatAmount(growthVal.toString())}{" "}
              </Text>
              <ArrowUp size={12} color="#4CAF50" />
            </View>
          </View>

          <View
            style={{
              width: 80,
              height: 4,
              borderRadius: 20,
              backgroundColor: THEME_BG,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${Math.min(progress * 100, 100)}%`,
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
            End Date: {formattedDate}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: 80,
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 9, color: "#9CA3AF" }}>
              {Math.round(Math.min(progress * 100, 100))}%
            </Text>
            <Text
              style={{
                fontSize: 9,
                color: isCompleted ? "#4CAF50" : "#9CA3AF",
                fontWeight: isCompleted ? "700" : "normal",
              }}
            >
              {isCompleted ? "Plan Achieved" : `${getDaysLeft()} days Left`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
