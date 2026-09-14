import { AppRefreshIndicator } from "@/src/components/common";
import { RootState } from "@/src/store";
import { useGetMyActivitiesQuery } from "@/src/store/api/activityApi";
import { useGetPortfolioConfigQuery } from "@/src/store/api/portfolioApi";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
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

  const { refetch: refetchWallet } = useGetWalletSummaryQuery();
  const { refetch: refetchActivities } = useGetMyActivitiesQuery({ limit: 5 });
  const { data: configData, refetch: refetchConfig } =
    useGetPortfolioConfigQuery();
  const rates = configData?.rates || (configData as any)?.data?.rates;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        refetchWallet(),
        refetchActivities(),
        refetchConfig(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const getRateLabel = (type: string) => {
    const keyMap: Record<string, string> = {
      flex: "wealthflex",
      fix: "wealthfix",
      goal: "wealthgoal",
      fam: "wealthfam",
      flow: "wealthflow",
      group: "wealthgroup",
    };
    const rateKey = keyMap[type] || `wealth${type}`;
    return rates?.[rateKey]?.label;
  };

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
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
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

        {loading ? (
          <DashboardLoadingState />
        ) : (
          <>
            {/* Main Wealth Card Section */}
            <View className="mb-10">
              <WealthCard />
            </View>

            <View className="mb-10">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[#1A1A1A] font-bold text-lg">
                  Wealth Portfolios
                </Text>
                <TouchableOpacity onPress={() => router.push("/portfolios")}>
                  <Text className="text-[#155D5F] text-sm font-medium">
                    View all
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5 px-5"
              >
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="goal"
                    title="WealthGoal"
                    description="Save with focus and smash every target."
                    interestRate={getRateLabel("goal")}
                    hideInterest={preferences["goal"] === "Impact Wealth"}
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="flow"
                    title="WealthFlow"
                    description="Automated savings for a continuous wealth flow."
                    interestRate={getRateLabel("flow")}
                    hideInterest={preferences["flow"] === "Impact Wealth"}
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="flex"
                    title="WealthFlex"
                    description="Smart flexible savings; earn interest, access anytime."
                    interestRate={getRateLabel("flex")}
                    hideInterest={preferences["flex"] === "Impact Wealth"}
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="fix"
                    title="WealthFix"
                    description="Lock it in, block temptation, and watch your money grow."
                    interestRate={getRateLabel("fix")}
                    hideInterest={preferences["fix"] === "Impact Wealth"}
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="fam"
                    title="WealthFam"
                    description="Build a wealthy family; save for kids, spouse, and loved ones."
                    interestRate={getRateLabel("fam")}
                    hideInterest={preferences["fam"] === "Impact Wealth"}
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    width={179}
                    type="group"
                    title="WealthGroup"
                    description="Save together, grow together and win together."
                    interestRate={getRateLabel("group")}
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
                <Text className="text-[#1A1A1A] font-bold text-lg tracking-tight">
                  Recent Activities
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/transactions/activities")}
                >
                  <Text className="text-[#155D5F] text-[13px] font-bold">
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
