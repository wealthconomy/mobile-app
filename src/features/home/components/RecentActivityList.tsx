import { ArrowDownLeft, ArrowUpRight, CreditCard, RefreshCw } from "lucide-react-native";
import React from "react";
import { useGetWalletTransactionsQuery } from "@/src/store/api/walletApi";
import { RecentActivitySkeleton } from "./DashboardSkeletons";
import { Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface ActivityItemProps {
  title: string;
  subtitle: string;
  amount?: string;
  isCredit?: boolean;
  status?: string;
  icon: React.ReactNode;
  iconBg: string;
  onPress?: () => void;
}

const ActivityItem = ({
  title,
  subtitle,
  amount,
  isCredit = true,
  status,
  icon,
  iconBg,
  onPress,
}: ActivityItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    className="bg-white rounded-3xl p-4 mb-3 flex-row items-center border border-gray-100"
  >
    <View
      style={{ backgroundColor: iconBg }}
      className="w-12 h-12 rounded-full items-center justify-center mr-4"
    >
      {icon}
    </View>
    <View className="flex-1 mr-2">
      <Text className="text-[#1A1A1A] font-bold text-sm mb-0.5" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-[#6B7280] text-[10px]">{subtitle}</Text>
    </View>
    <View className="items-end">
      {amount && (
        <Text
          className={`font-bold text-sm mb-1 ${
            isCredit ? "text-[#10B981]" : "text-[#1A1A1A]"
          }`}
        >
          {isCredit ? "+" : "-"}₦{amount}
        </Text>
      )}
      {status && (
        <View className="bg-[#E7F5F5] px-2.5 py-1 rounded-md">
          <Text className="text-[#155D5F] text-[9px] font-bold">{status}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export const RecentActivityList = () => {
  const router = useRouter();
  const { data: response, isLoading } = useGetWalletTransactionsQuery({ limit: 5 });

  const transactions = response?.items || [];

  const formatAmount = (val?: string) => {
    if (!val) return "0.00";
    const amountNum = parseFloat(val) / 100;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const getIconData = (reason: string, isCredit: boolean) => {
    if (reason === "WALLET_TOPUP") {
      return { icon: <CreditCard size={20} color="#155D5F" />, bg: "#D1F2F2" };
    }
    if (reason === "WITHDRAWAL") {
      return { icon: <ArrowUpRight size={20} color="#F44336" />, bg: "#FEE2E2" };
    }
    if (isCredit) {
      return { icon: <ArrowDownLeft size={20} color="#10B981" />, bg: "#D1FAE5" };
    }
    return { icon: <RefreshCw size={20} color="#155D5F" />, bg: "#E7EFEF" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " | " +
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getTitle = (item: any) => {
    if (item.description) return item.description;
    switch (item.reason) {
      case "WALLET_TOPUP":
        return "Wallet Top-up";
      case "WITHDRAWAL":
        return "Withdrawal";
      case "REFERRAL_CREDIT":
        return "Referral Bonus";
      default:
        return item.reason || "Transaction";
    }
  };

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
      <View className="mb-4 bg-[#F8F8F8] rounded-[40px] p-8 items-center justify-center">
        <Text className="text-[#9CA3AF] font-medium text-sm">No recent transactions</Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <View className="bg-[#F8F8F8] rounded-[40px] p-4 pt-6">
        {transactions.map((tx) => {
          const isCredit = tx.type === "CREDIT";
          const { icon, bg } = getIconData(tx.reason, isCredit);
          return (
            <ActivityItem
              key={tx.id}
              title={getTitle(tx)}
              subtitle={formatDate(tx.createdAt)}
              amount={formatAmount(tx.amount)}
              isCredit={isCredit}
              status="Success"
              icon={icon}
              iconBg={bg}
              onPress={() =>
                router.push({
                  pathname: "/transactions/detail",
                  params: { id: tx.id },
                } as any)
              }
            />
          );
        })}
      </View>
    </View>
  );
};
