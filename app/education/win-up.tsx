import Header from "@/src/components/common/Header";
import { AppRefreshIndicator } from "@/src/components/common/AppRefreshIndicator";
import { RecentTransactionList } from "@/src/features/home/components/RecentTransactionList";
import { SubWealthCard } from "@/src/features/home/components/SubWealthCard";
import { TransferToPortfolioSheet } from "@/src/features/home/components/TransferToPortfolioSheet";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

export default function WinUpScreen() {
  const [showTransferSheet, setShowTransferSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data: walletData, isLoading, refetch } = useGetWalletSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const formatAmount = (val?: string) => {
    if (!val) return "0.00";
    const amountNum = parseFloat(val) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />
      <Header title="WinUp" />

      <AppRefreshIndicator refreshing={refreshing} topOffset={65} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}
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
        {/* Total Savings Card */}
        <View className="mb-10">
          <SubWealthCard
            amount={`₦${formatAmount(walletData?.currentBalance)}`}
            description="WinUp!. Save Smarter, Build Faster."
            onTransferPress={() => setShowTransferSheet(true)}
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-8 space-x-4 gap-5">
          <TouchableOpacity
            className="flex-1 bg-[#30999C] rounded-2xl p-5 items-center justify-center border border-[#155D5F]/20"
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/wallet/deposit",
                params: { plan: "WinUp" },
              })
            }
          >
            <View className="items-center justify-center mb-3">
              <Ionicons name="add" size={24} color="white" />
            </View>
            <Text className="text-[#fefefe] font-bold text-sm">
              Wealth Deposit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-[#30999C] rounded-2xl p-5 items-center justify-center border border-[#155D5F]/20"
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/wallet/withdraw",
                params: { plan: "WinUp" },
              })
            }
          >
            <View className="items-center justify-center mb-3">
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={24}
                color="white"
              />
            </View>
            <Text className="text-[#feffff] font-bold text-sm">
              Wealth Withdraw
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View>
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-[#1A1A1A] font-extrabold text-[16px] tracking-tight">
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/transactions" as any)}
            >
              <Text className="text-[#155D5F] text-[13px] font-bold">
                View all
              </Text>
            </TouchableOpacity>
          </View>
          <RecentTransactionList />
        </View>
      </ScrollView>

      {/* Transfer to Portfolio Bottom Sheet */}
      <TransferToPortfolioSheet
        visible={showTransferSheet}
        onClose={() => setShowTransferSheet(false)}
      />
    </SafeAreaView>
  );
}
