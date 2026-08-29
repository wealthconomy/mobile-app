import { ArrowUpRight, ShieldCheck, UserPlus } from "lucide-react-native";
import React from "react";
import { useGetMyActivitiesQuery } from "@/src/store/api/activityApi";
import { RecentActivitySkeleton } from "./DashboardSkeletons";
import { Text, View } from "react-native";

interface ActivityItemProps {
  title: string;
  subtitle: string;
  amount?: string;
  status?: string;
  icon: React.ReactNode;
  iconBg: string;
}

const ActivityItem = ({
  title,
  subtitle,
  amount,
  status,
  icon,
  iconBg,
}: ActivityItemProps) => (
  <View className="bg-white rounded-3xl p-4 mb-3 flex-row items-center border border-gray-100">
    <View
      style={{ backgroundColor: iconBg }}
      className="w-12 h-12 rounded-full items-center justify-center mr-4"
    >
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-[#1A1A1A] font-bold text-sm mb-0.5">{title}</Text>
      <Text className="text-[#6B7280] text-[10px]">{subtitle}</Text>
    </View>
    <View className="items-end">
      {amount && (
        <Text className="text-[#1A1A1A] font-bold text-sm mb-1">{amount}</Text>
      )}
      {status && (
        <View className="bg-[#E7F5F5] px-2.5 py-1 rounded-md">
          <Text className="text-[#155D5F] text-[9px] font-bold">{status}</Text>
        </View>
      )}
    </View>
  </View>
);

export const RecentActivityList = () => {
  const { data: response, isLoading } = useGetMyActivitiesQuery({ limit: 5 });
  

  const activities = response?.data?.items || [];

  const getIconData = (type: string) => {
    switch (type) {
      case "FINANCIAL":
        return { icon: <ArrowUpRight size={20} color="#155D5F" />, bg: "#D1F2F2" };
      case "SECURITY":
        return { icon: <ShieldCheck size={20} color="#155D5F" />, bg: "#E7EFEF" };
      case "SYSTEM":
      default:
        return { icon: <UserPlus size={20} color="#155D5F" />, bg: "#E7EFEF" };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + 
           " | " + 
           date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
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
        {activities.map((activity) => {
          const { icon, bg } = getIconData(activity.type);
          return (
            <ActivityItem
              key={activity.id}
              title={activity.title}
              subtitle={formatDate(activity.createdAt)}
              amount={activity.metadata?.amount ? `+N${activity.metadata.amount}` : undefined}
              status={activity.metadata?.status || undefined}
              icon={icon}
              iconBg={bg}
            />
          );
        })}
      </View>
    </View>
  );
};
