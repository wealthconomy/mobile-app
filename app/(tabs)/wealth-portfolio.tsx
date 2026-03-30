import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { PortfolioCard } from "@/src/features/home/components/PortfolioCard";
import { SubWealthCard } from "@/src/features/home/components/SubWealthCard";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PORTFOLIOS = [
  {
    id: "1",
    type: "flex" as const,
    title: "WealthFlex",
    description: "Smart flexible savings; earn interest, access anytime.",
  },
  {
    id: "2",
    type: "fix" as const,
    title: "WealthFix",
    description: "Lock it in, block temptation, and watch your money grow.",
  },
  {
    id: "3",
    type: "goal" as const,
    title: "WealthGoal",
    description: "Save with focus and smash every target.",
  },
  {
    id: "4",
    type: "fam" as const,
    title: "WealthFam",
    description: "Build a wealthy family; save for kids, spouse, and loved ones.",
  },
  {
    id: "5",
    type: "auto" as const,
    title: "WealthAuto",
    description: "Automate it and save effortlessly: daily, weekly, monthly",
  },
  {
    id: "6",
    type: "group" as const,
    title: "WealthGroup",
    description: "Build a wealthy family; save for kids, spouse, and loved ones.",
  },
];

export default function WealthPortfolioScreen() {
  const [loading, setLoading] = useState(true);
  const [showPortfolioBalance, setShowPortfolioBalance] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderPortfolioItem = ({ item }: { item: (typeof PORTFOLIOS)[0] }) => (
    <View style={{ width: "48.5%", marginBottom: 16 }}>
      <PortfolioCard
        type={item.type}
        title={item.title}
        description={item.description}
        showEarnTag={false}
      />
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />
      <Header title="Wealth Portfolio" />

      <FlatList
        data={PORTFOLIOS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Total Savings Card */}
            <View className="mb-6">
              <SubWealthCard
                description="Best for building a strong brand identity around empowerment."
                showButton={true}
              />
            </View>

            {/* Portfolio Wealth Section */}
            <View className="mb-8">
              <View className="h-[1px] bg-[#E5E5E5] mb-5" />

              <View className="flex-row items-center justify-between px-1">
                <View>
                  <Text className="text-[#64748B] text-[13px] font-medium mb-1">
                    Portfolio Wealth
                  </Text>
                  {showPortfolioBalance ? (
                    <BalanceText
                      amount="₦350,000.00"
                      fontSize={24}
                      color="#1A1A1A"
                    />
                  ) : (
                    <Text className="text-[#1A1A1A] font-bold text-[24px]">
                      ••••••••
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => setShowPortfolioBalance(!showPortfolioBalance)}
                  className="p-2"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      showPortfolioBalance ? "eye-outline" : "eye-off-outline"
                    }
                    size={24}
                    color="#155D5F"
                  />
                </TouchableOpacity>
              </View>

              <View className="h-[1px] bg-[#E5E5E5] mt-5" />
            </View>

            <Text className="text-[#1A1A1A] font-bold text-[20px] mb-6 tracking-tight">
              Portfolios
            </Text>
          </>
        }
        renderItem={renderPortfolioItem}
      />
    </SafeAreaView>
  );
}
