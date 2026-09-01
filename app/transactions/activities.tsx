import Header from "@/src/components/common/Header";
import { useGetWalletTransactionsQuery } from "@/src/store/api/walletApi";
import { WalletTransaction } from "@/src/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import { ArrowDownLeft, ArrowUpRight, CreditCard, RefreshCw } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const { data: response, isLoading, isFetching, refetch } = useGetWalletTransactionsQuery({ limit: 30 });

  const transactions = response?.items || [];

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
        <View key={`empty-${i}`} className="w-[14.28%] aspect-square" />
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
          key={`day-${day}`}
          disabled={isFuture}
          onPress={() => {
            setDate(new Date(year, month, day));
          }}
          className={`w-[14.28%] aspect-square items-center justify-center rounded-full my-1 ${
            isSelected ? "bg-[#155D5F]" : ""
          }`}
        >
          <Text
            className={`text-sm ${
              isSelected
                ? "text-white font-bold"
                : isFuture
                ? "text-gray-300"
                : "text-[#323232]"
            }`}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View className="mb-6">
        <View className="flex-row justify-between mb-4">
          {dayNames.map((d) => (
            <Text
              key={d}
              className="w-[14.28%] text-center text-xs font-semibold text-[#8E8E93]"
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <Header title="Activities" onBack={() => router.back()} />

      <View className="px-5 mb-4 mt-2">
        <TouchableOpacity
          onPress={() => {
            setViewDate(new Date(date));
            setShowPicker(true);
          }}
          className="flex-row items-center gap-x-2"
        >
          <Text className="text-[#323232] font-bold text-base">
            {formatDateLabel(date)}
          </Text>
          <Ionicons name="caret-down" size={14} color="#323232" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#155D5F" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionActivityItem
              item={item}
              onPress={() => router.push({ pathname: "/transactions/detail", params: { id: item.id } })}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-[#64748B] text-base">No activities found</Text>
            </View>
          }
        />
      )}

      {/* Calendar Modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                <View className="flex-row justify-between items-center mb-6">
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
                      <Ionicons name="chevron-forward" size={20} color="#323232" />
                    </TouchableOpacity>
                  </View>
                </View>
                {renderCalendar()}
                <TouchableOpacity
                  className="bg-[#155D5F] rounded-2xl h-14 items-center justify-center"
                  onPress={() => setShowPicker(false)}
                >
                  <Text className="text-white text-base font-bold">Confirm</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const TransactionActivityItem = ({
  item,
  onPress,
}: {
  item: WalletTransaction;
  onPress: () => void;
}) => {
  const isCredit = item.type === "CREDIT";
  const num = (parseFloat(item.amount || "0") / 100);
  const amountStr = num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return (
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " | " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    );
  };

  const getIconData = (reason: string, credit: boolean) => {
    if (reason === "WALLET_TOPUP") {
      return { icon: <CreditCard size={20} color="#155D5F" />, bg: "#D1F2F2" };
    }
    if (reason === "WITHDRAWAL") {
      return { icon: <ArrowUpRight size={20} color="#F44336" />, bg: "#FEE2E2" };
    }
    if (credit) {
      return { icon: <ArrowDownLeft size={20} color="#10B981" />, bg: "#D1FAE5" };
    }
    return { icon: <RefreshCw size={20} color="#155D5F" />, bg: "#E7EFEF" };
  };

  const { icon, bg } = getIconData(item.reason, isCredit);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-3xl p-4 mb-3 flex-row items-center border border-gray-100 shadow-sm"
    >
      <View
        style={{ backgroundColor: bg }}
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
      >
        {icon}
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-[#1A1A1A] font-bold text-sm mb-0.5" numberOfLines={1}>
          {item.description || item.reason || "Transaction"}
        </Text>
        <Text className="text-[#6B7280] text-[10px]">{formatDate(item.createdAt)}</Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-bold text-sm mb-1 ${
            isCredit ? "text-[#10B981]" : "text-[#1A1A1A]"
          }`}
        >
          {isCredit ? "+" : "-"}₦{amountStr}
        </Text>
        <View className="bg-[#E7F5F5] px-2.5 py-0.5 rounded-md">
          <Text className="text-[#155D5F] text-[9px] font-bold">
            {item.status === "COMPLETED" || item.status === "SUCCESS" ? "Success" : item.status || "Success"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
