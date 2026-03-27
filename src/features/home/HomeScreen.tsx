import Skeleton from "@/src/components/common/Skeleton";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeHeader } from "./components/HomeHeader";
import { PortfolioCard } from "./components/PortfolioCard";
import { RecentActivityList } from "./components/RecentActivityList";
import { TodoSection } from "./components/TodoSection";
import { WealthCard } from "./components/WealthCard";
import { WiseUpSection } from "./components/WiseUpSection";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
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

        {/* Wealth Portfolios Section */}
        {/* <View className="mb-10">
          <Text className="text-[#1A1A1A] font-bold text-lg mb-4">
            Wealth Portfolios
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loading ? (
              <View className="flex-row">
                <Skeleton
                  width={280}
                  height={160}
                  borderRadius={24}
                  style={{ marginRight: 16 }}
                />
                <Skeleton width={280} height={160} borderRadius={24} />
              </View>
            ) : (
              <>
                <PortfolioCard
                  type="flex"
                  title="Wealth Flex"
                  description="Smart flexible savings; earn interest, access anytime."
                  image={require("../../../assets/images/wallet.png")}
                />
                <PortfolioCard
                  type="goal"
                  title="Wealth Goal"
                  description="Save with focus and smash every target."
                  image={require("../../../assets/images/arrow.png")}
                />
              </>
            )}
          </ScrollView>
        </View> */}

        {/* Todo Section */}
        {/* <View className="mb-10">
          {loading ? (
            <View className="space-y-4">
              <Skeleton width="40%" height={20} />
              <Skeleton width="100%" height={80} borderRadius={16} />
            </View>
          ) : (
            <TodoSection />
          )}
        </View> */}

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
        {loading ? (
          <View className="space-y-4">
            <Skeleton width="50%" height={20} />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width="100%" height={60} borderRadius={12} />
            ))}
          </View>
        ) : (
          <RecentActivityList />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
