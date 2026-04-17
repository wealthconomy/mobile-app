import Skeleton from "@/src/components/common/Skeleton";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationItem {
  id: string;
  type: "payment" | "blacklist" | "removal" | "admin" | "milestone";
  title: string;
  description: string;
  date: string;
  amount?: string;
  status?: "Successful" | "Failed" | "Pending";
  iconName: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons";
  iconColor: string;
  circleColor: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "payment",
    title: "Payment Received",
    description: "Tolu Olamide successfully paid their weekly contribution.",
    date: "April 17, 2026 | 09:45:00",
    amount: "N45,000.00",
    status: "Successful",
    iconName: "cash-outline",
    iconFamily: "Ionicons",
    iconColor: "#FFFFFF",
    circleColor: "#4CAF50",
  },
  {
    id: "2",
    type: "blacklist",
    title: "Member Blacklisted",
    description:
      "John Doe has been added to the group blacklist for non-payment.",
    date: "April 17, 2026 | 08:30:00",
    iconName: "ban-outline",
    iconFamily: "Ionicons",
    iconColor: "#FFFFFF",
    circleColor: "#EF4444",
  },
  {
    id: "3",
    type: "admin",
    title: "New Admin Appointed",
    description: "Boluwatife Daniel has been promoted to an Admin role.",
    date: "April 16, 2026 | 14:20:00",
    iconName: "shield-checkmark-outline",
    iconFamily: "Ionicons",
    iconColor: "#FFFFFF",
    circleColor: "#155D5F",
  },
  {
    id: "4",
    type: "milestone",
    title: "Milestone Reached! 🎯",
    description: "The group has reached 50% of the total savings goal!",
    date: "April 15, 2026 | 18:00:00",
    iconName: "trophy-outline",
    iconFamily: "Ionicons",
    iconColor: "#FFFFFF",
    circleColor: "#EAB308",
  },
  {
    id: "5",
    type: "removal",
    title: "Member Removed",
    description: "Sarah Jenkins was removed from the group by an admin.",
    date: "April 15, 2026 | 10:15:00",
    iconName: "person-remove-outline",
    iconFamily: "Ionicons",
    iconColor: "#FFFFFF",
    circleColor: "#EF4444",
  },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const NotificationCardSkeleton = () => (
  <View className="flex-row bg-[#F8F8F8] rounded-[16px] p-4 mb-3 items-start">
    <Skeleton
      width={40}
      height={40}
      circle
      style={{ marginRight: 12, backgroundColor: "#E1E1E1" }}
    />
    <View className="flex-1">
      <View className="flex-row justify-between mb-2">
        <Skeleton width="60%" height={16} />
        <Skeleton width="20%" height={16} />
      </View>
      <Skeleton width="90%" height={12} style={{ marginBottom: 8 }} />
    </View>
  </View>
);

const NotificationItemView = ({ item }: { item: NotificationItem }) => {
  const IconComponent =
    item.iconFamily === "Ionicons" ? Ionicons : MaterialCommunityIcons;

  return (
    <View className="flex-row bg-[#F8F8F8] rounded-[16px] p-4 mb-3 items-start">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: item.circleColor }}
      >
        <IconComponent
          name={item.iconName as any}
          size={20}
          color={item.iconColor}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-[15px] font-bold text-[#323232] flex-1">
            {item.title}
          </Text>
          {item.amount && (
            <Text className="text-sm font-bold text-[#323232]">
              {item.amount}
            </Text>
          )}
        </View>
        <Text className="text-[13px] text-[#6B7280] leading-[18px] mb-2">
          {item.description}
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-[11px] text-[#9CA3AF]">{item.date}</Text>
          {item.status && (
            <View className="px-[10px] py-1 rounded-[8px] bg-[#E7F5F5]">
              <Text className="text-[10px] font-bold text-[#155D5F]">
                {item.status}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default function GroupNotificationsScreen() {
  const { id } = useLocalSearchParams();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (d: Date) => {
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderCalendar = () => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = [];
    const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} className="w-[14.28%] aspect-square" />,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year;
      days.push(
        <TouchableOpacity
          key={day}
          className={`w-[14.28%] aspect-square items-center justify-center mb-1 ${isSelected ? "bg-[#155D5F] rounded-full" : ""}`}
          onPress={() => {
            setDate(new Date(year, month, day));
            setShowPicker(false);
          }}
        >
          <Text
            className={`text-[15px] ${isSelected ? "text-white font-bold" : "text-[#323232]"}`}
          >
            {day}
          </Text>
        </TouchableOpacity>,
      );
    }

    return (
      <View className="mb-6">
        <View className="flex-row justify-between mb-4">
          {dayNames.map((d) => (
            <Text
              key={d}
              className="w-[40px] text-center text-sm font-semibold text-[#64748B]"
            >
              {d}
            </Text>
          ))}
        </View>
        <View className="flex-row flex-wrap">{days}</View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between px-4 h-14">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold text-[#323232]">
          Group Notifications
        </Text>
        <View className="w-11" />
      </View>

      <View className="px-5 mb-4 mt-2">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setShowPicker(true)}
        >
          <Text className="text-sm font-bold text-[#323232]">
            {formatDate(date)}
          </Text>
          <Ionicons
            name="caret-down"
            size={12}
            color="#000"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-[36px] px-6 pb-10 pt-3">
                <View className="w-20 h-1.5 bg-[#bababa] rounded-full self-center mb-6" />
                <Text className="text-[22px] font-extrabold text-[#323232] mb-5">
                  Filter by date
                </Text>
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-lg font-bold text-[#155D5F]">
                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </Text>
                  <View className="flex-row space-x-4">
                    <TouchableOpacity
                      onPress={() =>
                        setViewDate(
                          new Date(
                            viewDate.getFullYear(),
                            viewDate.getMonth() - 1,
                          ),
                        )
                      }
                    >
                      <Ionicons name="chevron-back" size={24} color="#323232" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setViewDate(
                          new Date(
                            viewDate.getFullYear(),
                            viewDate.getMonth() + 1,
                          ),
                        )
                      }
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#323232"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {renderCalendar()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList<NotificationItem | number>
        data={loading ? [1, 2, 3, 4, 5] : MOCK_NOTIFICATIONS}
        keyExtractor={(item, idx) =>
          typeof item === "object" ? item.id : idx.toString()
        }
        renderItem={({ item }) =>
          loading ? (
            <NotificationCardSkeleton />
          ) : (
            <NotificationItemView item={item as NotificationItem} />
          )
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
