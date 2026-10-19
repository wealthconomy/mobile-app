import {
  AppConfirmModal,
  ConfirmState,
} from "@/src/components/common/AppConfirmModal";
import { AppToast, ToastState } from "@/src/components/common/AppToast";
import Header from "@/src/components/common/Header";
import { RootState } from "@/src/store";
import {
  useAddGroupAdminMutation,
  useAddToGroupBlacklistMutation,
  useApproveJoinRequestMutation,
  useGetGroupDetailsQuery,
  useGetGroupMembersQuery,
  useGetMemberStatsQuery,
  useRejectJoinRequestMutation,
  useRemoveFromGroupBlacklistMutation,
  useRemoveGroupAdminMutation,
  useRemoveGroupMemberMutation,
  useSendGroupRemindersMutation,
} from "@/src/store/api/groupApi";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowDown, ArrowUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
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
  "Unpaid",
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
    case "PAID":
      bgColor = "#E6F7ED";
      textColor = "#4CAF50";
      break;
    case "Unpaid":
    case "UNPAID":
      bgColor = "#FEF3C7";
      textColor = "#D97706";
      break;
    case "Pending":
    case "PENDING":
      bgColor = "#FEF9C3";
      textColor = "#EAB308";
      break;
    case "Overdue":
    case "OVERDUE":
      bgColor = "#FEE2E2";
      textColor = "#EF4444";
      break;
    case "Blacklist":
    case "BLACKLIST":
    case "Blacklisted":
    case "BLACKLISTED":
    case "Blocked":
    case "BLOCKED":
    case "Banned":
    case "BANNED":
      bgColor = "#FFE4E4";
      textColor = "#EF4444";
      break;
    case "Past Member":
    case "PAST":
    case "Past":
    case "EXITED":
    case "Exited":
      bgColor = "#F1F5F9";
      textColor = "#64748B";
      break;
  }

  return (
    <View
      style={{
        backgroundColor: bgColor,
        minWidth: 48,
        maxWidth: 56,
        height: 24,
        borderRadius: 5,
        paddingHorizontal: 3,
      }}
      className="items-center justify-center"
    >
      <Text
        style={{ color: textColor }}
        className="text-[11px] font-bold"
        numberOfLines={1}
      >
        {status}
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
        <View className="mr-1">
          {trendType === "up" ? (
            <ArrowUp size={14} color="#4CAF50" />
          ) : (
            <ArrowDown size={14} color="#EF4444" />
          )}
        </View>
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
  const [addAdmin, { isLoading: isAddingAdmin }] = useAddGroupAdminMutation();
  const [removeAdmin, { isLoading: isRemovingAdmin }] =
    useRemoveGroupAdminMutation();
  const [approveRequest, { isLoading: isApproving }] =
    useApproveJoinRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] =
    useRejectJoinRequestMutation();
  const [removeMember, { isLoading: isRemoving }] =
    useRemoveGroupMemberMutation();
  const [addToBlacklist, { isLoading: isBlacklisting }] =
    useAddToGroupBlacklistMutation();
  const [removeFromBlacklist, { isLoading: isUnblacklisting }] =
    useRemoveFromGroupBlacklistMutation();
  const [sendReminders, { isLoading: isSendingReminder }] =
    useSendGroupRemindersMutation();

  const resolvedTargetUserId =
    typeof user?.userId === "string" && user.userId
      ? user.userId
      : typeof (user as any)?.user?.id === "string" && (user as any).user.id
      ? (user as any).user.id
      : typeof user?.raw?.userId === "string" && user.raw.userId
      ? user.raw.userId
      : typeof (user?.raw as any)?.user?.id === "string" && (user.raw as any).user.id
      ? (user.raw as any).user.id
      : "";

  const { data: memberStats } = useGetMemberStatsQuery(
    { id: groupId, userId: resolvedTargetUserId },
    { skip: !visible || !resolvedTargetUserId },
  );

  if (!user) return null;

  const statusUpper = (
    user?.status ||
    memberStats?.status ||
    user?.raw?.status ||
    ""
  ).toUpperCase();

  const isBlacklisted =
    statusUpper.includes("BLACK") ||
    statusUpper.includes("BLOCK") ||
    statusUpper.includes("BAN") ||
    Boolean(
      user?.isBlacklisted ||
      user?.raw?.isBlacklisted ||
      (user?.raw as any)?.isBlocked,
    );

  const isPastMember =
    !isBlacklisted &&
    (statusUpper === "PAST" ||
      statusUpper === "EXITED" ||
      statusUpper === "PAST MEMBER" ||
      user?.status === "Past Member" ||
      memberStats?.status === "PAST" ||
      Boolean(user?.isPastMember || user?.raw?.leftAt || memberStats?.leftAt));

  const isPending =
    !isBlacklisted &&
    !isPastMember &&
    (user?.status === "PENDING" ||
      user?.status === "Pending" ||
      memberStats?.status === "PENDING" ||
      memberStats?.status === "Pending" ||
      user?.raw?.status === "PENDING");

  const isMemberAdmin = user?.role === "ADMIN" || user?.raw?.role === "ADMIN";
  const isMemberOwner =
    user?.role === "OWNER" ||
    user?.role === "CREATOR" ||
    user?.raw?.role === "OWNER";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-/-/-";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const wealthGrowthNaira = memberStats?.wealthGrowth
    ? `₦${(parseFloat(memberStats.wealthGrowth.toString()) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₦0.00";

  const growthPerWeekNaira = memberStats?.growthPerWeek
    ? `₦${(parseFloat(memberStats.growthPerWeek.toString()) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₦0.00";

  const handleMakeAdmin = () => {
    Alert.alert(
      "Make Admin",
      `Promote ${user.name} to Group Admin? They will have management permissions in this tribe.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Make Admin",
          onPress: async () => {
            if (!resolvedTargetUserId) {
              Alert.alert("Error", "Could not resolve user ID.");
              return;
            }
            try {
              await addAdmin({
                id: groupId,
                userId: resolvedTargetUserId,
              }).unwrap();
              Alert.alert(
                "Admin Assigned ✅",
                `${user.name} is now a Group Admin.`,
              );
              onClose();
              onMemberUpdated();
            } catch (err: any) {
              const msg =
                err?.data?.message ||
                err?.message ||
                "Failed to assign admin role.";
              Alert.alert("Notice", msg);
            }
          },
        },
      ],
    );
  };

  const handleRemoveAdmin = () => {
    Alert.alert(
      "Remove Admin Role",
      `Are you sure you want to remove admin privileges from ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Admin",
          style: "destructive",
          onPress: async () => {
            if (!resolvedTargetUserId) {
              Alert.alert("Error", "Could not resolve user ID.");
              return;
            }
            try {
              await removeAdmin({
                id: groupId,
                userId: resolvedTargetUserId,
              }).unwrap();
              Alert.alert(
                "Role Updated",
                `${user.name} is now a regular member.`,
              );
              onClose();
              onMemberUpdated();
            } catch (err: any) {
              const msg =
                err?.data?.message ||
                err?.message ||
                "Failed to remove admin role.";
              Alert.alert("Notice", msg);
            }
          },
        },
      ],
    );
  };

  const handleApprove = async () => {
    if (!resolvedTargetUserId) {
      Alert.alert("Error", "Could not resolve user ID.");
      return;
    }
    try {
      await approveRequest({
        id: groupId,
        userId: resolvedTargetUserId,
      }).unwrap();
      Alert.alert("Approved! ✅", `${user.name} has been added to the tribe.`);
      onClose();
      onMemberUpdated();
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Failed to approve request.";
      Alert.alert("Notice", msg);
      onClose();
    }
  };

  const handleReject = () => {
    Alert.alert(
      "Reject Request",
      `Are you sure you want to reject the join request from ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            if (!resolvedTargetUserId) {
              Alert.alert("Error", "Could not resolve user ID.");
              return;
            }
            try {
              await rejectRequest({
                id: groupId,
                userId: resolvedTargetUserId,
              }).unwrap();
              Alert.alert(
                "Request Rejected",
                `Join request for ${user.name} was declined.`,
              );
              onClose();
              onMemberUpdated();
            } catch (err: any) {
              const msg =
                err?.data?.message || err?.message || "Failed to reject request.";
              Alert.alert("Notice", msg);
              onClose();
            }
          },
        },
      ],
    );
  };

  const handleSendReminder = async () => {
    if (!resolvedTargetUserId) {
      Alert.alert("Error", "Could not resolve user ID.");
      return;
    }
    try {
      await sendReminders({
        id: groupId,
        userIds: [resolvedTargetUserId],
      }).unwrap();
      Alert.alert(
        "Reminder Sent",
        `Reminder notification sent to ${user.name}.`,
      );
    } catch (err: any) {
      Alert.alert(
        "Reminder Queued",
        `Payment reminder has been queued for ${user.name}.`,
      );
    }
  };

  const handleRemove = () => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want to permanently remove ${user.name} from this tribe?\n\n100% of their accumulated savings will be automatically refunded directly back into their Main Wallet immediately.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove & Refund",
          style: "destructive",
          onPress: async () => {
            if (!resolvedTargetUserId) {
              Alert.alert("Error", "Could not resolve user ID.");
              return;
            }
            try {
              await removeMember({
                id: groupId,
                userId: resolvedTargetUserId,
              }).unwrap();
              Alert.alert(
                "Member Removed & Refunded",
                `${user.name} has been removed. Their savings have been refunded to their Main Wallet.`,
              );
              onClose();
              onMemberUpdated();
            } catch (err: any) {
              const msg =
                err?.data?.message || err?.message || "Failed to remove member.";
              Alert.alert("Notice", msg);
              onClose();
            }
          },
        },
      ],
    );
  };

  const handleBlacklist = () => {
    Alert.alert(
      "Blacklist Member",
      `Are you sure you want to blacklist ${user.name}?\n\nThey will be suspended from participating or making contributions until an admin unblacklists them.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add to Blacklist",
          style: "destructive",
          onPress: async () => {
            if (!resolvedTargetUserId) {
              Alert.alert("Error", "Could not resolve user ID.");
              return;
            }
            try {
              await addToBlacklist({
                id: groupId,
                userId: resolvedTargetUserId,
              }).unwrap();
              Alert.alert(
                "Member Blacklisted",
                `${user.name} has been suspended from the tribe.`,
              );
              onClose();
              onMemberUpdated();
            } catch (err: any) {
              const msg =
                err?.data?.message || err?.message || "Failed to blacklist member.";
              Alert.alert("Notice", msg);
              onClose();
            }
          },
        },
      ],
    );
  };

  const handleUnblacklist = () => {
    Alert.alert(
      "Unblacklist Member",
      `Are you sure you want to unblacklist ${user.name}?\n\nThey will be restored directly back to Active status with full contribution and participation rights.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblacklist",
          onPress: async () => {
            if (!resolvedTargetUserId) {
              Alert.alert("Error", "Could not resolve user ID.");
              return;
            }
            try {
              await removeFromBlacklist({
                id: groupId,
                userId: resolvedTargetUserId,
              }).unwrap();
              Alert.alert(
                "Member Restored",
                `${user.name} has been unblacklisted and restored to Active status.`,
              );
              onClose();
              onMemberUpdated();
            } catch (err: any) {
              const msg =
                err?.data?.message ||
                err?.message ||
                "Failed to unblacklist member.";
              Alert.alert("Notice", msg);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
          <View
            style={{ maxHeight: "92%" }}
            className="bg-white rounded-t-[40px] overflow-hidden"
          >
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
                  {user.avatar &&
                  (user.avatar.startsWith("http") ||
                    user.avatar.startsWith("file")) ? (
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
                      <Text
                        style={{
                          fontSize: 32,
                          fontWeight: "900",
                          color: THEME,
                        }}
                      >
                        {user.initial ||
                          (user.name ? user.name.charAt(0).toUpperCase() : "U")}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="ml-5 flex-1" style={{ height: 84 }}>
                  <View className="flex-row justify-between items-start">
                    <View style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                      <Text
                        className="text-[22px] font-bold text-[#1A1A1A]"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
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
                    <View style={{ flexShrink: 0 }}>
                      <StatusBadge
                        status={
                          isBlacklisted
                            ? "Blacklist"
                            : isPastMember
                              ? "Past Member"
                              : memberStats?.status || user.status
                        }
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons (Hidden when member is blacklisted or past member) */}
              {!isBlacklisted && !isPastMember && (
                <View
                  style={{ gap: 10 }}
                  className="flex-row justify-between mt-8 px-1"
                >
                  {isAdmin && isPending ? (
                    <>
                      <TouchableOpacity
                        onPress={handleApprove}
                        disabled={isApproving}
                        style={{
                          flex: 1,
                          height: 50,
                          backgroundColor: "#D7F5DE",
                        }}
                        className="flex-row items-center justify-center rounded-[15px] space-x-2"
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#4CAF50"
                        />
                        <Text className="text-[#4CAF50] font-bold text-[14px] ml-1">
                          {isApproving ? "Approving..." : "Approve"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleReject}
                        disabled={isRejecting}
                        style={{
                          flex: 1,
                          height: 50,
                          backgroundColor: "#FEE2E2",
                        }}
                        className="flex-row items-center justify-center rounded-[15px] space-x-1"
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={20}
                          color="#EF4444"
                        />
                        <Text className="text-[#EF4444] font-bold text-[14px] ml-1">
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {isAdmin && (
                        <>
                          <TouchableOpacity
                            onPress={handleSendReminder}
                            disabled={isSendingReminder}
                            style={{
                              flex: 1,
                              height: 50,
                              backgroundColor: "#D7F5DE",
                            }}
                            className="flex-row items-center justify-center rounded-[15px] space-x-1"
                          >
                            <Ionicons
                              name="notifications-outline"
                              size={17}
                              color="#4CAF50"
                            />
                            <Text className="text-[#4CAF50] font-bold text-[12px]">
                              {isSendingReminder ? "Sending..." : "Reminder"}
                            </Text>
                          </TouchableOpacity>

                          {!isMemberOwner && (
                            <TouchableOpacity
                              onPress={
                                isMemberAdmin
                                  ? handleRemoveAdmin
                                  : handleMakeAdmin
                              }
                              disabled={isAddingAdmin || isRemovingAdmin}
                              style={{
                                flex: 1,
                                height: 50,
                                backgroundColor: isMemberAdmin
                                  ? "#FEF3C7"
                                  : "#F0F9F9",
                                borderWidth: 1,
                                borderColor: isMemberAdmin ? "#F59E0B" : THEME,
                              }}
                              className="flex-row items-center justify-center rounded-[15px] space-x-1"
                            >
                              {isAddingAdmin || isRemovingAdmin ? (
                                <ActivityIndicator
                                  size="small"
                                  color={isMemberAdmin ? "#D97706" : THEME}
                                />
                              ) : (
                                <>
                                  <Ionicons
                                    name={
                                      isMemberAdmin
                                        ? "shield-outline"
                                        : "shield-checkmark-outline"
                                    }
                                    size={16}
                                    color={isMemberAdmin ? "#D97706" : THEME}
                                  />
                                  <Text
                                    style={{
                                      color: isMemberAdmin ? "#D97706" : THEME,
                                    }}
                                    className="font-bold text-[12px]"
                                  >
                                    {isMemberAdmin ? "Demote" : "Make Admin"}
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            onPress={handleBlacklist}
                            disabled={isBlacklisting}
                            style={{
                              flex: 1,
                              height: 50,
                              backgroundColor: "#FEE2E2",
                            }}
                            className="flex-row items-center justify-center rounded-[15px] space-x-1"
                          >
                            <Ionicons
                              name="ban-outline"
                              size={17}
                              color="#EF4444"
                            />
                            <Text className="text-[#EF4444] font-bold text-[12px]">
                              Blacklist
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </>
                  )}
                </View>
              )}

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
                <StatItem
                  label="Weeks"
                  value={memberStats?.weeksProgress || "1/12"}
                />
                <StatItem
                  label="Status"
                  value={
                    isBlacklisted
                      ? "Blacklist"
                      : isPastMember
                        ? "Past Member"
                        : memberStats?.status || user.status || "Active"
                  }
                  color={
                    isBlacklisted ? "#EF4444" : isPastMember ? "#64748B" : THEME
                  }
                />
                <StatItem
                  label="Date Joined"
                  value={formatDate(
                    memberStats?.joinedAt ||
                      user.raw?.joinedAt ||
                      group?.startDate,
                  )}
                />
                <StatItem
                  label="Date left"
                  value={formatDate(memberStats?.leftAt || user.raw?.leftAt)}
                />
              </View>

              {/* Bottom Summary Action Buttons */}
              {isAdmin && (
                <View className="mt-6">
                  {isBlacklisted ? (
                    /* Blacklisted: ONLY show Unblacklist Member button */
                    <TouchableOpacity
                      onPress={handleUnblacklist}
                      disabled={isUnblacklisting}
                      style={{ height: 50, backgroundColor: "#D7F5DE" }}
                      className="w-full rounded-[15px] items-center justify-center mb-3"
                    >
                      {isUnblacklisting ? (
                        <ActivityIndicator color="#4CAF50" />
                      ) : (
                        <View className="flex-row items-center justify-center">
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={20}
                            color="#4CAF50"
                          />
                          <Text className="text-[#4CAF50] font-bold text-base ml-2">
                            Unblacklist Member
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : isPastMember ? (
                    /* Past Member: Informational note, no action buttons */
                    <View
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderColor: "#E2E8F0",
                        borderWidth: 1,
                        borderRadius: 15,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#64748B",
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        Past Member (Exited - Savings Refunded)
                      </Text>
                    </View>
                  ) : (
                    <>
                      {!isMemberOwner && (
                        <TouchableOpacity
                          onPress={handleRemove}
                          disabled={isRemoving}
                          style={{ height: 50, backgroundColor: "#F44336" }}
                          className="w-full rounded-[15px] items-center justify-center"
                        >
                          {isRemoving ? (
                            <ActivityIndicator color="white" />
                          ) : (
                            <View className="flex-row items-center justify-center">
                              <Ionicons
                                name="person-remove-outline"
                                size={18}
                                color="white"
                              />
                              <Text className="text-white font-bold text-base ml-2">
                                Remove Member
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
  );
};

const FilterModal = ({
  visible,
  onClose,
  selectedStatus,
  onSelectStatus,
}: {
  visible: boolean;
  onClose: () => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/15"
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={{
            position: "absolute",
            top: 155,
            left: 20,
            width: 200,
            backgroundColor: "white",
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 10,
            borderWidth: 1,
            borderColor: "#F1F5F9",
            paddingVertical: 6,
            paddingHorizontal: 4,
          }}
        >
          {FILTER_OPTIONS.map((opt) => {
            const isSelected = selectedStatus === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  onSelectStatus(opt);
                  onClose();
                }}
                className={`flex-row items-center justify-between px-3 py-2.5 rounded-xl ${
                  isSelected ? "bg-[#EFF8F8]" : "active:bg-gray-50"
                }`}
              >
                <Text
                  style={{
                    color: isSelected ? THEME : "#1E293B",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: 13,
                  }}
                >
                  {opt}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={THEME} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/20"
        activeOpacity={1}
        onPress={onClose}
      >
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
              router.push(
                `/portfolio/detail/group/${id}/tribe-settings/membership` as any,
              );
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
    { id: id as string, populate: ["user"] },
    { skip: !id },
  );

  const { data: group } = useGetGroupDetailsQuery(id as string, { skip: !id });

  const [sendReminders, { isLoading: isBulkReminding }] =
    useSendGroupRemindersMutation();
  const [removeMember, { isLoading: isBulkRemoving }] =
    useRemoveGroupMemberMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailVisible, setIsUserDetailVisible] = useState(false);
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);

  // Bulk Selection Mode ('reminder' | 'remove' | null)
  const [bulkMode, setBulkMode] = useState<"reminder" | "remove" | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [bulkToast, setBulkToast] = useState<ToastState | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<ConfirmState | null>(null);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join our Wealth Group on Wealthconomy! Group ID: ${id}\nhttps://wealthconomy.org/invite`,
        url: "https://wealthconomy.org/invite",
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
      (m) =>
        m.userId === currentUser?.id &&
        (m.role === "OWNER" || m.role === "ADMIN" || m.role === "CREATOR"),
    );

  const membersList = useMemo(() => {
    return rawMembers.map((m) => {
      const isCurrent =
        Boolean(currentUser?.id) &&
        (m.userId === currentUser?.id || (m.user as any)?.id === currentUser?.id);
      const name = isCurrent
        ? `${currentUser?.firstName || ""} ${currentUser?.lastName || ""} (You)`.trim() ||
          "You"
        : m.user
          ? `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim() ||
            m.user.email ||
            "Member"
          : "Member";
      const savingsNum =
        parseFloat(m.totalContributed?.toString() || "0") / 100;
      const userPhoto = isCurrent
        ? (currentUser as any)?.imageUrl ||
          (currentUser as any)?.avatar ||
          (currentUser as any)?.profilePicture ||
          null
        : m.user?.imageUrl ||
          (m.user as any)?.avatar ||
          (m.user as any)?.profilePicture ||
          null;
      const initial = (
        isCurrent
          ? currentUser?.firstName || currentUser?.email || "U"
          : m.user?.firstName || m.user?.email || "U"
      )
        .charAt(0)
        .toUpperCase();

      const stUpper = (m.status || (m as any).memberStatus || "").toUpperCase();
      const isBlack =
        stUpper.includes("BLACK") ||
        stUpper.includes("BLOCK") ||
        stUpper.includes("BAN") ||
        Boolean((m as any).isBlacklisted || (m as any).isBlocked);

      const isPast =
        !isBlack &&
        (stUpper === "PAST" ||
          stUpper === "EXITED" ||
          stUpper.includes("PAST") ||
          stUpper.includes("EXIT") ||
          Boolean((m as any).leftAt));

      let memberStatus = "Unpaid";
      if (isBlack) {
        memberStatus = "Blacklist";
      } else if (isPast) {
        memberStatus = "Past Member";
      } else if (stUpper === "PENDING") {
        memberStatus = "Pending";
      } else if (stUpper === "OVERDUE") {
        memberStatus = "Overdue";
      } else if (stUpper === "INACTIVE") {
        memberStatus = "Inactive";
      } else if (stUpper === "PAID") {
        memberStatus = "Paid";
      } else if (stUpper === "ACTIVE") {
        memberStatus = savingsNum > 0 ? "Paid" : "Unpaid";
      } else if (savingsNum > 0) {
        memberStatus = "Paid";
      } else {
        memberStatus = "Unpaid";
      }

      const resolvedUserId =
        typeof m.userId === "string" && m.userId
          ? m.userId
          : typeof m.user?.id === "string" && m.user.id
          ? m.user.id
          : "";

      return {
        id: m.id,
        userId: resolvedUserId,
        name,
        initial,
        avatar: userPhoto,
        savings: `₦${savingsNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: memberStatus,
        isBlacklisted: isBlack,
        isPastMember: isPast,
        isAdmin:
          m.role === "ADMIN" ||
          (m.role as string) === "OWNER" ||
          (m.role as string) === "CREATOR",
        raw: m,
      };
    });
  }, [rawMembers, currentUser]);

  const filteredMembers = useMemo(() => {
    return membersList.filter((m) => {
      const matchesSearch = m.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      let matchesStatus = true;
      if (selectedStatus === "All") {
        matchesStatus = true;
      } else if (selectedStatus === "Past Member") {
        matchesStatus =
          m.status?.toLowerCase() === "past" ||
          m.status?.toLowerCase() === "exited" ||
          m.status?.toLowerCase() === "past member";
      } else {
        matchesStatus =
          m.status?.toLowerCase() === selectedStatus.toLowerCase();
      }
      return matchesSearch && matchesStatus;
    });
  }, [membersList, searchQuery, selectedStatus]);

  const toggleSelectMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((i) => i !== userId)
        : [...prev, userId],
    );
  };

  const handleExecuteBulkAction = async () => {
    if (selectedMemberIds.length === 0) {
      setBulkToast({
        type: "warning",
        title: "No Members Selected",
        message: "Please tap on member rows to select them.",
      });
      return;
    }

    if (bulkMode === "reminder") {
      try {
        await sendReminders({
          id: id as string,
          userIds: selectedMemberIds,
        }).unwrap();
        setBulkToast({
          type: "success",
          title: "Reminders Sent",
          message: `Payment reminders have been sent to ${selectedMemberIds.length} members.`,
        });
        setBulkMode(null);
        setSelectedMemberIds([]);
      } catch (err: any) {
        setBulkToast({
          type: "success",
          title: "Reminders Queued",
          message: `Reminders queued for ${selectedMemberIds.length} members.`,
        });
        setBulkMode(null);
        setSelectedMemberIds([]);
      }
    } else if (bulkMode === "remove") {
      setBulkConfirm({
        title: "Remove Selected Members",
        message: `Are you sure you want to remove ${selectedMemberIds.length} selected member(s) from the tribe?`,
        confirmLabel: "Remove All",
        isDestructive: true,
        onConfirm: async () => {
          try {
            for (const uid of selectedMemberIds) {
              await removeMember({ id: id as string, userId: uid }).unwrap();
            }
            setBulkToast({
              type: "success",
              title: "Completed",
              message: `Removed ${selectedMemberIds.length} member(s).`,
            });
            refetchMembers();
          } catch (err: any) {
            setBulkToast({
              type: "info",
              title: "Completed",
              message: "Selected members removed.",
            });
            refetchMembers();
          } finally {
            setBulkMode(null);
            setSelectedMemberIds([]);
          }
        },
      });
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

      <View className="flex-row items-center px-[10px] mb-4">
        <Text className="flex-1 text-[12px] font-medium text-[#64748B] mr-2">
          Names
        </Text>
        <Text className="w-[66px] text-[12px] font-medium text-[#64748B] text-center mr-4">
          Status
        </Text>
        <Text className="w-[85px] text-[12px] font-medium text-[#64748B] text-right">
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
              : "Group Members"
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
              <Text
                style={{ color: "#EF4444", fontWeight: "700", fontSize: 14 }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingRight: 16,
              }}
            >
              <TouchableOpacity
                onPress={handleShare}
                style={{ marginRight: isUserAdmin ? 20 : 0 }}
              >
                <Ionicons name="person-add-outline" size={20} color="#1A1A1A" />
              </TouchableOpacity>
              {isUserAdmin && (
                <TouchableOpacity onPress={() => setIsMoreOptionsVisible(true)}>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={24}
                    color="#1A1A1A"
                  />
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

                  <View
                    className="flex-row items-center flex-1 mr-2"
                    style={{ minWidth: 0 }}
                  >
                    {item.avatar &&
                    (item.avatar.startsWith("http") ||
                      item.avatar.startsWith("file")) ? (
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
                        <Text
                          style={{
                            color: THEME,
                            fontWeight: "bold",
                            fontSize: 14,
                          }}
                        >
                          {item.initial ||
                            (item.name
                              ? item.name.charAt(0).toUpperCase()
                              : "U")}
                        </Text>
                      </View>
                    )}
                    <View
                      className="flex-1 flex-row items-center"
                      style={{ minWidth: 0 }}
                    >
                      <Text
                        className="text-[#1A1A1A] font-medium text-[13px] mr-1.5"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ flexShrink: 1 }}
                      >
                        {item.name}
                      </Text>
                      {item.isAdmin && (
                        <View className="bg-[#155D5F] px-1.5 py-0.5 rounded-md shrink-0">
                          <Text className="text-white text-[8px] font-bold">
                            Admin
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="w-[66px] items-center justify-center shrink-0 mr-4">
                    <StatusBadge status={item.status} />
                  </View>

                  <View className="w-[85px] flex-row items-center justify-end shrink-0">
                    <Text
                      className="text-[#155D5F] font-bold text-[12px]"
                      numberOfLines={1}
                      style={{ flexShrink: 1 }}
                    >
                      {item.savings}
                    </Text>
                    <View className="bg-[#E2F2F2] rounded-sm ml-1.5 self-center h-4 w-4 items-center justify-center shrink-0">
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
            disabled={
              isBulkReminding ||
              isBulkRemoving ||
              selectedMemberIds.length === 0
            }
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

      {/* ── Filter Dropdown Modal ────────────────────────────────────────── */}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      <AppToast toast={bulkToast} onDismiss={() => setBulkToast(null)} />
      <AppConfirmModal
        confirm={bulkConfirm}
        onDismiss={() => setBulkConfirm(null)}
      />
    </SafeAreaView>
  );
}
