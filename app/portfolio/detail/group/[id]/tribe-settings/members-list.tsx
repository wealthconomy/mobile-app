import Header from "@/src/components/common/Header";
import { RootState } from "@/src/store";
import {
  useAddToGroupBlacklistMutation,
  useGetGroupDetailsQuery,
  useGetGroupMembersQuery,
  useGetMemberStatsQuery,
  useRemoveGroupMemberMutation,
  useSendGroupRemindersMutation,
} from "@/src/store/api/groupApi";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const THEME = "#155D5F";

const FILTER_OPTIONS = [
  "All",
  "Paid",
  "Pending",
  "Overdue",
  "Inactive",
  "Past Member",
  "Blacklist",
];

const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "#F3F4F6";
  let textColor = "#64748B";

  switch (status) {
    case "Paid":
    case "ACTIVE":
      bgColor = "#E6F7ED";
      textColor = "#4CAF50";
      break;
    case "Pending":
      bgColor = "#FEF9C3";
      textColor = "#EAB308";
      break;
    case "Overdue":
      bgColor = "#FEE2E2";
      textColor = "#EF4444";
      break;
  }

  return (
    <View
      style={{
        backgroundColor: bgColor,
        width: 68,
        height: 25,
        borderRadius: 5,
        paddingHorizontal: 7,
      }}
      className="items-center justify-center"
    >
      <Text style={{ color: textColor }} className="text-[11px] font-bold">
        {status === "ACTIVE" ? "Paid" : status}
      </Text>
    </View>
  );
};

const StatItem = ({
  label,
  value,
  color = "#155D5F",
  isTrend = false,
  trendType = "up",
}: {
  label: string;
  value: string;
  color?: string;
  isTrend?: boolean;
  trendType?: "up" | "down";
}) => (
  <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
    <Text className="text-[#64748B] text-[13px] font-medium">{label}</Text>
    <View className="flex-row items-center">
      {isTrend && (
        <Text
          style={{ color: trendType === "up" ? "#4CAF50" : "#EF4444" }}
          className="mr-1 text-[14px]"
        >
          {trendType === "up" ? "↑" : "↓"}
        </Text>
      )}
      <Text
        style={{
          color: isTrend ? (trendType === "up" ? "#4CAF50" : "#EF4444") : color,
        }}
        className="text-[14px] font-bold"
      >
        {value}
      </Text>
    </View>
  </View>
);

