import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";

const ACTIVITIES = [
  {
    id: "1",
    type: "Card Deposit - Simon Peter",
    date: "April 12, 2023",
    amount: "68,000.00",
    status: "Successful",
    category: "deposit",
    isCredit: false,
  },
  {
    id: "2",
    type: "Received from Oluwatope",
    date: "April 12, 2023",
    amount: "68,000.00",
    status: "Successful",
    category: "received",
    isCredit: true,
  },
  {
    id: "3",
    type: "Transfer to Wealth Save",
    date: "April 12, 2023",
    amount: "68,000.00",
    status: "Successful",
    category: "transfer",
    isCredit: false,
  },
  {
    id: "4",
    type: "Transfer to Olaniyi",
    date: "April 12, 2023",
    amount: "68,000.00",
    status: "Failed",
    category: "transfer",
    isCredit: false,
  },
  {
    id: "5",
    type: "Received from Oluwatope",
    date: "April 12, 2023",
    amount: "68,000.00",
    status: "Pending",
    category: "received",
    isCredit: true,
  },
  {
    id: "6",
    type: "Card Deposit - John Doe",
    date: "April 11, 2023",
    amount: "15,000.00",
    status: "Successful",
    category: "deposit",
    isCredit: false,
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

// Custom SVGs from dashboard
const CardDepositIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M1.25 14.6875C1.25 15.2677 1.48047 15.8241 1.8907 16.2343C2.30094 16.6445 2.85734 16.875 3.4375 16.875H16.5625C17.1427 16.875 17.6991 16.6445 18.1093 16.2343C18.5195 15.8241 18.75 15.2677 18.75 14.6875V8.67188H1.25V14.6875ZM3.82812 11.7188C3.82812 11.4079 3.95159 11.1099 4.17136 10.8901C4.39113 10.6703 4.6892 10.5469 5 10.5469H6.875C7.1858 10.5469 7.48387 10.6703 7.70364 10.8901C7.92341 11.1099 8.04688 11.4079 8.04688 11.7188V12.5C8.04688 12.8108 7.92341 13.1089 7.70364 13.3286C7.48387 13.5484 7.1858 10.6703 6.875 13.6719H5C4.6892 13.6719 4.39113 13.5484 4.17136 13.3286C3.95159 13.1089 3.82812 12.8108 3.82812 12.5V11.7188ZM16.5625 3.125H3.4375C2.85734 3.125 2.30094 3.35547 1.8907 3.7657C1.48047 4.17594 1.25 4.73234 1.25 5.3125V6.32812H18.75V5.3125C18.75 4.73234 18.5195 4.17594 18.1093 3.7657C17.6991 3.35547 17.1427 3.125 16.5625 3.125Z"
      fill="#F44336"
    />
  </Svg>
);

const ReceivedMoneyIcon = () => (
  <Svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <Rect width="38" height="38" rx="19" fill="#F44336" />
    <Path
      d="M23.4193 14.5824L14.5805 23.4212M14.5805 23.4212L14.3595 16.5711M14.5805 23.4212L21.4306 23.6422"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TransferMoneyIcon = () => (
  <Svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <Rect width="38" height="38" rx="19" fill="#F44336" />
    <Path
      d="M14.9823 23.7861L23.0171 14.2105M23.0171 14.2105L23.8343 21.0153M23.0171 14.2105L16.1738 14.5874"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function FlexTransactionsScreen() {
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
          onPress={() => {
            setDate(new Date(year, month, day));
          }}
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
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="Flex Transactions" />

      <View className="flex-1">
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
            renderItem={({ item }) => <FlexTransactionItem item={item} />}
            ItemSeparatorComponent={() => <View className="h-[10px]" />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
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

function FlexTransactionItem({ item }: any) {
  const getIcon = () => {
    if (item.category === "deposit") return <CardDepositIcon />;
    if (item.category === "received") return <ReceivedMoneyIcon />;
    return <TransferMoneyIcon />;
  };

  const getIconBg = () => {
    if (item.category === "deposit") return "bg-[#FFF5F5]";
    return "bg-transparent"; // Handled by SVG rect for others
  };

  return (
    <TouchableOpacity
      style={{
        width: 365,
        height: 66,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
      activeOpacity={0.9}
      onPress={() => router.push("/transaction-detail")}
    >
      <View
        className={`w-11 h-11 items-center justify-center mr-3 ${getIconBg()} rounded-full`}
      >
        {getIcon()}
      </View>
      <View className="flex-1">
        <Text
          className="text-[#1A1A1A] font-bold text-[13px] mb-1"
          numberOfLines={1}
        >
          {item.type}
        </Text>
        <Text className="text-[#9CA3AF] text-[10px] font-medium">
          {item.date}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-bold text-[13px] mb-1.5 ${item.isCredit ? "text-[#4CAF50]" : "text-[#1A1A1A]"}`}
        >
          {item.isCredit ? "+" : "-"}₦{item.amount}
        </Text>
        <View className="bg-[#E7F5F5] px-2 py-0.5 rounded-md">
          <Text className="text-[#155D5F] text-[9px] font-bold">
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
