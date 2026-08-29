import Header from "@/src/components/common/Header";
import { useGetMyActivitiesQuery, activityApi } from "@/src/store/api/activityApi";
import { UserActivity } from "@/src/types/activity";
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

  const { data: response, isLoading, isFetching } = useGetMyActivitiesQuery({ limit: 20 });
  const [fetchMore] = activityApi.endpoints.getMyActivities.useLazyQuery();

  const activities = response?.data?.items || [];
  const nextCursor = response?.data?.nextCursor;
  const hasNext = response?.data?.hasNext;

  const handleLoadMore = () => {
    if (hasNext && nextCursor && !isFetching) {
      fetchMore({ limit: 20, after: nextCursor, _append: true });
    }
  };

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
            data={activities}
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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={() => (
              <View className="py-10 items-center justify-center">
                <Text className="text-gray-400">No activities found</Text>
              </View>
            )}
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
  item: UserActivity;
  onPress: () => void;
}) => {
  const isCredit = item.metadata?.isCredit;

  const getIcon = () => {
    switch (item.type) {
      case "FINANCIAL":
        return <Ionicons name={isCredit ? "arrow-down" : "arrow-up"} size={20} color="white" />;
      case "SECURITY":
        return <Ionicons name="shield-checkmark" size={20} color="#155D5F" />;
      case "SYSTEM":
      default:
        return <Ionicons name="person" size={20} color="#155D5F" />;
    }
  };

  const getIconBg = () => {
    switch (item.type) {
      case "FINANCIAL":
        return "bg-[#155D5F]";
      case "SECURITY":
      case "SYSTEM":
      default:
        return "bg-[#E7EFEF]";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "successful":
      case "success":
        return { bg: "bg-[#E7F5F5]", text: "text-[#155D5F]" };
      case "failed":
        return { bg: "bg-[#FFEBEE]", text: "text-[#FF5252]" };
      case "pending":
        return { bg: "bg-[#FFF3E0]", text: "text-[#EF6C00]" };
      default:
        return { bg: "bg-[#E7F5F5]", text: "text-[#155D5F]" };
    }
  };

  const status = item.metadata?.status;
  const amount = item.metadata?.amount;
  const statusStyle = status ? getStatusStyle(status) : null;

  const dateObj = new Date(item.createdAt);
  const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

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
          {item.title}
        </Text>
        <Text className="text-[12px] text-[#9CA3AF] font-medium">
          {dateStr} | {timeStr}
        </Text>
      </View>

      {(amount || status) && (
        <View className="items-end">
          {amount && (
            <Text className="text-[15px] font-bold mb-1 text-[#323232]">
              {isCredit ? "+" : "-"}₦{amount}
            </Text>
          )}
          {statusStyle && (
            <View className={`${statusStyle.bg} px-3 py-1 rounded-[10px]`}>
              <Text className={`text-[10px] font-bold ${statusStyle.text}`}>
                {status}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
