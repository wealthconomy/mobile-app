import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface EmptyNotificationsViewProps {
  title?: string;
  description?: string;
}

export const EmptyNotificationsView = ({
  title = "No Notifications Yet",
  description = "When you receive updates on your savings, transactions, or tribe invites, they will appear here.",
}: EmptyNotificationsViewProps) => (
  <View className="items-center justify-center py-20 px-6">
    <View className="w-20 h-20 rounded-full bg-[#EEF7F8] items-center justify-center mb-4">
      <Ionicons name="notifications-off-outline" size={36} color="#155D5F" />
    </View>
    <Text className="text-[18px] font-extrabold text-[#323232] mb-2 text-center">
      {title}
    </Text>
    <Text className="text-[14px] text-[#6B7280] text-center leading-5">
      {description}
    </Text>
  </View>
);
