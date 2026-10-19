import Header from "@/src/components/common/Header";
import { useGetActivityDetailQuery } from "@/src/store/api/activityApi";
import {
  getActivityBadgeData,
  getActivityIconData,
  getFriendlyActivityTitle,
  extractActivityAmount,
} from "@/src/utils/activityHelpers";
import {
  formatCurrencyInText,
  formatMetadataKey,
  formatMetadataValue,
} from "@/src/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: response, isLoading } = useGetActivityDetailQuery(
    id as string,
    { skip: !id }
  );

  const activity = response?.data || (response as any);

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F8F9FA",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#155D5F" />
      </SafeAreaView>
    );
  }

  if (!activity || !activity.id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
        <Header title="Activity Detail" showBack={true} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#6B7280" }}>Activity not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { icon, bg } = getActivityIconData(activity, 26);
  const badge = getActivityBadgeData(activity);
  const friendlyTitle = getFriendlyActivityTitle(activity);
  const amountStr = extractActivityAmount(activity);

  const formattedDate = new Date(activity.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(activity.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasMetadata =
    activity.metadata &&
    typeof activity.metadata === "object" &&
    Object.keys(activity.metadata).length > 0;

  const hasMetadataAmount = Boolean(
    hasMetadata &&
      Object.keys(activity.metadata!).some((k) => {
        const l = k.toLowerCase();
        return (
          l.includes("amount") ||
          l.includes("interest") ||
          l.includes("credit") ||
          l.includes("debit") ||
          l.includes("kobo")
        );
      })
  );

  // Directly extract the formatted metadata amount (using the exact same logic as DetailRow)
  const metadataAmountEntry = hasMetadata
    ? Object.entries(activity.metadata!).find(([k]) => {
        const lower = k.toLowerCase();
        return (
          lower === "amount" ||
          lower === "interest" ||
          lower === "amountkobo" ||
          lower === "interestamount" ||
          lower === "interestkobo" ||
          lower === "credit" ||
          lower === "kobo"
        );
      })
    : null;

  const metadataAmountStr = metadataAmountEntry
    ? formatMetadataValue(metadataAmountEntry[0], metadataAmountEntry[1])
    : null;

  // Ensure both top summary and detail row use the exact same unrounded 2-decimal format
  const displayAmount =
    metadataAmountStr && metadataAmountStr.startsWith("₦") && metadataAmountStr !== "₦0.00"
      ? metadataAmountStr
      : amountStr || metadataAmountStr;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8F9FA]">
      <StatusBar barStyle="dark-content" />
      <Header title="Activity Detail" showBack={true} />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
      >
        {/* Top Card */}
        <View className="bg-white rounded-[30px] p-6 border border-[#E5E7EB] mb-6">
          <View className="flex-row justify-between items-start">
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text
                className="text-[14px] font-bold text-[#6B7280] mb-1"
                numberOfLines={1}
              >
                {friendlyTitle}
              </Text>

              {displayAmount ? (() => {
                const parts = displayAmount.split(".");
                const nairaPart = parts[0];
                const koboPart = parts[1] ? `.${parts[1]}` : ".00";
                return (
                  <Text className="text-[28px] font-bold text-[#10B981] my-0.5">
                    +{nairaPart}
                    <Text className="text-[#10B981] text-[20px] font-bold">{koboPart}</Text>
                  </Text>
                );
              })() : null}

              <View className="self-start mt-1.5 mb-2">
                <View
                  style={{ backgroundColor: badge.bg }}
                  className="px-2.5 py-0.5 rounded-[8px]"
                >
                  <Text
                    style={{ color: badge.text }}
                    className="text-[10px] font-bold tracking-wide"
                  >
                    {badge.label}
                  </Text>
                </View>
              </View>

              <Text className="text-[#9CA3AF] text-[11px]">
                {formattedDate} • {formattedTime}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
              <View
                style={{ backgroundColor: bg }}
                className="w-[52px] h-[52px] rounded-full items-center justify-center"
              >
                {icon}
              </View>
            </View>
          </View>
        </View>

        {/* Detailed Info Card */}
        <View className="bg-white rounded-[30px] border border-[#E5E7EB] overflow-hidden">
          <View className="p-5 border-b border-[#F3F4F6]">
            <Text className="text-[15px] font-bold text-[#323232]">
              Details
            </Text>
          </View>

          <View className="p-5">
            {/* Description Box */}
            {activity.description ? (
              <View className="bg-[#F9FAFB] p-4 rounded-xl mb-4 border border-[#F3F4F6]">
                <Text className="text-[13px] font-bold text-[#374151] leading-[18px]">
                  {formatCurrencyInText(activity.description)}
                </Text>
              </View>
            ) : null}

            <View className="gap-y-5">
              <DetailRow label="Activity ID" value={activity.id} />
              <DetailRow label="Type" value={badge.label} />
              {amountStr && !hasMetadataAmount && (
                <DetailRow label="Amount" value={amountStr} isSuccess />
              )}
              <DetailRow
                label="Logged At"
                value={`${formattedDate} | ${formattedTime}`}
              />

              {hasMetadata &&
                Object.entries(activity.metadata!).map(([key, val]) => {
                  const formattedKey = formatMetadataKey(key);
                  const formattedVal = formatMetadataValue(key, val);
                  const isAmountKey =
                    key.toLowerCase().includes("amount") ||
                    key.toLowerCase().includes("interest") ||
                    key.toLowerCase().includes("credit") ||
                    key.toLowerCase().includes("kobo");

                  return (
                    <DetailRow
                      key={key}
                      label={formattedKey}
                      value={formattedVal}
                      isSuccess={isAmountKey}
                    />
                  );
                })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({
  label,
  value,
  isSuccess,
  isDanger,
}: {
  label: string;
  value: string;
  isSuccess?: boolean;
  isDanger?: boolean;
}) => (
  <View className="flex-row justify-between items-start py-0.5">
    <Text className="text-[14px] text-[#4B5563] font-medium mr-3 shrink-0">
      {label}
    </Text>
    <View className="flex-row items-center flex-1 justify-end">
      {isSuccess && (
        <Ionicons
          name="checkmark-circle"
          size={16}
          color="#10B981"
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        className={`text-[13px] font-bold text-right flex-shrink ${
          isDanger
            ? "text-[#DC2626] font-extrabold"
            : isSuccess
            ? "text-[#10B981]"
            : "text-[#323232]"
        }`}
        selectable
      >
        {value}
      </Text>
    </View>
  </View>
);
