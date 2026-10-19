import { NotificationItem } from "@/src/store/api/notificationApi";
import {
  formatNotificationTimestamp,
  getNotificationVisuals,
} from "../utils/notificationHelpers";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface NotificationItemViewProps {
  item: NotificationItem;
  onPress: () => void;
  showRightImage?: boolean;
}

export const NotificationItemView = ({
  item,
  onPress,
  showRightImage = true,
}: NotificationItemViewProps) => {
  const visuals = getNotificationVisuals(item);
  const IconComponent =
    visuals.iconFamily === "Ionicons" ? Ionicons : MaterialCommunityIcons;

  const amount = item.data?.amount || item.data?.formattedAmount;
  const status = item.data?.status;
  const image = showRightImage ? (item.data?.image || item.user?.imageUrl) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row rounded-[16px] p-4 mb-3 items-start border ${
        !item.isRead
          ? "bg-[#EEF7F8] border-[#D0EBEB]"
          : "bg-[#F8F8F8] border-transparent"
      }`}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3 relative"
        style={{ backgroundColor: visuals.circleColor }}
      >
        <IconComponent
          name={visuals.iconName as any}
          size={20}
          color={visuals.iconColor}
        />
        {!item.isRead && (
          <View className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#F44336] border border-white" />
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text
            className={`text-[15px] ${
              !item.isRead
                ? "font-extrabold text-[#155D5F]"
                : "font-bold text-[#323232]"
            } flex-1 mr-2`}
          >
            {item.title}
          </Text>
          {amount && (
            <Text className="text-sm font-bold text-[#323232]">{amount}</Text>
          )}
        </View>
        <Text
          className={`text-[13px] leading-[18px] mb-2 ${
            !item.isRead ? "text-[#374151] font-medium" : "text-[#6B7280]"
          }`}
          numberOfLines={3}
        >
          {item.body}
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-[11px] text-[#9CA3AF]">
            {formatNotificationTimestamp(item.createdAt)}
          </Text>
          {status && (
            <View
              className={`px-[10px] py-1 rounded-[8px] ${
                status === "Successful"
                  ? "bg-[#E7F5F5]"
                  : status === "Failed"
                  ? "bg-[#FFEBEE]"
                  : "bg-[#FFF3E0]"
              }`}
            >
              <Text
                className={`text-[10px] font-bold ${
                  status === "Successful"
                    ? "text-[#155D5F]"
                    : status === "Failed"
                    ? "text-[#FF5252]"
                    : "text-[#EF6C00]"
                }`}
              >
                {status}
              </Text>
            </View>
          )}
        </View>
      </View>
      {image && (
        <Image
          source={{ uri: image }}
          className="w-[60px] h-10 rounded-sm ml-2"
        />
      )}
    </TouchableOpacity>
  );
};
