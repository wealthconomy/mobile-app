import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useGetMyActivitiesQuery } from "@/src/store/api/activityApi";
import { UserActivity } from "@/src/types/activity";
import { getActivityIconData, getFriendlyActivityTitle } from "@/src/utils/activityHelpers";
import { RecentActivitySkeleton } from "./DashboardSkeletons";

interface ActivityItemProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  onPress?: () => void;
}

const ActivityItem = ({
  title,
  subtitle,
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
    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
  </TouchableOpacity>
);

export const RecentActivityList = () => {
  const router = useRouter();
  const { data: response, isLoading, refetch } = useGetMyActivitiesQuery(
    { limit: 5 },
    { refetchOnMountOrArgChange: true }
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const activities: UserActivity[] =
    (response?.data as any)?.items ||
    (Array.isArray(response?.data) ? response?.data : []);

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

  if (isLoading) {
    return (
      <View className="mb-4">
        <RecentActivitySkeleton />
        <RecentActivitySkeleton />
        <RecentActivitySkeleton />
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View className="mb-4 bg-[#F8F8F8] rounded-[40px] p-8 items-center justify-center">
        <Text className="text-[#9CA3AF] font-medium text-sm">No recent activities</Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <View className="bg-[#F8F8F8] rounded-[40px] p-4 pt-6">
        {activities.map((item, index) => {
          const { icon, bg } = getActivityIconData(item);
          return (
            <ActivityItem
              key={`home-act-${item.id}-${index}`}
              title={getFriendlyActivityTitle(item)}
              subtitle={formatDate(item.createdAt)}
              icon={icon}
              iconBg={bg}
              onPress={() =>
                router.push({
                  pathname: "/transactions/activities/[id]",
                  params: { id: item.id },
                } as any)
              }
            />
          );
        })}
      </View>
    </View>
  );
};
