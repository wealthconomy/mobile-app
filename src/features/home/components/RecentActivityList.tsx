import { ArrowUpRight, ShieldCheck, UserPlus } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[#1A1A1A] font-bold text-lg">
          Recent Activities
        </Text>
        <TouchableOpacity>
          <Text className="text-[#155D5F] text-sm font-medium">View all</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-[#F8F8F8] rounded-[40px] p-4 pt-6">
        <ActivityItem
          title="Transfer to Wealth Flex"
          subtitle="April 12, 2023 | 09:45:00"
          amount="+N68,000.00"
          status="Successful"
          icon={<ArrowUpRight size={20} color="#155D5F" />}
          iconBg="#D1F2F2"
        />
        <ActivityItem
          title="Account Registered"
          subtitle="April 12, 2023 | 09:45:00"
          icon={<UserPlus size={20} color="#155D5F" />}
          iconBg="#E7EFEF"
        />
        <ActivityItem
          title="Password Changed"
          subtitle="April 12, 2023 | 09:45:00"
          icon={<ShieldCheck size={20} color="#155D5F" />}
          iconBg="#E7EFEF"
        />
      </View>
    </View>
  );
};
