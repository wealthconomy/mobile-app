import Header from "@/src/components/common/Header";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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

interface Activity {
  id: string;
  type: string;
  date: string;
  time: string;
  amount?: string;
  status?: "Successful" | "Failed" | "Pending";
  category:
    | "account_registered"
    | "password_changed"
    | "kyc"
    | "level_upgrade"
    | "transfer"
    | "received"
    | "wealthflex";
  isCredit?: boolean;
}

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "Account Registered",
    date: "April 12, 2023",
    time: "09:45:00",
    category: "account_registered",
  },
  {
    id: "2",
    type: "Password Changed",
    date: "April 12, 2023",
    time: "09:45:00",
    category: "password_changed",
  },
  {
    id: "3",
    type: "Transfer to Wealth Flex",
    date: "April 12, 2023",
    time: "09:45:00",
    amount: "68,000.00",
    status: "Successful",
    category: "wealthflex",
    isCredit: true,
  },
  {
    id: "4",
    type: "Level 3 Completed",
    date: "April 12, 2023",
    time: "09:45:00",
    category: "level_upgrade",
  },
  {
    id: "5",
    type: "Transfer to Olaniyi",
    date: "April 12, 2023",
    time: "09:45:00",
    amount: "68,000.00",
    status: "Failed",
    category: "transfer",
    isCredit: false,
  },
  {
    id: "6",
    type: "Received from Oluwatope",
    date: "April 12, 2023",
    time: "09:45:00",
    amount: "68,000.00",
    status: "Pending",
    category: "received",
    isCredit: true,
  },
  {
    id: "7",
    type: "Transfer to Olaniyi",
    date: "April 12, 2023",
    time: "09:45:00",
    amount: "68,000.00",
    status: "Successful",
    category: "transfer",
    isCredit: false,
  },
  {
    id: "8",
    type: "Received from Oluwatope",
    date: "April 12, 2023",
    time: "09:45:00",
    amount: "68,000.00",
    status: "Successful",
    category: "received",
    isCredit: true,
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

export default function ActivitiesScreen() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const formatDateLabel = (d: Date) => {
    if (isToday(d)) return "Today";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} className="w-[14.28%] aspect-square" />,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentLabelDate = new Date(year, month, day);
      const isFuture = currentLabelDate > today;
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
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Activities" />

      <View className="flex-1 bg-white">
        <View className="px-5 py-2">
          <TouchableOpacity
            onPress={() => {
              setViewDate(new Date(date));
              setShowPicker(true);
            }}
            className="flex-row items-center self-start mb-2"
          >
            <Text className="text-sm font-bold text-[#323232] mr-1">
              {formatDateLabel(date)}
            </Text>
            <Ionicons name="caret-down" size={12} color="#000" />
          </TouchableOpacity>
        </View>

        <View
          className="flex-1 mx-2.5 mb-4 bg-[#F6F6F6] rounded-[20px] p-[10px]"
          style={{ width: 383, alignSelf: "center" }}
        >
          <FlatList
            data={ACTIVITIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ActivityItem
                item={item}
                onPress={() => {
                  // Optional: handle activity press
                }}
              />
            )}
            ItemSeparatorComponent={() => <View className="h-[10px]" />}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
              <View className="bg-white rounded-t-[36px] px-6 pb-12 pt-3">
                <View className="w-20 h-1.5 bg-[#bababa] rounded-full self-center mb-6" />
                <Text className="text-[22px] font-bold text-[#323232] mb-5 mt-2">
                  Filter by date
                </Text>
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-lg font-bold text-[#323232]">
                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </Text>
                  <View className="flex-row gap-x-4">
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
                  className="bg-[#155D5F] rounded-2xl h-14 items-center justify-center"
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
    </SafeAreaView>
  );
}

const ActivityItem = ({
  item,
  onPress,
}: {
  item: Activity;
  onPress: () => void;
}) => {
  const getIcon = () => {
    switch (item.category) {
      case "account_registered":
        return (
          <MaterialCommunityIcons
            name="account-check-outline"
            size={22}
            color="#155D5F"
          />
        );
      case "password_changed":
        return (
          <View className="flex-row items-center justify-center">
            <Text className="text-[#155D5F] font-bold text-xs">***</Text>
          </View>
        );
      case "wealthflex":
        return <Ionicons name="people-outline" size={22} color="#155D5F" />;
      case "level_upgrade":
        return <FontAwesome5 name="medal" size={18} color="#FF9800" />;
      case "transfer":
        return <Ionicons name="arrow-up" size={20} color="white" />;
      case "received":
        return <Ionicons name="arrow-down" size={20} color="white" />;
      default:
        return <Ionicons name="help" size={20} color="white" />;
    }
  };

  const getIconBg = () => {
    switch (item.category) {
      case "account_registered":
      case "password_changed":
        return "bg-[#E7EFEF]";
      case "wealthflex":
        return "bg-[#D1F2F2]";
      case "level_upgrade":
        return "bg-white border border-gray-100";
      default:
        return "bg-[#155D5F]";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Successful":
        return { bg: "bg-[#E7F5F5]", text: "text-[#155D5F]" };
      case "Failed":
        return { bg: "bg-[#FFEBEE]", text: "text-[#FF5252]" };
      case "Pending":
        return { bg: "bg-[#FFF3E0]", text: "text-[#EF6C00]" };
      default:
        return { bg: "bg-transparent", text: "text-transparent" };
    }
  };

  const statusStyle = item.status ? getStatusStyle(item.status) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white rounded-[24px] px-4 h-[76px] relative mb-1"
      style={{ width: 365, alignSelf: "center" }}
    >
      <View
        className={`w-[44px] h-[44px] rounded-full items-center justify-center mr-4 ${getIconBg()}`}
      >
        {getIcon()}
      </View>

      <View className="flex-1">
        <Text
          className="text-[15px] font-bold text-[#323232] mb-0.5"
          numberOfLines={1}
        >
          {item.type}
        </Text>
        <Text className="text-[12px] text-[#9CA3AF] font-medium">
          {item.date} | {item.time}
        </Text>
      </View>

      {(item.amount || item.status) && (
        <View className="items-end">
          {item.amount && (
            <Text className="text-[15px] font-bold mb-1 text-[#323232]">
              {item.isCredit ? "+" : "-"}₦{item.amount}
            </Text>
          )}
          {statusStyle && (
            <View className={`${statusStyle.bg} px-3 py-1 rounded-[10px]`}>
              <Text className={`text-[10px] font-bold ${statusStyle.text}`}>
                {item.status}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
