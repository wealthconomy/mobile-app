import Header from "@/src/components/common/Header";
import { AppRefreshIndicator } from "@/src/components/common/AppRefreshIndicator";
import { InfiniteScrollList } from "@/src/components/common/ui/InfiniteScrollList";
import { useGetWalletTransactionsQuery } from "@/src/store/api/walletApi";
import { WalletTransaction } from "@/src/types/wallet";
import {
  groupActivitiesByDate,
  GroupedListItem,
} from "@/src/utils/activityHelpers";
import { formatCurrencyInText, getCleanTransactionTitle } from "@/src/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
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

export default function TransactionsScreen() {
  const router = useRouter();
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  const { from, to } = useMemo(() => {
    if (!date) return { from: undefined, to: undefined };
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return { from: startOfDay.toISOString(), to: endOfDay.toISOString() };
  }, [date]);

  const { data, isLoading, isFetching, refetch } = useGetWalletTransactionsQuery(
    {
      limit: 20,
      after: cursor,
      from,
      to,
    },
    { refetchOnMountOrArgChange: true }
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setCursor(undefined);
    try {
      await refetch().unwrap();
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  const transactions = data?.items || [];
  const hasNextPage = data?.hasNext ?? false;
  const nextCursor = data?.nextCursor;

  const loadMore = () => {
    if (hasNextPage && nextCursor && !isFetching) {
      setCursor(nextCursor);
    }
  };

  const displayList = useMemo(() => {
    if (date === null) {
      return groupActivitiesByDate(transactions);
    }
    return transactions.map((t) => ({ type: "item" as const, data: t }));
  }, [transactions, date]);

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const formatDateLabel = (d: Date | null) => {
    if (!d) return "All dates";
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
        date !== null &&
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year;

      days.push(
        <TouchableOpacity
          key={day}
          disabled={isFuture}
          className={`w-[14.28%] aspect-square items-center justify-center mb-1 ${
            isSelected ? "bg-[#155D5F] rounded-full" : ""
          }`}
          onPress={() => {
            setDate(new Date(year, month, day));
            setCursor(undefined);
          }}
        >
          <Text
            className={`text-[15px] ${
              isSelected
                ? "text-white font-bold"
                : isFuture
                ? "text-[#E5E7EB]"
                : "text-[#323232] font-medium"
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

      <AppRefreshIndicator refreshing={refreshing} topOffset={65} />

      <View className="flex-1 bg-white">
        <View className="px-5 py-2">
          <View className="flex-row items-center self-start mb-2">
            <TouchableOpacity
              onPress={() => {
                setViewDate(date ? new Date(date) : new Date());
                setShowPicker(true);
              }}
              className="flex-row items-center"
            >
              <Text className="text-sm font-bold text-[#323232] mr-1">
                {formatDateLabel(date)}
              </Text>
              <Ionicons name="caret-down" size={12} color="#000" />
            </TouchableOpacity>

            {date !== null && (
              <TouchableOpacity
                onPress={() => {
                  setDate(null);
                  setCursor(undefined);
                }}
                className="ml-2 w-5 h-5 rounded-full bg-gray-100 items-center justify-center"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={12} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View
          className="flex-1 mx-2.5 mb-4 bg-[#F6F6F6] rounded-[20px] p-[10px]"
        >
          <InfiniteScrollList
            data={displayList}
            keyExtractor={(item: GroupedListItem<WalletTransaction>, index: number) =>
              item.type === "header"
                ? `header-${item.label}-${index}`
                : `txn-${item.data.id}-${index}`
            }
            renderItem={({
              item,
            }: {
              item: GroupedListItem<WalletTransaction>;
            }) => {
              if (item.type === "header") {
                return (
                  <Text className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wide px-2 pt-4 pb-2">
                    {item.label}
                  </Text>
                );
              }
              return (
                <TransactionItem
                  item={item.data}
                  onPress={() =>
                    router.push({
                      pathname: "/transactions/detail",
                      params: { id: item.data.id },
                    } as any)
                  }
                />
              );
            }}
            ItemSeparatorComponent={() => <View className="h-[10px]" />}
            showsVerticalScrollIndicator={false}
            isFetchingNextPage={isFetching && !!cursor}
            hasNextPage={hasNextPage}
            fetchNextPage={loadMore}
            isLoadingInitial={isLoading}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="transparent"
                colors={["#155D5F"]}
                progressBackgroundColor="#FFFFFF"
              />
            }
          />
        </View>
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
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
                <View className="flex-row gap-x-3">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 rounded-2xl h-14 items-center justify-center"
                    onPress={() => {
                      setDate(null);
                      setCursor(undefined);
                      setShowPicker(false);
                    }}
                  >
                    <Text className="text-[#323232] text-base font-bold">
                      Clear
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-[#155D5F] rounded-2xl h-14 items-center justify-center"
                    onPress={() => setShowPicker(false)}
                  >
                    <Text className="text-white text-base font-bold">
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const TransactionItem = ({
  item,
  onPress,
}: {
  item: WalletTransaction;
  onPress: () => void;
}) => {
  const isCredit = item.type === "CREDIT";
  const isReferral =
    item.reason === "REFERRAL_CREDIT" ||
    item.description?.toLowerCase().includes("referral") ||
    item.reference?.toUpperCase().includes("REFERRAL");

  const getIcon = () => {
    if (isReferral) {
      return <Ionicons name="people-outline" size={18} color="#155D5F" />;
    }
    switch (item.reason) {
      case "WALLET_TOPUP":
        return <Ionicons name="wallet-outline" size={20} color="#155D5F" />;
      case "WITHDRAWAL":
        return <Ionicons name="arrow-up" size={18} color="white" />;
      default:
        return isCredit ? (
          <Ionicons name="arrow-down" size={18} color="white" />
        ) : (
          <Ionicons name="arrow-up" size={18} color="white" />
        );
    }
  };

  const getIconBg = () => {
    if (item.reason === "WALLET_TOPUP" || isReferral)
      return "bg-[#E7F5F5]";
    return "bg-[#155D5F]";
  };

  const getStatusStyle = () => {
    return { bg: "bg-[#E7F5F5]", text: "text-[#155D5F]" };
  };

  const statusStyle = getStatusStyle();

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const cleaned = String(val).replace(/[^0-9.-]/g, "");
    const raw = parseFloat(cleaned);
    if (isNaN(raw)) return "0.00";
    const amount = Math.abs(raw) / 100;
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getTitle = () => {
    return getCleanTransactionTitle(item);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white rounded-[15px] px-3 h-[66px] relative"
      style={{ alignSelf: "stretch" }}
    >
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
          {getTitle()}
        </Text>
        <Text className="text-[11px] text-[#9CA3AF]">{formattedDate}</Text>
      </View>

      <View className="items-end pr-2">
        <Text
          className={`text-[14px] font-bold mb-1 ${
            isCredit ? "text-[#10B981]" : "text-[#DC2626]"
          }`}
        >
          {isCredit ? "+" : "-"}₦{formatAmount(item.amount)}
        </Text>
        <View className={`${statusStyle.bg} px-2 py-0.5 rounded-[8px]`}>
          <Text className={`text-[9px] font-bold ${statusStyle.text}`}>
            Success
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
