import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
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
                <TouchableOpacity
                  onPress={() => router.push("/portfolios/" as any)}
                >
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
                    type="flex"
                    title="WealthFlex"
                    description="Smart flexible savings; earn interest, access anytime."
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    type="goal"
                    title="WealthGoal"
                    description="Save with focus and smash every target."
                  />
                </View>
                <View className="mr-4">
                  <PortfolioCard
                    type="fix"
                    title="WealthFix"
                    description="Lock it in, block temptation, and watch your money grow."
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
                <TouchableOpacity onPress={() => router.push("/activities")}>
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
