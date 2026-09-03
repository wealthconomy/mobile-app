import Header from "@/src/components/common/Header";
import { DateFilterPicker } from "@/src/features/profile/components/DateFilterPicker";
import { EmptyNotificationsView } from "@/src/features/profile/components/EmptyNotificationsView";
import { NotificationCardSkeleton } from "@/src/features/profile/components/NotificationCardSkeleton";
import { NotificationItemView } from "@/src/features/profile/components/NotificationItemView";
import {
  NotificationItem,
  useListNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/src/store/api/notificationApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const {
    data: notificationsResponse,
    isLoading: isQueryLoading,
    isFetching,
    refetch,
  } = useListNotificationsQuery({ limit: 50 });

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAllRead }] =
    useMarkAllNotificationsReadMutation();

  const rawItems: NotificationItem[] =
    notificationsResponse?.data?.items ||
    (notificationsResponse as any)?.items ||
    [];

  const unreadCount = useMemo(
    () => rawItems.filter((item) => !item.isRead).length,
    [rawItems]
  );

  const filteredItems = useMemo(() => {
    if (!selectedDate) return rawItems;
    return rawItems.filter((item) => {
      if (!item.createdAt) return true;
      const d = new Date(item.createdAt);
      if (isNaN(d.getTime())) return true;
      return (
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [rawItems, selectedDate]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to mark all notifications read:", error);
    }
  };

  const handleItemPress = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markRead({ id: item.id }).unwrap();
      } catch (error) {
        console.error("Failed to mark notification read:", error);
      }
    }
    if (item.data?.route) {
      router.push(item.data.route as any);
    } else if (item.kind === "group" && item.data?.groupId) {
      router.push(`/portfolio/detail/group/${item.data.groupId}` as any);
    }
  };

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) return "Today";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const rightHeaderActions = (
    <View className="flex-row items-center">
      <TouchableOpacity
        onPress={handleMarkAllRead}
        disabled={!unreadCount || isMarkingAllRead}
        className="p-2 -mr-1"
      >
        <Ionicons
          name="checkmark-done-circle-outline"
          size={26}
          color={unreadCount > 0 ? "#155D5F" : "#D1D5DB"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/profile/notifications/settings")}
        className="p-2 -mr-2"
      >
        <Ionicons name="settings-outline" size={24} color="#323232" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <Header
        title="Notification"
        rightElement={rightHeaderActions}
      />

      <View className="px-4 mb-4 flex-row items-center justify-between">
        <TouchableOpacity
          className="flex-row items-center bg-[#F5F5F5] px-3.5 py-2 rounded-full"
          onPress={() => setShowPicker(true)}
        >
          <Ionicons
            name="calendar-outline"
            size={14}
            color="#323232"
            style={{ marginRight: 6 }}
          />
          <Text className="text-sm font-bold text-[#323232]">
            {selectedDate ? formatDateLabel(selectedDate) : "All Dates"}
          </Text>
          <Ionicons name="caret-down" size={12} color="#000" className="ml-1.5" />
        </TouchableOpacity>

        {selectedDate && (
          <TouchableOpacity
            onPress={() => setSelectedDate(null)}
            className="py-1 px-3 rounded-full bg-[#E0F2F1]"
          >
            <Text className="text-xs font-bold text-[#155D5F]">Clear Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      <DateFilterPicker
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        showPicker={showPicker}
        onClose={() => setShowPicker(false)}
      />

      <FlatList<NotificationItem | number>
        data={isQueryLoading && !notificationsResponse ? [1, 2, 3, 4, 5] : filteredItems}
        keyExtractor={(item, idx) =>
          typeof item === "object" ? item.id : idx.toString()
        }
        renderItem={({ item }) =>
          typeof item === "number" ? (
            <NotificationCardSkeleton />
          ) : (
            <NotificationItemView
              item={item}
              onPress={() => handleItemPress(item)}
            />
          )
        }
        ListEmptyComponent={
          !isQueryLoading ? <EmptyNotificationsView /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor="#155D5F"
            colors={["#155D5F"]}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
