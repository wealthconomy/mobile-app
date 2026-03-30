import Skeleton from "@/src/components/common/Skeleton";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

        {/* Main Wealth Card Section */}
        <View className="mb-10">
          {loading ? (
            <Skeleton width="100%" height={180} borderRadius={24} />
          ) : (
            <WealthCard />
          )}
        </View>

        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#1A1A1A] font-bold text-lg">
              Wealth Portfolios
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/wealth-portfolio" as any)}
            >
              <Text className="text-[#155D5F] text-sm font-medium">
                View all
              </Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View className="flex-row -mx-5 px-5">
              <Skeleton
                width={179}
                height={119}
                borderRadius={15}
                style={{ marginRight: 16 }}
              />
              <Skeleton
                width={179}
                height={119}
                borderRadius={15}
                style={{ marginRight: 16 }}
              />
              <Skeleton width={179} height={119} borderRadius={15} />
            </View>
          ) : (
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
          )}
        </View>

        {/* Todo Section */}
        <View className="mb-10">
          {loading ? (
            <View className="space-y-4">
              <Skeleton width="40%" height={20} />
              <Skeleton width="100%" height={100} borderRadius={24} />
            </View>
          ) : (
            <TodoSection />
          )}
        </View>

        {/* Wise Up Section */}
        <View className="mb-10">
          {loading ? (
            <View className="space-y-4">
              <Skeleton width="30%" height={20} />
              <View className="flex-row">
                <Skeleton
                  width={169}
                  height={107}
                  borderRadius={10}
                  style={{ marginRight: 12 }}
                />
                <Skeleton
                  width={169}
                  height={107}
                  borderRadius={10}
                  style={{ marginRight: 12 }}
                />
                <Skeleton width={169} height={107} borderRadius={10} />
              </View>
            </View>
          ) : (
            <WiseUpSection />
          )}
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
          {loading ? (
            <View className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="100%" height={70} borderRadius={20} />
              ))}
            </View>
          ) : (
            <RecentActivityList />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