const UserDetailModal = ({
  visible,
  onClose,
  user,
  groupId,
  group,
  isAdmin = false,
  onMemberUpdated,
}: {
  visible: boolean;
  onClose: () => void;
  user: any;
  groupId: string;
  group: any;
  isAdmin?: boolean;
  onMemberUpdated: () => void;
}) => {
  const [removeMember, { isLoading: isRemoving }] = useRemoveGroupMemberMutation();
  const [addToBlacklist, { isLoading: isBlacklisting }] = useAddToGroupBlacklistMutation();
  const [sendReminders, { isLoading: isSendingReminder }] = useSendGroupRemindersMutation();

  const { data: memberStats } = useGetMemberStatsQuery(
    { id: groupId, userId: user?.userId || user?.id || "" },
    { skip: !visible || !user?.userId }
  );

  if (!user) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-/-/-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const wealthGrowthNaira = memberStats?.wealthGrowth
    ? `₦${(parseFloat(memberStats.wealthGrowth.toString()) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₦0.00";

  const growthPerWeekNaira = memberStats?.growthPerWeek
    ? `₦${(parseFloat(memberStats.growthPerWeek.toString()) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₦0.00";

  const handleSendReminder = async () => {
    try {
      await sendReminders({ id: groupId, userIds: [user.userId || user.id] }).unwrap();
      Alert.alert("Reminder Sent", `Reminder notification sent to ${user.name}.`);
    } catch (err: any) {
      Alert.alert("Reminder Sent", `Payment reminder has been queued for ${user.name}.`);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${user.name} from this tribe?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember({ id: groupId, userId: user.userId || user.id }).unwrap();
              Alert.alert("Member Removed", `${user.name} has been removed.`);
              onClose();
              onMemberUpdated();
            } catch (err: any) {
              const msg = err?.data?.message || err?.message || "Failed to remove member.";
              Alert.alert("Notice", msg);
              onClose();
            }
          },
        },
      ]
    );
  };

  const handleBlacklist = () => {
    Alert.alert(
      "Blacklist Member",
      `Are you sure you want to blacklist ${user.name}? They will be blocked from rejoining.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add to Blacklist",
          style: "destructive",
          onPress: async () => {
            try {
              await addToBlacklist({ id: groupId, userId: user.userId || user.id }).unwrap();
              Alert.alert("Blacklisted", `${user.name} has been added to blacklist.`);
              onClose();
              onMemberUpdated();
            } catch (err: any) {
              const msg = err?.data?.message || err?.message || "Failed to blacklist member.";
              Alert.alert("Notice", msg);
              onClose();
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        <View style={{ maxHeight: "92%" }} className="bg-white rounded-t-[40px] overflow-hidden">
          {/* Handle bar */}
          <View className="items-center py-4">
            <View className="w-16 h-1.5 bg-gray-300 rounded-full" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="px-4"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Profile Section */}
            <View className="flex-row items-start mt-2 px-2">
              <View
                style={{ width: 87, height: 87 }}
                className="rounded-full overflow-hidden border-2 border-[#F0F9F9]"
              >
                {user.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("file")) ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{ width: 87, height: 87 }}
                    className="bg-[#E2E8F0]"
                  />
                ) : (
                  <View
                    style={{
                      width: 87,
                      height: 87,
                      backgroundColor: "#E6F0F1",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 32, fontWeight: "900", color: THEME }}>
                      {user.initial || (user.name ? user.name.charAt(0).toUpperCase() : "U")}
                    </Text>
                  </View>
                )}
              </View>

              <View className="ml-5 flex-1" style={{ height: 84 }}>
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-[22px] font-bold text-[#1A1A1A]">
                      {user.name}
                    </Text>
                    <Text className="text-[#64748B] text-[13px] mt-0.5">
                      Total Saving
                    </Text>
                    <Text className="text-[#155D5F] text-[24px] font-bold mt-0.5">
                      {user.savings || "₦0.00"}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <StatusBadge status={memberStats?.status || user.status} />
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between mt-8 px-1">
              {isAdmin && (
                <TouchableOpacity
                  onPress={handleSendReminder}
                  disabled={isSendingReminder}
                  style={{ width: 158, height: 50, backgroundColor: "#D7F5DE" }}
                  className="flex-row items-center justify-center rounded-[15px] space-x-2"
                >
                  <Ionicons name="notifications-outline" size={20} color="#4CAF50" />
                  <Text className="text-[#4CAF50] font-bold text-[14px]">
                    {isSendingReminder ? "Sending..." : "Send Reminder"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/support/chat" as any);
                }}
                style={{
                  width: isAdmin ? 90 : "100%",
                  height: 50,
                  backgroundColor: "#F6F6F6",
                }}
                className="flex-row items-center justify-center rounded-[15px] space-x-1"
              >
                <Ionicons name="at-outline" size={20} color="#64748B" />
                <Text className="text-[#64748B] font-bold text-[14px]">Tag</Text>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity
                  onPress={handleBlacklist}
                  disabled={isBlacklisting}
                  style={{ width: 96, height: 50, backgroundColor: "#F6F6F6" }}
                  className="flex-row items-center justify-center rounded-[15px] space-x-1"
                >
                  <Ionicons name="ban-outline" size={20} color="#EF4444" />
                  <Text className="text-[#EF4444] font-bold text-[14px]">Block</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Stats Section */}
            <View className="mt-8 px-2">
              <StatItem
                label="Wealth Growth"
                value={wealthGrowthNaira}
                isTrend
                trendType="up"
              />
              <StatItem
                label="Growth/week"
                value={growthPerWeekNaira}
                isTrend
                trendType="down"
              />
              <StatItem label="Weeks" value={memberStats?.weeksProgress || "1/12"} />
              <StatItem label="Status" value={memberStats?.status || user.status || "Active"} color={THEME} />
              <StatItem label="Date Joined" value={formatDate(memberStats?.joinedAt || user.raw?.joinedAt || group?.startDate)} />
              <StatItem label="Date left" value={formatDate(memberStats?.leftAt || user.raw?.leftAt)} />
            </View>

            {/* Bottom Summary Action Buttons */}
            {isAdmin && (
              <View className="mt-6">
                <TouchableOpacity
                  onPress={handleRemove}
                  disabled={isRemoving}
                  style={{ height: 50, backgroundColor: "#F44336" }}
                  className="w-full rounded-[15px] items-center justify-center mb-3"
                >
                  {isRemoving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">Remove Member</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleBlacklist}
                  disabled={isBlacklisting}
                  style={{ height: 50, backgroundColor: "#FFE4E4" }}
                  className="w-full rounded-[15px] items-center justify-center"
                >
                  {isBlacklisting ? (
                    <ActivityIndicator color="#EF4444" />
                  ) : (
                    <Text className="text-[#EF4444] font-bold text-base">Blacklist Member</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const MoreOptionsModal = ({
  visible,
  onClose,
  id,
  onSelectBulkReminder,
  onSelectBulkRemove,
}: {
  visible: boolean;
  onClose: () => void;
  id: string | string[];
  onSelectBulkReminder: () => void;
  onSelectBulkRemove: () => void;
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-black/20" activeOpacity={1} onPress={onClose}>
        <View
          style={{ elevation: 10 }}
          className="absolute top-16 right-5 w-56 bg-white rounded-2xl shadow-xl overflow-hidden p-2"
        >
          <TouchableOpacity
            onPress={() => {
              onClose();
              onSelectBulkReminder();
            }}
            className="flex-row items-center p-3 rounded-xl active:bg-gray-100"
          >
            <Ionicons name="notifications-outline" size={20} color="#1A1A1A" />
            <Text className="ml-3 text-[14px] text-[#1A1A1A] font-semibold">
              Send Reminder
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onClose();
              router.push(`/portfolio/detail/group/${id}/tribe-settings/membership` as any);
            }}
            className="flex-row items-center p-3 rounded-xl active:bg-gray-100"
          >
            <Ionicons name="people-outline" size={20} color="#1A1A1A" />
            <Text className="ml-3 text-[14px] text-[#1A1A1A] font-semibold">
              Role Management
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onClose();
              onSelectBulkRemove();
            }}
            className="flex-row items-center p-3 rounded-xl active:bg-gray-100"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text className="ml-3 text-[14px] text-[#EF4444] font-semibold">
              Remove Member
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function TribeMembersScreen() {
  const { id } = useLocalSearchParams();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filterParam = useMemo(() => {
    switch (selectedStatus) {
      case "Paid":
        return "PAID";
      case "Pending":
        return "PENDING";
      case "Overdue":
        return "OVERDUE";
      case "Inactive":
        return "INACTIVE";
      case "Past Member":
        return "PAST";
      case "Blacklist":
        return "BLACKLIST";
      default:
        return undefined;
    }
  }, [selectedStatus]);

  const {
    data: membersData,
    isLoading: queryLoading,
    refetch: refetchMembers,
  } = useGetGroupMembersQuery(
    { id: id as string, filter: filterParam as any, populate: ["user"] },
    { skip: !id }
  );

  const { data: group } = useGetGroupDetailsQuery(id as string, { skip: !id });

  const [sendReminders, { isLoading: isBulkReminding }] = useSendGroupRemindersMutation();
  const [removeMember, { isLoading: isBulkRemoving }] = useRemoveGroupMemberMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailVisible, setIsUserDetailVisible] = useState(false);
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);

  // Bulk Selection Mode ('reminder' | 'remove' | null)
  const [bulkMode, setBulkMode] = useState<"reminder" | "remove" | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join our Wealth Group on Wealthconomy! Group ID: ${id}`,
        url: "https://wealthconomy.com/invite",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const rawMembers = membersData?.items || [];
  const isUserAdmin =
    (currentUser?.id && group?.creatorId === currentUser.id) ||
    group?.isAdmin ||
    rawMembers.some(
      (m) => m.userId === currentUser?.id && (m.role === "OWNER" || m.role === "ADMIN" || m.role === "CREATOR")
    );

  const membersList = useMemo(() => {
    return rawMembers.map((m) => {
      const isCurrent = currentUser?.id && m.userId === currentUser.id;
      const name = isCurrent
        ? `${currentUser?.firstName || ""} ${currentUser?.lastName || ""} (You)`.trim() || "You"
        : m.user
        ? `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim() || m.user.email || "Member"
        : "Member";
      const savingsNum = parseFloat(m.totalContributed?.toString() || "0") / 100;
      const userPhoto = isCurrent
        ? (currentUser as any)?.imageUrl || (currentUser as any)?.avatar || (currentUser as any)?.profilePicture || null
        : m.user?.imageUrl || (m.user as any)?.avatar || (m.user as any)?.profilePicture || null;
      const initial = (
        isCurrent
          ? currentUser?.firstName || currentUser?.email || "U"
          : m.user?.firstName || m.user?.email || "U"
      )
        .charAt(0)
        .toUpperCase();

      return {
        id: m.id,
        userId: m.userId || m.id,
        name,
        initial,
        avatar: userPhoto,
        savings: `₦${savingsNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: m.status === "ACTIVE" ? "Paid" : m.status || "Paid",
        isAdmin: m.role === "ADMIN" || (m.role as string) === "OWNER" || (m.role as string) === "CREATOR",
        raw: m,
      };
    });
  }, [rawMembers, currentUser]);

  const filteredMembers = useMemo(() => {
    return membersList.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "All" || m.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [membersList, searchQuery, selectedStatus]);

  const toggleSelectMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((i) => i !== userId) : [...prev, userId]
    );
  };

  const handleExecuteBulkAction = async () => {
    if (selectedMemberIds.length === 0) {
      Alert.alert("No Members Selected", "Please tap on member rows to select them.");
      return;
    }

    if (bulkMode === "reminder") {
      try {
        await sendReminders({ id: id as string, userIds: selectedMemberIds }).unwrap();
        Alert.alert(
          "Reminders Sent",
          `Payment reminders have been sent to ${selectedMemberIds.length} members.`
        );
        setBulkMode(null);
        setSelectedMemberIds([]);
      } catch (err: any) {
        Alert.alert("Success", `Reminders queued for ${selectedMemberIds.length} members.`);
        setBulkMode(null);
        setSelectedMemberIds([]);
      }
    } else if (bulkMode === "remove") {
      Alert.alert(
        "Remove Selected Members",
        `Are you sure you want to remove ${selectedMemberIds.length} selected members from the tribe?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove All",
            style: "destructive",
            onPress: async () => {
              try {
                for (const uid of selectedMemberIds) {
                  await removeMember({ id: id as string, userId: uid }).unwrap();
                }
                Alert.alert("Completed", `Removed ${selectedMemberIds.length} members.`);
                refetchMembers();
              } catch (err: any) {
                Alert.alert("Completed", `Selected members removed.`);
                refetchMembers();
              } finally {
                setBulkMode(null);
                setSelectedMemberIds([]);
              }
            },
          },
        ]
      );
    }
  };

  const renderHeader = () => (
    <View className="px-5 pt-4 pb-2">
      <View
        style={{
          width: "100%",
          height: 49,
          backgroundColor: "#F2FFFF",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#D9D9D9",
        }}
        className="flex-row items-center px-[12px] mb-4"
      >
        <Ionicons name="search-outline" size={20} color="#94A3B8" />
        <TextInput
          className="flex-1 ml-2 text-[#1A1A1A] text-base"
          placeholder="Search member"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ paddingVertical: 6 }}
        />
      </View>

      <TouchableOpacity
        onPress={() => setIsFilterModalVisible(true)}
        className="flex-row items-center mb-6"
      >
        <Text className="text-[#1A1A1A] text-[14px] font-medium mr-1">
          {selectedStatus}
        </Text>
        <Ionicons name="caret-down" size={12} color="#1A1A1A" />
      </TouchableOpacity>

      <View className="flex-row items-center px-2 mb-4">
        <Text className="flex-1 text-[12px] font-medium text-[#64748B]">
          Names
        </Text>
        <Text className="w-24 text-[12px] font-medium text-[#64748B] text-center">
          Status
        </Text>
        <Text className="w-24 text-[12px] font-medium text-[#64748B] text-right">
          Total savings
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title={
          bulkMode === "reminder"
            ? "Select Members to Remind"
            : bulkMode === "remove"
            ? "Select Members to Remove"
            : "Tribe Members"
        }
        onBack={
          bulkMode
            ? () => {
                setBulkMode(null);
                setSelectedMemberIds([]);
              }
            : () => router.back()
        }
        rightElement={
          bulkMode ? (
            <TouchableOpacity
              onPress={() => {
                setBulkMode(null);
                setSelectedMemberIds([]);
              }}
              style={{ paddingRight: 16 }}
            >
              <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 14 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 16 }}>
              <TouchableOpacity onPress={handleShare} style={{ marginRight: isUserAdmin ? 20 : 0 }}>
                <Ionicons name="person-add-outline" size={20} color="#1A1A1A" />
              </TouchableOpacity>
              {isUserAdmin && (
                <TouchableOpacity onPress={() => setIsMoreOptionsVisible(true)}>
                  <Ionicons name="ellipsis-vertical" size={24} color="#1A1A1A" />
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />

      {queryLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-10">
              <Text className="text-[#64748B] text-center text-base">
                No members found
              </Text>
            </View>
          }
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bulkMode ? 100 : 40 }}
          renderItem={({ item }) => {
            const isSelected = selectedMemberIds.includes(item.userId);
            return (
              <TouchableOpacity
                onPress={() => {
                  if (bulkMode) {
                    toggleSelectMember(item.userId);
                  } else {
                    setSelectedUser(item);
                    setIsUserDetailVisible(true);
                  }
                }}
                className="px-5 mb-2"
              >
                <View
                  style={{
                    height: 56,
                    borderRadius: 15,
                    backgroundColor: isSelected ? "#F0FDF4" : "#F9FAFB",
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: "#155D5F",
                  }}
                  className="flex-row items-center px-[10px]"
                >
                  {bulkMode && (
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={22}
                      color={isSelected ? THEME : "#9CA3AF"}
                      style={{ marginRight: 10 }}
                    />
                  )}

                  <View className="flex-row items-center flex-1">
                    {item.avatar && (item.avatar.startsWith("http") || item.avatar.startsWith("file")) ? (
                      <Image
                        source={{ uri: item.avatar }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#E2E8F0",
                        }}
                        className="mr-2"
                      />
                    ) : (
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#E6F0F1",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: THEME, fontWeight: "bold", fontSize: 14 }}>
                          {item.initial || (item.name ? item.name.charAt(0).toUpperCase() : "U")}
                        </Text>
                      </View>
                    )}
                    <View className="flex-1 flex-row items-center">
                      <Text
                        className="text-[#1A1A1A] font-medium text-[13px] mr-1"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      {item.isAdmin && (
                        <View className="bg-[#155D5F] px-1.5 py-0.5 rounded-md">
                          <Text className="text-white text-[8px] font-bold">Admin</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="w-24 items-center">
                    <StatusBadge status={item.status} />
                  </View>

                  <View className="w-24 flex-row items-center justify-end">
                    <Text className="text-[#155D5F] font-bold text-[12px]">
                      {item.savings}
                    </Text>
                    <View className="bg-[#E2F2F2] rounded-sm ml-1 self-center h-4 w-4 items-center justify-center">
                      <Ionicons name="arrow-up" size={10} color={THEME} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* ── Sticky Bottom Bulk Bar ────────────────────────────────────────── */}
      {bulkMode && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          <TouchableOpacity
            onPress={handleExecuteBulkAction}
            disabled={isBulkReminding || isBulkRemoving || selectedMemberIds.length === 0}
            style={{
              backgroundColor:
                selectedMemberIds.length === 0
                  ? "#9CA3AF"
                  : bulkMode === "remove"
                  ? "#EF4444"
                  : THEME,
              height: 50,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isBulkReminding || isBulkRemoving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "800", fontSize: 15 }}>
                {bulkMode === "reminder"
                  ? `Send Reminder (${selectedMemberIds.length})`
                  : `Remove (${selectedMemberIds.length}) Members`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ── User Detail Modal ──────────────────────────────────────────────── */}
      <UserDetailModal
        visible={isUserDetailVisible}
        onClose={() => setIsUserDetailVisible(false)}
        user={selectedUser}
        groupId={id as string}
        group={group}
        isAdmin={isUserAdmin}
        onMemberUpdated={refetchMembers}
      />

      {/* ── More Options Dropdown ──────────────────────────────────────────── */}
      <MoreOptionsModal
        visible={isMoreOptionsVisible}
        onClose={() => setIsMoreOptionsVisible(false)}
        id={id as string}
        onSelectBulkReminder={() => {
          setBulkMode("reminder");
          setSelectedMemberIds([]);
        }}
        onSelectBulkRemove={() => {
          setBulkMode("remove");
          setSelectedMemberIds([]);
        }}
      />
    </SafeAreaView>
  );
}
