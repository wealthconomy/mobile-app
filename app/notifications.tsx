import Skeleton from "@/src/components/common/Skeleton";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
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
  type:
    | "group"
    | "success"
    | "card"
    | "growth"
    | "goal"
    | "admin"
    | "transfer"
    | "received";
  title: string;
  description: string;
  date: string;
  amount?: string;
  status?: "Successful" | "Failed" | "Pending";
  image?: any;
  iconName: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons";
  iconColor: string;
  circleColor: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "group",
    title: "Wealth Group 🔔🔔🔔🔔🔔",
    description:
      'Contribution Reminder: "Tomorrow is Group Save Day! 🗓 Ensure your wallet is funded so your team hits the target (N68,000.00)."',
    date: "April 12, 2023 | 09:45:00",
    iconName: "account-group",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#FFFFFF",
    circleColor: "#4CAF50",
  },
  {
    id: "2",
    type: "success",
    title: "Success!",
    description:
      '"N43,922.94 has been successfully moved to your Wealth Fix portfolio."',
    date: "April 12, 2023 | 09:45:00",
    iconName: "lock",
    iconFamily: "Ionicons",
    iconColor: "#FFFFFF",
    circleColor: "#4CAF50",
  },
  {
    id: "3",
    type: "card",
    title: "Card Deposit - Simon Peter",
    description: "April 12, 2023",
    date: "April 12, 2023 | 09:45:00",
    amount: "-N68,000.00",
    status: "Successful",
    iconName: "card-outline",
    iconFamily: "Ionicons",
    iconColor: "#FF5252",
    circleColor: "#FFEBEE",
  },
  {
    id: "4",
    type: "growth",
    title: "The Daily Growth",
    description:
      '"Your wealth grew by N1,363 today! 📈 Your Wealth Flex balance is now N43,292."',
    date: "April 12, 2023 | 09:45:00",
    iconName: "trending-up",
    iconFamily: "Ionicons",
    iconColor: "#FFFFFF",
    circleColor: "#4CAF50",
  },
  {
    id: "5",
    type: "goal",
    title: "Goal Achieved 🎯🎯🎯🎯🎯",
    description:
      "\"It's time for your monthly 'Family Wealth' contribution. Keep the legacy growing!\"",
    date: "April 12, 2023 | 09:45:00",
    iconName: "target",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#FFFFFF",
    circleColor: "#4CAF50",
  },
  {
    id: "6",
    type: "admin",
    title: "Admin Role Request",
    description: "From Wealthy People Savings Tribe",
    date: "April 12, 2023 | 09:45:00",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=200",
    iconName: "account-cog",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#FFFFFF",
    circleColor: "#155D5F",
  },
  {
    id: "7",
    type: "transfer",
    title: "Funds Transfer to Olaniyi",
    description: "April 12, 2023",
    date: "April 12, 2023 | 09:45:00",
    amount: "N68,000.00",
    status: "Failed",
    iconName: "arrow-up-right",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#FFFFFF",
    circleColor: "#FF5252",
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
        <Skeleton
          width="60%"
          height={16}
          style={{ borderRadius: 4, backgroundColor: "#E1E1E1" }}
        />
        <Skeleton
          width="20%"
          height={16}
          style={{ borderRadius: 4, backgroundColor: "#E1E1E1" }}
        />
      </View>
      <Skeleton
        width="90%"
        height={12}
        style={{ borderRadius: 4, marginBottom: 8, backgroundColor: "#E1E1E1" }}
      />
      <View className="flex-row justify-between items-center">
        <Skeleton
          width="40%"
          height={10}
          style={{ borderRadius: 2, backgroundColor: "#E1E1E1" }}
        />
        <Skeleton
          width={60}
          height={18}
          style={{ borderRadius: 8, backgroundColor: "#E1E1E1" }}
        />
      </View>
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
          <Text
            className={`text-[15px] font-bold ${item.type === "success" ? "text-[#4CAF50]" : "text-[#323232]"} flex-1`}
          >
            {item.title}
          </Text>
          {item.amount && (
            <Text className="text-sm font-bold text-[#323232]">
              {item.amount}
            </Text>
          )}
        </View>
        <Text
          className="text-[13px] text-[#6B7280] leading-[18px] mb-2"
          numberOfLines={3}
        >
          {item.description}
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-[11px] text-[#9CA3AF]">
            {item.type === "card" ||
            item.type === "transfer" ||
            item.type === "received"
              ? item.description
              : item.date}
          </Text>
          {item.status && (
            <View
              className={`px-[10px] py-1 rounded-[8px] ${item.status === "Successful" ? "bg-[#E7F5F5]" : item.status === "Failed" ? "bg-[#FFEBEE]" : "bg-[#FFF3E0]"}`}
            >
              <Text
                className={`text-[10px] font-bold ${item.status === "Successful" ? "text-[#155D5F]" : item.status === "Failed" ? "text-[#FF5252]" : "text-[#EF6C00]"}`}
              >
                {item.status}
              </Text>
            </View>
          )}
        </View>
      </View>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          className="w-[60px] h-10 rounded-sm ml-2"
        />
      )}
    </View>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) return "Today";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) =>
    (new Date(year, month, 1).getDay() + 6) % 7;

  const renderCalendar = () => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = [];
    const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} className="w-[14.28%] aspect-square" />,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isFuture = currentDate > new Date();
      const isSelected =
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year;
      days.push(
        <TouchableOpacity
          key={day}
          disabled={isFuture}
          className={`w-[14.28%] aspect-square items-center justify-center mb-1 ${isSelected ? "bg-[#155D5F] rounded-full" : ""}`}
          onPress={() => setDate(new Date(year, month, day))}
        >
          <Text
            className={`text-[15px] ${isSelected ? "text-white font-bold" : isFuture ? "text-[#E5E7EB]" : "text-[#323232] font-medium"}`}
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
              className="w-[40px] text-center text-base font-semibold text-[#323232]"
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
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <View className="flex-row items-center justify-between px-4 h-14">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-[#323232]">
          Notification
        </Text>
        <View className="w-11" />
      </View>

      <View className="px-4 mb-4">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => {
            setViewDate(new Date(date));
            setShowPicker(true);
          }}
        >
          <Text className="text-sm font-bold text-[#323232]">
            {formatDate(date)}
          </Text>
          <Ionicons name="caret-down" size={12} color="#000" className="ml-1" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-[36px] px-6 pb-10 pt-3">
                <View className="w-20 h-1.5 bg-[#bababa] rounded-full self-center mb-6" />
                <Text className="text-[22px] font-extrabold text-[#323232] mb-5 mt-2">
                  Filter by date
                </Text>
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-lg font-bold text-[#323232]">
                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </Text>
                  <View className="flex-row space-x-4">
                    <TouchableOpacity
                      onPress={() => {
                        const d = new Date(viewDate);
                        d.setMonth(d.getMonth() - 1);
                        setViewDate(d);
                      }}
                      className="p-1"
                    >
                      <Ionicons name="chevron-back" size={20} color="#323232" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const d = new Date(viewDate);
                        d.setMonth(d.getMonth() + 1);
                        setViewDate(d);
                      }}
                      className="p-1"
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#323232"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {renderCalendar()}
                <TouchableOpacity
                  className="bg-[#155D5F] rounded-xl h-14 items-center justify-center"
                  onPress={() => setShowPicker(false)}
                >
                  <Text className="text-white text-base font-bold">
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={(loading ? [1, 2, 3, 4, 5] : NOTIFICATIONS) as any}
        keyExtractor={(item, idx) =>
          typeof item === "object"
            ? (item as NotificationItem).id
            : idx.toString()
        }
        renderItem={({ item }) =>
          loading ? (
            <NotificationCardSkeleton />
          ) : (
            <NotificationItemView item={item as NotificationItem} />
          )
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
