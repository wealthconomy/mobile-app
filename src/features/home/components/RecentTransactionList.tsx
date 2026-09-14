import { RecentActivitySkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { useGetWalletTransactionsQuery } from "@/src/store/api/walletApi";
import { WalletTransaction } from "@/src/types/wallet";
import { getCleanTransactionTitle } from "@/src/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface RecentTransactionItemProps {
  item: WalletTransaction;
  onPress: () => void;
}

const RecentTransactionItem = ({ item, onPress }: RecentTransactionItemProps) => {
  const isCredit = item.type === "CREDIT";
  const isReferral =
    item.reason === "REFERRAL_CREDIT" ||
    item.description?.toLowerCase().includes("referral") ||
    item.reference?.toUpperCase().includes("REFERRAL");

  const getIcon = () => {
    if (isReferral) {
      return <Ionicons name="people-outline" size={18} color="#155D5F" />;
    }
    switch (item.reason) {
      case "WALLET_TOPUP":
        return <Ionicons name="wallet-outline" size={20} color="#155D5F" />;
      case "WITHDRAWAL":
        return <Ionicons name="arrow-up" size={18} color="white" />;
      default:
        return isCredit ? (
          <Ionicons name="arrow-down" size={18} color="white" />
        ) : (
          <Ionicons name="arrow-up" size={18} color="white" />
        );
    }
  };

  const getIconBg = () => {
    if (item.reason === "WALLET_TOPUP" || isReferral) {
      return "bg-[#E7F5F5]";
    }
    return isCredit ? "bg-[#10B981]" : "bg-[#155D5F]";
  };

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const cleaned = String(val).replace(/[^0-9.-]/g, "");
    const raw = parseFloat(cleaned);
    if (isNaN(raw)) return "0.00";
    const amountNum = Math.abs(raw) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-[16px] px-4 py-3.5 mb-2.5 flex-row items-center border border-gray-100"
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${getIconBg()}`}
      >
        {getIcon()}
      </View>

      <View className="flex-1 mr-2 justify-center">
        <Text
          className="text-[#1A1A1A] font-bold text-[13px] mb-0.5"
          numberOfLines={1}
        >
          {getCleanTransactionTitle(item)}
        </Text>
        <Text className="text-[#9CA3AF] text-[11px]">{formattedDate}</Text>
      </View>

      <View className="items-end shrink-0">
        <Text
          className={`text-[13px] font-bold mb-1 ${
            isCredit ? "text-[#10B981]" : "text-[#DC2626]"
          }`}
        >
          {isCredit ? "+" : "-"}₦{formatAmount(item.amount)}
        </Text>
        <View className="bg-[#E7F5F5] px-2 py-0.5 rounded-[6px]">
          <Text className="text-[9px] font-bold text-[#155D5F]">Success</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const RecentTransactionList = () => {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetWalletTransactionsQuery(
    { limit: 5 },
    { refetchOnMountOrArgChange: true }
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const transactions = data?.items || [];

  if (isLoading) {
    return (
      <View className="mb-4">
        <RecentActivitySkeleton />
        <RecentActivitySkeleton />
        <RecentActivitySkeleton />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View className="mb-4 bg-[#F8F8F8] rounded-[24px] p-8 items-center justify-center">
        <Text className="text-[#9CA3AF] font-medium text-sm">
          No recent transactions
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      {transactions.slice(0, 5).map((item) => (
        <RecentTransactionItem
          key={`recent-tx-${item.id}`}
          item={item}
          onPress={() =>
            router.push({
              pathname: "/transactions/detail",
              params: { id: item.id },
            } as any)
          }
        />
      ))}
    </View>
  );
};
