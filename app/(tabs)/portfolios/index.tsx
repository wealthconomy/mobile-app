import Header from "@/src/components/common/Header";
import { AppRefreshIndicator } from "@/src/components/common/AppRefreshIndicator";
import { PortfolioCard } from "@/src/features/home/components/PortfolioCard";
import { SubWealthCard } from "@/src/features/home/components/SubWealthCard";
import { TransferToPortfolioSheet } from "@/src/features/home/components/TransferToPortfolioSheet";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import { useGetPortfolioConfigQuery, useGetPortfoliosQuery } from "@/src/store/api/portfolioApi";
import { useInterestQuote } from "@/src/hooks/useInterestQuote";
import { getGroupedSubscribedRate } from "@/src/utils/interestTiers";
import { InterestTier, Portfolio } from "@/src/types/portfolio";
import { Skeleton } from "@/src/components/common/skeletons";
import { PortfolioCardSkeleton } from "@/src/features/home/components/DashboardSkeletons";

const PORTFOLIOS = [
  {
    id: "1",
    type: "flex" as const,
    title: "WealthFlex",
    description: "Smart flexible savings; earn interest, access anytime.",
  },
  {
    id: "2",
    type: "goal" as const,
    title: "WealthGoal",
    description: "Save with discipline and smash every goals.",
  },
  {
    id: "3",
    type: "fam" as const,
    title: "WealthFam",
    description: "Build a wealthy family; save for kids, spouse, and loved ones.",
  },
  {
    id: "4",
    type: "fix" as const,
    title: "WealthFix",
    description: "Lock it in, block temptation, and watch your money grow.",
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

export default function WealthPortfolioScreen() {
  const [showTransferSheet, setShowTransferSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const preferences = useSelector(
    (state: RootState) => state.portfolioPreference
  );

  const { data: walletData, isLoading, refetch: refetchWallet } = useGetWalletSummaryQuery();
  const { data: configData } = useGetPortfolioConfigQuery();
  const { data: fixData, refetch: refetchFix } = useGetPortfoliosQuery({ type: "wealthfix" });
  const { data: famData, refetch: refetchFam } = useGetPortfoliosQuery({ type: "wealthfam" });
  const { data: goalData, refetch: refetchGoal } = useGetPortfoliosQuery({ type: "wealthgoal" });
  const { data: flowData, refetch: refetchFlow } = useGetPortfoliosQuery({ type: "wealthflow" });

  const tiers = (configData?.tiers || (configData as any)?.data?.tiers) as InterestTier[];

  const flexBalanceNaira = parseFloat(walletData?.currentBalance || "0") / 100;
  const { rate: flexRate } = useInterestQuote({
    type: "flex",
    amountNaira: flexBalanceNaira,
    enabled: flexBalanceNaira > 0,
  });
  const flexRateLabel = flexRate != null ? `${flexRate}% P.A.` : undefined;

  const getSubscribedRateForType = (type: string) => {
    if (type === "flex") return flexRateLabel;
    let typePortfolios: Portfolio[] = [];
    if (type === "fix") typePortfolios = fixData?.items || [];
    else if (type === "fam") typePortfolios = famData?.items || [];
    else if (type === "goal") typePortfolios = goalData?.items || [];
    else if (type === "flow") typePortfolios = flowData?.items || [];
    else return undefined;

    const rate = getGroupedSubscribedRate(typePortfolios, tiers);
    return rate != null ? `${rate}% P.A.` : undefined;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        refetchWallet(),
        refetchFix(),
        refetchFam(),
        refetchGoal(),
        refetchFlow(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const formatAmount = (val?: string) => {
    if (!val) return "0.00";
    const amount = parseFloat(val) / 100;
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const renderPortfolioItem = ({
    item,
  }: {
    item: (typeof PORTFOLIOS)[0] | number;
  }) => (
    <View style={{ width: "48%", marginBottom: 16 }}>
      {typeof item === "number" ? (
        <PortfolioCardSkeleton />
      ) : (
        <PortfolioCard
          type={item.type}
          title={item.title}
          description={item.description}
          interestRate={getSubscribedRateForType(item.type)}
          showEarnTag={false}
          hideInterest={preferences[item.type] === "Impact Wealth"}
          hasNotification={false}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />
      <Header title="Wealth Portfolio" />

      <AppRefreshIndicator refreshing={refreshing} topOffset={65} />

      <FlatList
        data={isLoading ? ([1, 2, 3, 4, 5, 6] as any[]) : PORTFOLIOS}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={["#155D5F"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
        ListHeaderComponent={
          <>
            {/* Total Savings Card */}
            <View className="mb-6">
              {isLoading ? (
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
                  amount={`₦${formatAmount(walletData?.currentBalance)}`}
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
