import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
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

interface Transaction {
  id: string;
  type: string;
  date: string;
  time: string;
  amount: string;
  status: "Successful" | "Failed" | "Pending";
  isCredit: boolean;
  unopened?: boolean;
  category: "transfer" | "received" | "wealthflex" | "group";
}

const TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "Transfer to Wealth Flex",
    date: "April 12, 2023",
    time: "03:05pm",
    amount: "68,000.00",
    status: "Successful",
    isCredit: false,
    unopened: true,
    category: "wealthflex",
  },
  {
    id: "2",
    type: "Transfer to Wealth Flex",
    date: "April 12, 2023",
    time: "02:30pm",
    amount: "68,000.00",
    status: "Successful",
    isCredit: true,
    category: "group",
  },
  {
    id: "3",
    type: "Transfer to Olaniyi",
    date: "April 12, 2023",
    time: "12:15pm",
    amount: "68,000.00",
    status: "Successful",
    isCredit: false,
    unopened: true,
    category: "transfer",
  },
  {
    id: "4",
    type: "Received from Oluwatope",
    date: "April 12, 2023",
    time: "10:00am",
    amount: "68,000.00",
    status: "Successful",
    isCredit: true,
    category: "received",
  },
  {
    id: "5",
    type: "Transfer to Olaniyi",
    date: "April 11, 2023",
    time: "Yesterday",
    amount: "68,000.00",
    status: "Failed",
    isCredit: false,
    category: "transfer",
  },
  {
    id: "6",
    type: "Received from Oluwatope",
    date: "April 11, 2023",
    time: "Yesterday",
    amount: "22,500.00",
    status: "Pending",
    isCredit: true,
    category: "received",
  },
  {
    id: "7",
    type: "Transfer to Abiodun",
    date: "April 10, 2023",
    time: "2 days ago",
    amount: "150,000.00",
    status: "Successful",
    isCredit: false,
    category: "transfer",
  },
  {
    id: "8",
    type: "Received from WealthFlex",
    date: "April 10, 2023",
    time: "2 days ago",
    amount: "5,000.00",
    status: "Successful",
    isCredit: true,
    category: "wealthflex",
  },
  {
    id: "9",
    type: "Group Goal: Vacation",
    date: "April 09, 2023",
    time: "3 days ago",
    amount: "12,000.00",
    status: "Successful",
    isCredit: false,
    category: "group",
  },
  {
    id: "10",
    type: "Transfer to Mom",
    date: "April 08, 2023",
    time: "4 days ago",
    amount: "80,000.00",
    status: "Successful",
    isCredit: false,
    category: "transfer",
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

export default function TransactionsScreen() {
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
      <Header title="Transactions" />

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
            data={TRANSACTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TransactionItem
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/transaction-detail",
                    params: { id: item.id },
                  } as any)
                }
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
                <Text className="text-[22px] font-extrabold text-[#323232] mb-5 mt-2">
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

const TransactionItem = ({
  item,
  onPress,
}: {
  item: Transaction;
  onPress: () => void;
}) => {
  const getIcon = () => {
    switch (item.category) {
      case "wealthflex":
        return <Ionicons name="wallet-outline" size={20} color="#155D5F" />;
      case "group":
        return <Ionicons name="people-outline" size={18} color="#155D5F" />;
      case "transfer":
        return <Ionicons name="arrow-up" size={18} color="white" />;
      case "received":
        return <Ionicons name="arrow-down" size={18} color="white" />;
      default:
        return <Ionicons name="help" size={18} color="white" />;
    }
  };

  const getIconBg = () => {
    if (item.category === "wealthflex" || item.category === "group")
      return "bg-[#E7F5F5]";
    return "bg-[#155D5F]";
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
        return { bg: "bg-gray-100", text: "text-gray-500" };
    }
  };

  const statusStyle = getStatusStyle(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white rounded-[15px] px-3 h-[66px] relative"
      style={{ width: 365 }}
    >
      {item.unopened && (
        <View className="absolute top-[18px] right-[10px] w-2 h-2 bg-red-500 rounded-full z-10" />
      )}

      <View
        className={`w-[38px] h-[38px] rounded-full items-center justify-center mr-3 ${getIconBg()}`}
      >
        {getIcon()}
      </View>

      <View className="flex-1">
        <Text
          className="text-[14px] font-bold text-[#323232] mb-0.5"
          numberOfLines={1}
        >
          {item.type}
        </Text>
        <Text className="text-[11px] text-[#9CA3AF]">{item.date}</Text>
      </View>

      <View className="items-end pr-2">
        <Text className={`text-[14px] font-bold mb-1 text-[#323232]`}>
          {item.isCredit ? "+" : "-"}₦{item.amount}
        </Text>
        <View className={`${statusStyle.bg} px-2 py-0.5 rounded-[8px]`}>
          <Text className={`text-[9px] font-bold ${statusStyle.text}`}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
