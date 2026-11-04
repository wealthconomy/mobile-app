import { AppRefreshIndicator } from "@/src/components/common";
import { RootState } from "@/src/store";
import { useGetMyActivitiesQuery } from "@/src/store/api/activityApi";
import { useGetPortfolioConfigQuery, useGetPortfoliosQuery } from "@/src/store/api/portfolioApi";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import { useInterestQuote } from "@/src/hooks/useInterestQuote";
import { getGroupedSubscribedRate } from "@/src/utils/interestTiers";
import { InterestTier } from "@/src/types/portfolio";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { DashboardLoadingState } from "./components/DashboardSkeletons";
import { HomeHeader } from "./components/HomeHeader";
import { PortfolioCard } from "./components/PortfolioCard";
import { RecentActivityList } from "./components/RecentActivityList";
import { TodoSection } from "./components/TodoSection";
import { WealthCard } from "./components/WealthCard";
import { WiseUpSection } from "./components/WiseUpSection";

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const preferences = useSelector(
    (state: RootState) => state.portfolioPreference,
  );

  const { data: walletData, isLoading: isWalletLoading, refetch: refetchWallet } = useGetWalletSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { refetch: refetchActivities } = useGetMyActivitiesQuery({ limit: 5 });
  const {
    data: configData,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
    isError: isConfigError,
    refetch: refetchConfig,
  } = useGetPortfolioConfigQuery();
  const rates = configData?.rates || (configData as any)?.data?.rates;

  const { data: fixData, refetch: refetchFix } = useGetPortfoliosQuery({ type: "wealthfix" });
  const { data: famData, refetch: refetchFam } = useGetPortfoliosQuery({ type: "wealthfam" });
  const { data: goalData, refetch: refetchGoal } = useGetPortfoliosQuery({ type: "wealthgoal" });
  const { data: flowData, refetch: refetchFlow } = useGetPortfoliosQuery({ type: "wealthflow" });

  const fixPortfolios = fixData?.items || [];
  const famPortfolios = famData?.items || [];
  const goalPortfolios = goalData?.items || [];
  const flowPortfolios = flowData?.items || [];

  const tiers = (configData?.tiers || (configData as any)?.data?.tiers) as InterestTier[];

  const fixRate = getGroupedSubscribedRate(fixPortfolios, tiers);
  const famRate = getGroupedSubscribedRate(famPortfolios, tiers);
  const goalRate = getGroupedSubscribedRate(goalPortfolios, tiers);
  const flowRate = getGroupedSubscribedRate(flowPortfolios, tiers);

  const fixRateLabel = fixRate != null ? `${fixRate}% P.A.` : undefined;
  const famRateLabel = famRate != null ? `${famRate}% P.A.` : undefined;
  const goalRateLabel = goalRate != null ? `${goalRate}% P.A.` : undefined;
  const flowRateLabel = flowRate != null ? `${flowRate}% P.A.` : undefined;
  const groupRateLabel = undefined;

  const flexBalanceNaira = parseFloat(walletData?.currentBalance || "0") / 100;
  const { rate: flexRate } = useInterestQuote({
    type: "flex",
    amountNaira: flexBalanceNaira,
    enabled: flexBalanceNaira > 0,
  });
  const flexRateLabel = flexRate != null ? `${flexRate}% P.A.` : undefined;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        refetchWallet(),
        refetchActivities(),
        refetchConfig(),
        refetchFix(),
        refetchFam(),
        refetchGoal(),
        refetchFlow(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const isPageLoading = loading || isConfigLoading || isWalletLoading;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1 }}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <AppRefreshIndicator refreshing={refreshing} label="Refresh..." />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={["#155D5F"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        {/* Header Section */}
        <HomeHeader />

        {isPageLoading ? (
          <DashboardLoadingState />
        ) : (
          <>
            {/* Main Wealth Card Section */}
            <View className="mb-10">
              <WealthCard />
            </View>

            <View className="mb-10">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[#1A1A1A] font-bold text-lg" maxFontSizeMultiplier={1.35}>
                  Wealth Portfolios
                </Text>
                <TouchableOpacity onPress={() => router.push("/portfolios")}>
                  <Text className="text-[#155D5F] text-[14px] font-kumbh-bold" maxFontSizeMultiplier={1.35}>
                    View all
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="flex"
                    title="WealthFlex"
                    description="Smart flexible savings; earn interest, access anytime."
                    interestRate={flexRate != null ? `${flexRate}% P.A.` : undefined}
                    hideInterest={preferences["flex"] === "Impact Wealth"}
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="fam"
                    title="WealthFam"
                    description="Build a wealthy family; save for kids, spouse, and loved ones."
                    interestRate={famRateLabel}
                    hideInterest={preferences["fam"] === "Impact Wealth"}
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="goal"
                    title="WealthGoal"
                    description="Save with focus and smash every target."
                    interestRate={goalRateLabel}
                    hideInterest={preferences["goal"] === "Impact Wealth"}
                  />
                </View>

                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="fix"
                    title="WealthFix"
                    description="Lock it in, block temptation, and watch your money grow."
                    interestRate={fixRateLabel}
                    hideInterest={preferences["fix"] === "Impact Wealth"}
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="flow"
                    title="WealthFlow"
                    description="Automated savings for a continuous wealth flow."
                    interestRate={flowRateLabel}
                    hideInterest={preferences["flow"] === "Impact Wealth"}
                  />
                </View>
                <View>
                  <PortfolioCard
                    width={179}
                    type="group"
                    title="WealthGroup"
                    description="Save together, grow together and win together."
                    interestRate={groupRateLabel}
                    hideInterest={preferences["group"] === "Impact Wealth"}
                  />
                </View>
              </ScrollView>
            </View>

            {/* Todo Section */}
            <View className="mb-10">
              <TodoSection />
            </View>

            {/* Wise Up Section */}
            <View className="mb-10">
              <WiseUpSection />
            </View>

            {/* Recent Activities Section */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-[#1A1A1A] font-bold text-lg tracking-tight" maxFontSizeMultiplier={1.35}>
                  Recent Activities
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/transactions/activities")}
                >
                  <Text className="text-[#155D5F] text-[14px] font-kumbh-bold" maxFontSizeMultiplier={1.35}>
                    View all
                  </Text>
                </TouchableOpacity>
              </View>
              <RecentActivityList />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
