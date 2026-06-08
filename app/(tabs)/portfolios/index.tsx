import Header from "@/src/components/common/Header";
import { PortfolioCard } from "@/src/features/home/components/PortfolioCard";
import { SubWealthCard } from "@/src/features/home/components/SubWealthCard";
import { TransferToPortfolioSheet } from "@/src/features/home/components/TransferToPortfolioSheet";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

// ─── Mock portfolio activity data (replace with API when ready) ───────────────
// This simulates what would come from the backend based on user saving plans
const PORTFOLIO_ACTIVITY = {
  flex: {
    hasNotification: false,
    badgeType: undefined as any,
    badgeValue: undefined as any,
  },
  fix: {
    hasNotification: false,
    badgeType: "daysLeft" as const,
    badgeValue: "4 days left", // driven by nearest-maturing WealthFix saving plan
  },
  goal: {
    hasNotification: false,
    badgeType: "topup" as const,
    badgeValue: "Top Up", // driven by goal that hasn't been funded in a while
  },
  fam: {
    hasNotification: true, // a family member has updated their contribution
    badgeType: "topup" as const,
    badgeValue: "Top Up",
  },
  flow: {
    hasNotification: false,
    badgeType: undefined as any,
    badgeValue: undefined as any,
  },
  group: {
    hasNotification: true, // new group activity notification
    badgeType: undefined as any,
    badgeValue: undefined as any,
  },
};

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
    description: "Save with discipline and smash every goals.",
  },
  {
    id: "4",
    type: "fam" as const,
    title: "WealthFam",
    description: "Build a wealthy family; save for kids, spouse, and loved ones.",
  },
  {
    id: "5",
    type: "flow" as const,
    title: "WealthFlow",
    description: "Automated savings for a continuous wealth flow.",
  },
  {
    id: "6",
    type: "group" as const,
    title: "WealthGroup",
    description: "Save together, grow together and win together.",
  },
];

import Skeleton from "@/src/components/common/Skeleton";
import { PortfolioCardSkeleton } from "@/src/features/home/components/DashboardSkeletons";

export default function WealthPortfolioScreen() {
  const [loading, setLoading] = useState(true);
  const [showTransferSheet, setShowTransferSheet] = useState(false);
  const preferences = useSelector(
    (state: RootState) => state.portfolioPreference
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const renderPortfolioItem = ({
    item,
  }: {
    item: (typeof PORTFOLIOS)[0] | number;
  }) => (
    <View style={{ width: "48.5%", marginBottom: 16 }}>
      {typeof item === "number" ? (
        <PortfolioCardSkeleton />
      ) : (
        <PortfolioCard
          type={item.type}
          title={item.title}
          description={item.description}
          showEarnTag={false}
          hideInterest={preferences[item.type] === "Impact Wealth"}
          hasNotification={PORTFOLIO_ACTIVITY[item.type].hasNotification}
          badgeType={PORTFOLIO_ACTIVITY[item.type].badgeType}
          badgeValue={PORTFOLIO_ACTIVITY[item.type].badgeValue}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />
      <Header title="Wealth Portfolio" />

      <FlatList
        data={(loading ? [1, 2, 3, 4, 5, 6] : PORTFOLIOS) as any[]}
        keyExtractor={(item, index) =>
          typeof item === "number" ? index.toString() : item.id
        }
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
              {loading ? (
                <Skeleton
                  width="100%"
                  height={170}
                  style={{
                    borderTopLeftRadius: 50,
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 50,
                    borderBottomLeftRadius: 20,
                    backgroundColor: "#E1E1E1",
                  }}
                />
              ) : (
                <SubWealthCard
                  amount="₦350,000.00"
                  description="Discipline Today, Wealth Tomorrow"
                  onTransferPress={() => setShowTransferSheet(true)}
                />
              )}
            </View>

            {/* Portfolio Wealth Section */}
            <View className="mb-5">
              <View className="h-[1px] bg-[#E5E5E5] mb-2" />
            </View>

            <Text className="text-[#1A1A1A] font-bold text-[20px] mb-6 tracking-tight">
              Portfolios
            </Text>
          </>
        }
        renderItem={renderPortfolioItem as any}
      />

      {/* Transfer to Portfolio Bottom Sheet */}
      <TransferToPortfolioSheet
        visible={showTransferSheet}
        onClose={() => setShowTransferSheet(false)}
      />
    </SafeAreaView>
  );
}
