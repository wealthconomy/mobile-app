import Header from "@/src/components/common/Header";
import { DateFilterPicker } from "@/src/features/profile/components/DateFilterPicker";
import { EmptyNotificationsView } from "@/src/features/profile/components/EmptyNotificationsView";
import { NotificationCardSkeleton } from "@/src/features/profile/components/NotificationCardSkeleton";
import { NotificationItemView } from "@/src/features/profile/components/NotificationItemView";
import {
  NotificationItem,
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
} from "@/src/store/api/notificationApi";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
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

export default function GroupNotificationsScreen() {
  const { id } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const {
    data: notificationsResponse,
    isLoading: isQueryLoading,
    isFetching,
    refetch,
  } = useListNotificationsQuery({ limit: 50, kind: "group" });

  const [markRead] = useMarkNotificationReadMutation();

  const rawItems = useMemo(() => {
    const allItems: NotificationItem[] =
      notificationsResponse?.data?.items ||
      (notificationsResponse as any)?.items ||
      [];
    if (!id) return allItems;
    return allItems.filter(
      (item) =>
        (item.data?.groupId && String(item.data.groupId) === String(id)) ||
        item.kind === "group" ||
        (item.title && item.title.toLowerCase().includes("group"))
    );
  }, [notificationsResponse, id]);

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

  const formatDateLabel = (d: Date) => {
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleItemPress = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markRead({ id: item.id }).unwrap();
      } catch (error) {
        console.error("Failed to mark notification read:", error);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header title="Group Notifications" />

      <View className="px-4 mb-4 flex-row items-center justify-between mt-2">
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
              showRightImage={false}
            />
          )
        }
        ListEmptyComponent={
          !isQueryLoading ? (
            <EmptyNotificationsView
              title="No Group Notifications"
              description="When group members make payments, reach milestones, or receive administrative updates, they will appear right here."
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor="#155D5F"
            colors={["#155D5F"]}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
