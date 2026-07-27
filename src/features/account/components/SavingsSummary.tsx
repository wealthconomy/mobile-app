import { Skeleton } from "@/src/components/common/skeletons";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface SavingsSummaryProps {
  balanceVisible: boolean;
  onToggleBalance: () => void;
  totalSavings?: string | number;
  dailyGrowth?: string | number;
  showGrowth?: boolean;
  loading?: boolean;
}

export const SavingsSummary = React.memo(
  ({
    balanceVisible,
    onToggleBalance,
    totalSavings,
    dailyGrowth,
    showGrowth = true,
    loading,
  }: SavingsSummaryProps) => {
    const parsedBalance = useMemo(() => {
      if (
        totalSavings === undefined ||
        totalSavings === null ||
        totalSavings === ""
      ) {
        return { integerPart: "₦0", decimalPart: ".00" };
      }
      const numStr =
        typeof totalSavings === "number"
          ? totalSavings.toFixed(2)
          : String(totalSavings);
      const cleaned = numStr.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      const integerVal = Number(parts[0] || 0);
      const formattedInt = `₦${integerVal.toLocaleString("en-NG")}`;
      const decimalVal = parts[1]
        ? `.${parts[1].slice(0, 2).padEnd(2, "0")}`
        : ".00";
      return { integerPart: formattedInt, decimalPart: decimalVal };
    }, [totalSavings]);

    const formattedGrowth = useMemo(() => {
      if (
        dailyGrowth === undefined ||
        dailyGrowth === null ||
        dailyGrowth === ""
      ) {
        return "₦0.00";
      }
      const numVal =
        typeof dailyGrowth === "number"
          ? dailyGrowth
          : Number(String(dailyGrowth).replace(/[^0-9.]/g, ""));
      if (isNaN(numVal) || numVal === 0) return "₦0.00";
      return `₦${numVal.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }, [dailyGrowth]);

    return (
      <Animated.View
        entering={FadeInDown.duration(600).delay(250)}
        className="mb-8"
      >
        <View className="flex-row items-center mb-1">
          <Text className="text-sm font-bold text-[#4B5563] mr-2">
            Total Savings
          </Text>
          <TouchableOpacity onPress={onToggleBalance} activeOpacity={0.7}>
            <Ionicons
              name={balanceVisible ? "eye-outline" : "eye-off-outline"}
              size={16}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <Skeleton width={180} height={40} />
        ) : (
          <Text className="text-[32px] font-extrabold text-[#323232]">
            {balanceVisible ? (
              <>
                {parsedBalance.integerPart}
                <Text className="text-[#9CA3AF]">
                  {parsedBalance.decimalPart}
                </Text>
              </>
            ) : (
              "••••••••"
            )}
          </Text>
        )}

        {showGrowth && (
          <Text className="text-[14px] font-semibold text-[#4B5563] mt-1">
            Your wealth grew by{" "}
            <Text className="text-[#10B981]">{formattedGrowth} today ↑</Text>
          </Text>
        )}
      </Animated.View>
    );
  }
);

SavingsSummary.displayName = "SavingsSummary";
