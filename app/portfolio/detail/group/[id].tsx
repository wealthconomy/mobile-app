import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { ConfirmActionModal } from "@/src/components/common/ConfirmActionModal";
import { AppToast, ToastState } from "@/src/components/common/AppToast";
import { AppRefreshIndicator } from "@/src/components/common/AppRefreshIndicator";
import {
  useContributeToGroupMutation,
  useExitGroupMutation,
  useTerminateGroupMutation,
  useGetGroupDetailsQuery,
  useGetGroupMembersQuery,
  useJoinGroupMutation,
  useReportGroupMutation,
  useToggleGroupMuteMutation,
  useWithdrawFromGroupMutation,
} from "@/src/store/api/groupApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { useListNotificationsQuery } from "@/src/store/api/notificationApi";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import { ThemedButton } from "@/src/components/ThemedButton";
import {
  KeyboardDoneAccessory,
  KEYBOARD_ACCESSORY_ID,
} from "@/src/components/common/KeyboardDoneAccessory";
import { RootState } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowUp,
  Bell,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  Share2,
  Users,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const THEME = "#155D5F";
const THEME_LIGHT = "#E0F2F1";
const THEME_BG = "#F2FFFF";
const TEXT_DARK = "#1A1A1A";

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Balance visibility state
  const [showBalance, setShowBalance] = useState(true);

  // Menu popup state
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Modals state
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);
  const [isTerminateModalVisible, setIsTerminateModalVisible] = useState(false);
  const [showConfirmDepositModal, setShowConfirmDepositModal] = useState(false);
  const [showConfirmWithdrawModal, setShowConfirmWithdrawModal] = useState(false);
  const [showJoinRequestSentModal, setShowJoinRequestSentModal] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);

  // Deposit / Withdraw Form state
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [joinRequested, setJoinRequested] = useState(false);

  // Screen focus & rotational group auto-polling state
  const [isFocused, setIsFocused] = useState(true);
  const [isRotationalActive, setIsRotationalActive] = useState(false);

  // Queries & Mutations
  const {
    data: group,
    isLoading: loading,
    refetch: refetchGroup,
  } = useGetGroupDetailsQuery(id as string, {
    skip: !id || id === "new",
    refetchOnMountOrArgChange: true,
    pollingInterval: isFocused && isRotationalActive ? 15000 : 0,
  });

  const { data: membersData, isLoading: membersLoading, refetch: refetchMembers } = useGetGroupMembersQuery(
    { id: id as string, populate: ["user"] },
    {
      skip: !id || id === "new",
      refetchOnMountOrArgChange: true,
      pollingInterval: isFocused && isRotationalActive ? 15000 : 0,
    }
  );

  useEffect(() => {
    const isActive =
      group?.groupType === "ROTATIONAL" &&
      (group?.status || (group as any)?.state || "").toString().trim().toUpperCase() === "ACTIVE";
    setIsRotationalActive(Boolean(isActive));
  }, [group]);

  const { data: notificationsData } = useListNotificationsQuery(
    { limit: 50 },
    {
      refetchOnFocus: true,
    }
  );

  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [contributeToGroup] = useContributeToGroupMutation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [toggleGroupMute] = useToggleGroupMuteMutation();
  const [exitGroup, { isLoading: isExiting }] = useExitGroupMutation();
  const [terminateGroup, { isLoading: isTerminating }] = useTerminateGroupMutation();
  const [reportGroup, { isLoading: isReporting }] = useReportGroupMutation();
  const [withdrawFromGroup, { isLoading: isWithdrawing }] = useWithdrawFromGroupMutation();
  const [verifyPin] = useVerifyPinMutation();
  const { data: walletSummary, refetch: refetchWallet } = useGetWalletSummaryQuery();
  const walletBalance = (parseFloat(walletSummary?.currentBalance || "0")) / 100;

  useEffect(() => {
    if (isDepositModalVisible && group) {
      const isFixedOrRotational = group.groupType === "FIXED" || group.groupType === "ROTATIONAL";
      if (isFixedOrRotational && group.contributionAmount) {
        const amtKobo = typeof group.contributionAmount === "number"
          ? group.contributionAmount
          : parseFloat(String(group.contributionAmount));
        const amtNaira = amtKobo / 100;
        if (!isNaN(amtNaira) && amtNaira > 0) {
          const rounded = Math.floor(amtNaira);
          setDepositAmount(rounded.toLocaleString("en-US"));
        }
      }
    }
  }, [isDepositModalVisible, group]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        refetchGroup(),
        refetchMembers(),
        refetchWallet(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      refetchGroup();
      refetchMembers();
      refetchWallet();
      return () => {
        setIsFocused(false);
      };
    }, [refetchGroup, refetchMembers, refetchWallet])
  );

  const groupUnreadCount = useMemo(() => {
    const allItems: any[] =
      notificationsData?.data?.items ||
      (notificationsData as any)?.items ||
      [];
    if (!id) return 0;
    const idStr = String(id).toLowerCase();

    return allItems.filter((item) => {
      const isUnread = !item.isRead && !item.read && !item.readAt && item.status !== "READ";
      if (!isUnread) return false;

      const dataGroupId = item.data?.groupId || item.data?.targetId || item.data?.id;
      if (dataGroupId && String(dataGroupId).toLowerCase() === idStr) return true;

      const kindStr = (item.kind || item.type || "").toLowerCase();
      if (kindStr.includes("group") || kindStr.includes("tribe")) return true;

      const text = `${item.title || ""} ${item.body || ""}`.toLowerCase();
      return (
        text.includes("reminder") ||
        text.includes("tribe") ||
        text.includes("group") ||
        text.includes("contribution") ||
        text.includes("deposit") ||
        text.includes("blacklist") ||
        text.includes("removed") ||
        text.includes("member")
      );
    }).length;
  }, [notificationsData, id]);

  const hasRemovedNotification = useMemo(() => {
    const allItems: any[] =
      notificationsData?.data?.items ||
      (notificationsData as any)?.items ||
      [];
    if (!id) return false;
    const idStr = String(id).toLowerCase();
    return allItems.some((item) => {
      const dataGroupId = item.data?.groupId || item.data?.targetId || item.data?.id;
      const matchesGroup = dataGroupId && String(dataGroupId).toLowerCase() === idStr;
      const text = `${item.title || ""} ${item.body || ""}`.toLowerCase();
      const isRemovalMsg =
        (text.includes("removed") || text.includes("refunded") || text.includes("exited")) &&
        (text.includes("tribe") || text.includes("group") || matchesGroup);
      return matchesGroup && isRemovalMsg;
    });
  }, [notificationsData, id]);

  // Payout positions have been set when the backend explicitly confirms it.
  // positionsSet is now a real field on GET /groups/{id} (confirmed by backend).
  const arePositionsSet = useMemo(() => {
    if (group?.groupType !== "ROTATIONAL") return true;
    return Boolean(group?.positionsSet);
  }, [group]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Group Details" onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      </SafeAreaView>
    );
  }

  const groupName = group?.name || "Wealth Tribe";
  const targetKobo = parseFloat(group?.targetAmount?.toString() || "100000000");
  const targetNaira = targetKobo / 100;

  const groupStatus = (group?.status || (group as any)?.state || "").toString().trim().toUpperCase();
  const isTerminated =
    groupStatus === "TERMINATED" ||
    groupStatus === "DISSOLVED" ||
    groupStatus === "CANCELLED" ||
    groupStatus === "CLOSED" ||
    groupStatus === "INACTIVE" ||
    groupStatus === "ENDED" ||
    groupStatus === "DISBANDED" ||
    Boolean((group as any)?.isTerminated) ||
    Boolean((group as any)?.is_terminated);

  const rawSavings = group?.totalSavings ?? group?.currentBalance ?? 0;
  const savingsNum = typeof rawSavings === "string" ? parseFloat(rawSavings) : Number(rawSavings);
  const membersTotal = membersData?.items?.reduce(
    (sum, m) => sum + (parseFloat(m.totalContributed?.toString() || "0") || 0),
    0
  ) || 0;
  const effectiveKobo = (savingsNum > 0 ? savingsNum : membersTotal) || 0;
  const currentNaira = effectiveKobo / 100;

  const fixedContribKobo = typeof group?.contributionAmount === "number"
    ? group.contributionAmount
    : parseFloat(String(group?.contributionAmount || "0"));
  const fixedContribNaira = fixedContribKobo > 0 ? fixedContribKobo / 100 : 0;

  const currentMemberRecord = membersData?.items?.find(
    (m) => {
      const uid = currentUser?.id || (currentUser as any)?._id;
      const mUserId =
        typeof m.userId === "string" && m.userId
          ? m.userId
          : typeof (m as any).user?.id === "string" && (m as any).user.id
          ? (m as any).user.id
          : null;
      return uid && (mUserId === uid || m.id === uid);
    }
  );
  const userContributedKobo = parseFloat(
    currentMemberRecord?.totalContributed?.toString() || "0"
  );
  const userContributedNaira = userContributedKobo / 100;

  // Membership & Creator detection
  const isCreator =
    (currentUser?.id && group?.creatorId === currentUser.id) ||
    membersData?.items?.some(
      (m) =>
        (m.userId === currentUser?.id || (m as any).user?.id === currentUser?.id) &&
        (m.role === "OWNER" || m.role === "CREATOR")
    );

  const currentMemberStatus = (
    currentMemberRecord?.status ||
    (currentMemberRecord as any)?.raw?.status ||
    ""
  )
    .toString()
    .trim()
    .toUpperCase();

  const groupUserStatus = (
    (group as any)?.userStatus ||
    (group as any)?.membershipStatus ||
    (group as any)?.memberStatus ||
    (group as any)?.userMembership?.status ||
    ""
  )
    .toString()
    .trim()
    .toUpperCase();

  // Temporary suspension (reversible) vs permanent removal (refunded)
  const isBlacklisted =
    !isCreator &&
    (currentMemberStatus === "BLACKLISTED" ||
      currentMemberStatus === "BLACKLIST" ||
      currentMemberStatus === "SUSPENDED" ||
      currentMemberStatus === "BANNED" ||
      currentMemberStatus === "BLOCKED" ||
      groupUserStatus === "BLACKLISTED" ||
      groupUserStatus === "BLACKLIST" ||
      groupUserStatus === "SUSPENDED" ||
      groupUserStatus === "BANNED" ||
      groupUserStatus === "BLOCKED" ||
      Boolean((currentMemberRecord as any)?.isBlacklisted));

  const isActiveMember =
    Boolean(currentMemberRecord) &&
    !isBlacklisted &&
    (currentMemberStatus === "ACTIVE" ||
      currentMemberStatus === "PAID" ||
      currentMemberStatus === "UNPAID" ||
      currentMemberStatus === "APPROVED");

  const isMemberRecordRemoved =
    Boolean(currentMemberRecord) &&
    !isBlacklisted &&
    !isActiveMember &&
    (currentMemberStatus === "REMOVED" ||
      currentMemberStatus === "EXITED" ||
      currentMemberStatus === "PAST" ||
      currentMemberStatus === "PAST MEMBER" ||
      currentMemberStatus === "KICKED" ||
      currentMemberStatus.includes("REMOVE") ||
      currentMemberStatus.includes("EXIT") ||
      Boolean((currentMemberRecord as any)?.leftAt) ||
      Boolean((currentMemberRecord as any)?.removedAt));

  const isGroupUserRemoved =
    !isBlacklisted &&
    !isActiveMember &&
    (groupUserStatus === "REMOVED" ||
      groupUserStatus === "EXITED" ||
      groupUserStatus === "PAST" ||
      groupUserStatus === "PAST MEMBER" ||
      groupUserStatus === "KICKED" ||
      groupUserStatus.includes("REMOVE") ||
      groupUserStatus.includes("EXIT") ||
      Boolean(
        Array.isArray((group as any)?.removedMembers) &&
          (group as any).removedMembers.some((m: any) => {
            const uid = typeof m === "string" ? m : m?.userId || m?.id;
            return uid === currentUser?.id;
          })
      ) ||
      Boolean(
        Array.isArray((group as any)?.pastMembers) &&
          (group as any).pastMembers.some((m: any) => {
            const uid = typeof m === "string" ? m : m?.userId || m?.id;
            return uid === currentUser?.id;
          })
      ));

  const isRemoved =
    !isCreator &&
    !isBlacklisted &&
    !isActiveMember &&
    (isMemberRecordRemoved ||
      isGroupUserRemoved ||
      (!currentMemberRecord && hasRemovedNotification));

  const isPendingJoin =
    !isRemoved &&
    !isBlacklisted &&
    (joinRequested ||
      membersData?.items?.some(
        (m) =>
          (m.userId === currentUser?.id || (m as any).user?.id === currentUser?.id) &&
          (m.status === "PENDING" || (m.status as string) === "Pending")
      ) ||
      groupUserStatus === "PENDING");

  const isMember =
    !isRemoved &&
    !isBlacklisted &&
    !isPendingJoin &&
    (isCreator ||
      (Boolean(group?.isMember) &&
        groupUserStatus !== "PENDING" &&
        groupUserStatus !== "REMOVED" &&
        groupUserStatus !== "EXITED" &&
        groupUserStatus !== "PAST" &&
        groupUserStatus !== "PAST MEMBER" &&
        groupUserStatus !== "BANNED" &&
        groupUserStatus !== "BLACKLISTED" &&
        groupUserStatus !== "BLACKLIST" &&
        groupUserStatus !== "SUSPENDED" &&
        groupUserStatus !== "BLOCKED" &&
        groupUserStatus !== "KICKED") ||
      isActiveMember);

  const isAdmin =
    !isRemoved &&
    !isBlacklisted &&
    (isCreator ||
      group?.isAdmin ||
      membersData?.items?.some(
        (m) =>
          (m.userId === currentUser?.id || (m as any).user?.id === currentUser?.id) &&
          (m.role === "OWNER" || m.role === "ADMIN")
      ));

  const activeMembersCount =
    membersData?.items?.filter(
      (m) =>
        m.status === "ACTIVE" ||
        m.status === "PAID" ||
        m.status === "UNPAID" ||
        m.role === "CREATOR" ||
        m.role === "OWNER"
    ).length ||
    (group as any)?.membersCount ||
    (group as any)?.activeMembersCount ||
    0;

  const membersLimitNum = group?.membersLimit ? Number(group.membersLimit) : 0;
  const isGroupFull = membersLimitNum > 0 && activeMembersCount >= membersLimitNum;

  // Calculations
  const progress = targetNaira > 0 ? (currentNaira / targetNaira) * 100 : 0;
  const progressPct = Math.min(Math.max(Math.round(progress), 0), 100);

  const parseGroupDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    const trimmed = dateString.trim();
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/").map((p) => parseInt(p.trim(), 10));
      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const d = new Date(year, month - 1, day, 23, 59, 59);
          if (!isNaN(d.getTime())) return d;
        }
      }
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  };

  const getTimelineLeft = () => {
    if (isTerminated) return "Terminated";
    if (!group?.endDate) return "Flexible";
    const d = parseGroupDate(group.endDate);
    if (!d) return "Flexible";
    const end = d.getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Completed";
    if (diffDays >= 14) {
      const weeks = Math.round(diffDays / 7);
      return `${weeks} Weeks Left`;
    }
    return `${diffDays} Days Left`;
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return "N/A";
    const d = parseGroupDate(dateString);
    if (!d || isNaN(d.getTime())) return dateString;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ── Actions ──────────────────────────────────────────────────────────
  const isPublicGroup =
    group?.accessType?.toLowerCase().includes("public") ||
    (!group?.accessType && !(group as any)?.isPrivate);

  const handleInvite = async () => {
    setIsMenuVisible(false);
    try {
      await Share.share({
        message: `Join my Wealth Group "${groupName}" on Wealthconomy! 🚀\n\nTarget: ₦${formatCurrency(
          targetNaira
        )}\n\nJoin here: wealthconomy://group/join/${id}`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleJoinSubmit = async () => {
    if (!id || isProcessing || isJoining) return;
    if (isGroupFull) {
      setToast({
        type: "warning",
        title: "Group Full",
        message: "This group has reached its maximum member capacity.",
      });
      return;
    }
    setIsProcessing(true);
    try {
      console.log(`👥 [WealthGroup Join Request] POST /api/v1/groups/${id}/join`);
      await joinGroup(id as string).unwrap();
      if (isPublicGroup) {
        setToast({
          type: "success",
          title: "Group Joined Successfully! 🎉",
          message: `Congratulations! You have joined "${groupName}".`,
        });
      } else {
        setJoinRequested(true);
        setShowJoinRequestSentModal(true);
      }
      setIsJoinModalVisible(false);
      refetchGroup();
      refetchMembers();
    } catch (err: any) {
      console.error("❌ [WealthGroup Join Error]:", err);
      const msg = err?.data?.message || err?.message || "Failed to join group.";
      if (msg.toLowerCase().includes("already")) {
        setJoinRequested(true);
      }
      setToast({ type: "error", title: "Notice", message: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMuteToggle = async () => {
    setIsMenuVisible(false);
    try {
      await toggleGroupMute({ id: id as string, isMuted: true }).unwrap();
      setToast({
        type: "success",
        title: "Notifications Muted",
        message: "Group notifications have been muted.",
      });
    } catch (err: any) {
      setToast({
        type: "info",
        title: "Notice",
        message: "Group notification preferences updated.",
      });
    }
  };

  // Is the group contribution period ended?
  const isGroupEnded = (() => {
    if (!group?.endDate) return false;
    const end = parseGroupDate(group.endDate)?.getTime();
    if (!end) return false;
    return end < Date.now();
  })();

  // Has the current user fully withdrawn their savings from a matured/completed group?
  const hasFullyWithdrawn = isGroupEnded && userContributedNaira <= 0;

  const handleReportGroup = () => {
    setIsMenuVisible(false);
    setIsReportModalVisible(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      setToast({
        type: "warning",
        title: "Reason Required",
        message: "Please describe the issue before submitting.",
      });
      return;
    }
    try {
      await reportGroup({ id: id as string, reason: reportReason.trim() }).unwrap();
      setToast({
        type: "success",
        title: "Report Submitted",
        message: "Your report has been sent to our support team for review.",
      });
      setIsReportModalVisible(false);
      setReportReason("");
    } catch (err: any) {
      setToast({
        type: "error",
        title: "Report Failed",
        message: err?.data?.message || err?.message || "Failed to submit report. Please try again.",
      });
    }
  };

  const handleExitGroup = () => {
    setIsMenuVisible(false);
    setIsExitModalVisible(true);
  };

  const handleConfirmExitGroup = async () => {
    try {
      await exitGroup(id as string).unwrap();
      setIsExitModalVisible(false);
      setToast({
        type: "success",
        title: "Exited Tribe",
        message: "You have left the tribe. Your refunded savings have been credited directly to your Main Wallet.",
      });
      setTimeout(() => {
        router.back();
      }, 900);
    } catch (err: any) {
      setIsExitModalVisible(false);
      setToast({
        type: "error",
        title: "Notice",
        message: err?.data?.message || "Failed to exit group. Please try again.",
      });
    }
  };

  const handleTerminateGroup = () => {
    setIsMenuVisible(false);
    setIsTerminateModalVisible(true);
  };

  const handleConfirmTerminateGroup = async () => {
    try {
      await terminateGroup(id as string).unwrap();
      setIsTerminateModalVisible(false);
      setToast({
        type: "success",
        title: "Group Terminated",
        message: "The tribe has been terminated. 100% of all members' saved contributions have been refunded directly into their Main Wallets.",
      });
      setTimeout(() => {
        router.back();
      }, 900);
    } catch (err: any) {
      setIsTerminateModalVisible(false);
      setToast({
        type: "error",
        title: "Notice",
        message: err?.data?.message || "Failed to terminate group. Please try again.",
      });
    }
  };

  const handleWithdraw = () => {
    setIsWithdrawModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAFA" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, justifyContent: "center" }}
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 17,
            fontWeight: "800",
            color: "#1A1A1A",
            paddingHorizontal: 8,
          }}
        >
          {groupName}
        </Text>

        {isMember && !isTerminated && !hasFullyWithdrawn && !isRemoved && !isBlacklisted ? (
          <TouchableOpacity
            onPress={() => setIsMenuVisible(true)}
            style={{ width: 40, height: 40, alignItems: "flex-end", justifyContent: "center" }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <AppRefreshIndicator refreshing={refreshing} topOffset={65} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={["#155D5F"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        <View className="px-5 py-4 pb-16">
          {/* ── Sub-header: Group Details + Notification Bell ────────── */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[20px] font-black text-[#1A1A1A]">Group Details</Text>
            {(isMember || isBlacklisted) && !isRemoved && (
              <TouchableOpacity
                onPress={() =>
                  router.push(`/portfolio/detail/group/${id}/notifications` as any)
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#F0F9F9",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <Ionicons name="notifications-outline" size={20} color={THEME} />
                {groupUnreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      minWidth: 18,
                      height: 18,
                      paddingHorizontal: 4,
                      borderRadius: 9,
                      backgroundColor: "#EF4444",
                      borderWidth: 1.5,
                      borderColor: "white",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 9, fontWeight: "800" }}>
                      {groupUnreadCount > 99 ? "99+" : groupUnreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* ── Group Cover Image ────────────────────────────────────── */}
          <View
            style={{
              width: "100%",
              height: 180,
              borderRadius: 18,
              overflow: "hidden",
              marginBottom: 16,
              backgroundColor: "#E2E8F0",
            }}
          >
            {group?.coverImage && !coverImageError ? (
              <Image
                source={{ uri: group.coverImage.startsWith("http://") ? group.coverImage.replace("http://", "https://") : group.coverImage }}
                onError={(e) => {
                  console.warn(`❌ [GroupDetail CoverImage Error] [${group?.name || id}]:`, e.nativeEvent?.error, `| URI: "${group?.coverImage}"`);
                  setCoverImageError(true);
                }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: THEME_BG, alignItems: "center", justifyContent: "center" }}>
                <Users size={64} color={THEME} />
              </View>
            )}
          </View>

          {/* ── Vetted Badge (if applicable) ───────────────────────── */}
          {Boolean(group?.isVetted) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F0FDF4",
                borderColor: "#86EFAC",
                borderWidth: 1,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                alignSelf: "flex-start",
                marginBottom: 14,
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 13 }}>🛡️</Text>
              <Text style={{ color: "#166534", fontSize: 12, fontWeight: "800" }}>
                Vetted & Established Process
              </Text>
            </View>
          )}

          {/* ── Rotational Cycle Indicator (if ROTATIONAL) ──────────── */}
          {group?.groupType === "ROTATIONAL" && (
            <View
              style={{
                backgroundColor: "#F0F9F9",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#B2EBF2",
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="sync-circle" size={22} color={THEME} />
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1A1A" }}>
                    {(group.currentCycle ?? 0) === 0
                      ? `Not started · 0 of ${group.totalCycles || group.membersLimit || 1} cycles`
                      : `Cycle ${group.currentCycle} of ${group.totalCycles || group.membersLimit || 1}`}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: THEME }}>
                  Rotational Ajo/Esusu
                </Text>
              </View>

              {/* Ajo Cycle Payout & Contribution Summary */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 10,
                  marginVertical: 8,
                  borderWidth: 1,
                  borderColor: "#E0F2F1",
                }}
              >
                <View>
                  <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>Member Contrib. / Cycle</Text>
                  <Text style={{ fontSize: 13, color: THEME, fontWeight: "800" }}>
                    ₦{fixedContribNaira > 0 ? formatCurrency(fixedContribNaira) : formatCurrency(targetNaira / (group.membersLimit || 1))}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>Cycle Lump-Sum Payout</Text>
                  <Text style={{ fontSize: 13, color: "#16A34A", fontWeight: "900" }}>
                    ₦{formatCurrency(targetNaira)}
                  </Text>
                </View>
              </View>

              {/* Cycle progress bar — only fills when currentCycle is explicitly provided by backend */}
              <View
                style={{
                  height: 8,
                  width: "100%",
                  backgroundColor: "#E0F2F1",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(100, Math.max(0, (((group.currentCycle ?? 0) / (group.totalCycles || group.membersLimit || 1)) * 100)))}%`,
                    backgroundColor: THEME,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          )}

          {/* ── Total Group Savings Card ─────────────────────────────── */}
          <View
            className="w-full rounded-[20px] bg-white relative overflow-hidden mb-6"
            style={{
              shadowColor: "#323232",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 9.3,
              elevation: 4,
              borderWidth: 0.7,
              borderColor: "#D9D9D9",
            }}
          >
            <Image
              source={require("@/assets/images/group.png")}
              className="absolute"
              style={{
                width: 240,
                height: 240,
                right: -60,
                top: 50,
                opacity: 0.3,
                transform: [{ rotate: "-378.33deg" }],
              }}
              resizeMode="contain"
            />

            <View style={{ padding: 22 }}>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[#4B5563] text-[14px] font-extrabold">
                  Total Group Savings
                </Text>
                <TouchableOpacity
                  onPress={() => setShowBalance(!showBalance)}
                  className="p-1"
                >
                  {showBalance ? (
                    <EyeOff size={20} color="#1A1A1A" />
                  ) : (
                    <Eye size={20} color="#1A1A1A" />
                  )}
                </TouchableOpacity>
              </View>

              <View className="flex-row items-baseline mb-2">
                {showBalance ? (
                  <BalanceText
                    amount={`₦${formatCurrency(currentNaira)}`}
                    fontSize={32}
                    color="#1A1A1A"
                  />
                ) : (
                  <Text className="text-[#1A1A1A] text-[32px] font-black tracking-tight">
                    ***
                  </Text>
                )}
              </View>

              <View className="flex-row items-center space-x-1">
                {isRemoved ? (
                  <Text className="text-[#EF4444] text-[13px] font-extrabold">
                    Removed from tribe • 100% savings refunded to Main Wallet
                  </Text>
                ) : isBlacklisted ? (
                  <Text className="text-[#D97706] text-[13px] font-extrabold">
                    Account suspended • Savings remain safe in group
                  </Text>
                ) : isTerminated ? (
                  <Text className="text-[#EF4444] text-[13px] font-extrabold">
                    Tribe dissolved • 100% savings refunded to Main Wallets
                  </Text>
                ) : (
                  <>
                    <Text className="text-[#4B5563] text-[13px] font-extrabold">
                      Group wealth grew by ₦{group?.dailyWealthGrowth ? (parseFloat(group.dailyWealthGrowth.toString()) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} today
                    </Text>
                    <ArrowUp size={14} color="#4CAF50" style={{ marginLeft: 4 }} />
                  </>
                )}
              </View>
            </View>
          </View>

          {/* ── Progress Bar & Timeline Row ──────────────────────────── */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 18 }}>➡️</Text>
              <Text style={{ fontSize: 18 }}>🏆</Text>
            </View>
            <View
              style={{
                width: "100%",
                height: 8,
                backgroundColor: THEME_LIGHT,
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  backgroundColor: THEME,
                  borderRadius: 4,
                }}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B" }}>
                {progressPct}%
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B" }}>
                {getTimelineLeft()}
              </Text>
            </View>
          </View>

          {/* ── Action Buttons for Members (Deposit / Withdraw / Terminated / Suspended / Removed Notice) ─────── */}
          {isRemoved ? (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FCA5A5",
                borderRadius: 16,
                padding: 18,
                marginBottom: 20,
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons name="person-remove" size={30} color="#EF4444" />
              <Text style={{ color: "#991B1B", fontWeight: "900", fontSize: 16, textAlign: "center", marginTop: 2 }}>
                Removed from Tribe
              </Text>
              <Text style={{ color: "#B91C1C", fontSize: 13, textAlign: "center", lineHeight: 19 }}>
                You've been removed from this group. 100% of your accumulated savings have been refunded directly into your Main Wallet.
              </Text>
            </View>
          ) : isBlacklisted ? (
            <View
              style={{
                backgroundColor: "#FFFBEB",
                borderWidth: 1,
                borderColor: "#FCD34D",
                borderRadius: 16,
                padding: 18,
                marginBottom: 20,
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons name="pause-circle" size={32} color="#D97706" />
              <Text style={{ color: "#92400E", fontWeight: "900", fontSize: 16, textAlign: "center", marginTop: 2 }}>
                Temporarily Suspended
              </Text>
              <Text style={{ color: "#B45309", fontSize: 13, textAlign: "center", lineHeight: 19 }}>
                You've been temporarily suspended from this group. Your savings remain safe. Contact the group admin for more information.
              </Text>
            </View>
          ) : hasFullyWithdrawn ? (
            <View
              style={{
                backgroundColor: "#F0FDF4",
                borderWidth: 1,
                borderColor: "#86EFAC",
                borderRadius: 16,
                padding: 18,
                marginBottom: 20,
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons name="checkmark-circle" size={32} color="#16A34A" />
              <Text style={{ color: "#15803D", fontWeight: "900", fontSize: 16, textAlign: "center", marginTop: 2 }}>
                Tribe Completed — Savings Withdrawn
              </Text>
              <Text style={{ color: "#166534", fontSize: 13, textAlign: "center", lineHeight: 19 }}>
                You've fully withdrawn your savings from this tribe. Your funds have been credited to your Main Wallet.
              </Text>
            </View>
          ) : isTerminated ? (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FCA5A5",
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <Ionicons name="information-circle-outline" size={28} color="#EF4444" />
              <Text style={{ color: "#991B1B", fontWeight: "800", fontSize: 16, marginTop: 4, textAlign: "center" }}>
                Tribe Terminated
              </Text>
              <Text style={{ color: "#B91C1C", fontSize: 13, marginTop: 4, textAlign: "center", lineHeight: 18 }}>
                This tribe has been terminated by the creator. 100% of all members' saved contributions have been refunded directly into their Main Wallets.
              </Text>
            </View>
          ) : isMember ? (
            <View style={{ gap: 12, marginBottom: 20 }}>
              {/* Deposit funds (Disabled after group maturity or if ROTATIONAL positions are not set) */}
              {(() => {
                const isRotational = group?.groupType === "ROTATIONAL";
                const isPositionsPending = isRotational && !arePositionsSet;
                const isDepositDisabled = isGroupEnded || isPositionsPending;

                const depositButtonText = isGroupEnded
                  ? "Deposits Closed (Group Completed)"
                  : isPositionsPending
                  ? "Contributions open once admin sets payout order"
                  : "Deposit funds";

                return (
                  <View style={{ gap: 8 }}>
                    <TouchableOpacity
                      onPress={isDepositDisabled ? undefined : () => setIsDepositModalVisible(true)}
                      disabled={isDepositDisabled}
                      activeOpacity={isDepositDisabled ? 1 : 0.85}
                      style={{
                        backgroundColor: isDepositDisabled ? "#F3F4F6" : THEME,
                        height: 52,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 8,
                        borderWidth: isDepositDisabled ? 1 : 0,
                        borderColor: isDepositDisabled ? "#E5E7EB" : "transparent",
                      }}
                    >
                      {isDepositDisabled ? (
                        <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
                      ) : (
                        <Plus size={20} color="white" strokeWidth={2.5} />
                      )}
                      <Text style={{ color: isDepositDisabled ? "#9CA3AF" : "white", fontWeight: "800", fontSize: 14 }}>
                        {depositButtonText}
                      </Text>
                    </TouchableOpacity>

                    {isPositionsPending && (
                      <View
                        style={{
                          backgroundColor: "#FEF3C7",
                          borderColor: "#F59E0B",
                          borderWidth: 1,
                          borderRadius: 12,
                          padding: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Ionicons name="alert-circle" size={20} color="#B45309" />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, color: "#92400E", fontWeight: "700" }}>
                            Payout Order Pending
                          </Text>
                          <Text style={{ fontSize: 11, color: "#B45309", marginTop: 2, lineHeight: 15 }}>
                            Rotational payout schedule must be confirmed by the admin before member contributions can begin.
                          </Text>
                          {isAdmin && (
                            <TouchableOpacity
                              onPress={() =>
                                router.push(`/portfolio/detail/group/${id}/positions` as any)
                              }
                              style={{ marginTop: 6 }}
                            >
                              <Text style={{ fontSize: 12, fontWeight: "800", color: THEME, textDecorationLine: "underline" }}>
                                Set Payout Order Now →
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })()}

              {/* Withdraw funds (Active only if matured, or if emergency withdrawal is permitted) */}
              {(() => {
                const isEmergencyAllowed = !!group?.allowEmergencyWithdrawal;
                const canWithdraw = isGroupEnded || isEmergencyAllowed;

                const buttonText = isGroupEnded
                  ? "↗ Withdraw to Wallet"
                  : isEmergencyAllowed
                  ? "⚠ Emergency Withdrawal"
                  : "🔒 Withdrawals Locked (Available after maturity)";

                const handlePressWithdraw = () => {
                  if (!canWithdraw) {
                    setToast({
                      type: "warning",
                      title: "Withdrawals Locked",
                      message: `Funds in this tribe are locked until maturity (${formatDateDisplay(
                        group?.endDate
                      )}). Emergency withdrawal is not allowed for this group.`,
                    });
                    return;
                  }
                  handleWithdraw();
                };

                return (
                  <TouchableOpacity
                    onPress={handlePressWithdraw}
                    activeOpacity={canWithdraw ? 0.85 : 1}
                    style={{
                      backgroundColor: isGroupEnded
                        ? "#EEF7F8"
                        : isEmergencyAllowed
                        ? "#FEF3C7"
                        : "#F3F4F6",
                      height: 52,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 8,
                      borderWidth: isGroupEnded ? 1 : isEmergencyAllowed ? 1 : 0,
                      borderColor: isGroupEnded
                        ? "#155D5F"
                        : isEmergencyAllowed
                        ? "#F59E0B"
                        : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: isGroupEnded
                          ? "#155D5F"
                          : isEmergencyAllowed
                          ? "#B45309"
                          : "#9CA3AF",
                        fontWeight: "700",
                        fontSize: 14,
                      }}
                    >
                      {buttonText}
                    </Text>
                  </TouchableOpacity>
                );
              })()}
            </View>
          ) : !isMember && !isRemoved && !isBlacklisted ? (
            <View style={{ marginBottom: 20 }}>
              <ThemedButton
                title={
                  isGroupFull
                    ? `Group Full (${activeMembersCount}/${membersLimitNum})`
                    : isPublicGroup
                    ? "Join Group"
                    : isPendingJoin || joinRequested
                    ? "Request Sent"
                    : "Request to Join Group"
                }
                loading={isJoining || isProcessing}
                disabled={
                  isJoining ||
                  isProcessing ||
                  isGroupFull ||
                  (!isPublicGroup && (isPendingJoin || joinRequested))
                }
                onPress={handleJoinSubmit}
                style={{
                  backgroundColor:
                    isGroupFull || (!isPublicGroup && (isPendingJoin || joinRequested))
                      ? "#9CA3AF"
                      : THEME,
                  height: 52,
                  borderRadius: 14,
                  opacity:
                    isGroupFull || (!isPublicGroup && (isPendingJoin || joinRequested))
                      ? 0.7
                      : 1,
                }}
              />
            </View>
          ) : null}

          {/* ── Group Info Specs Card ────────────────────────────────── */}
          <View
            style={{
              backgroundColor: THEME_BG,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#D5EAE9",
              marginBottom: 20,
            }}
          >
            <SpecRow label="Group Name" value={groupName} />
            <SpecRow label="Category" value={group?.category || "General"} />
            <SpecRow
              label="Group Type"
              value={
                group?.groupType === "ROTATIONAL"
                  ? "Rotational Savings (Ajo/Esusu)"
                  : group?.groupType === "FIXED"
                  ? "Fixed Contribution Group"
                  : "Flex Contribution Group"
              }
            />
            <SpecRow label="Started by" value={formatDateDisplay(group?.startDate)} />
            <SpecRow label="Ends by" value={formatDateDisplay(group?.endDate)} />
            <SpecRow
              label={group?.groupType === "ROTATIONAL" ? "Cycle Pool Payout 🎯" : "Target Amount 🎯"}
              value={`₦${formatCurrency(targetNaira)}`}
            />
            {(group?.groupType === "FIXED" || group?.groupType === "ROTATIONAL") && fixedContribNaira > 0 ? (
              <SpecRow
                label="Member Cycle Contribution"
                value={`₦${formatCurrency(fixedContribNaira)}`}
              />
            ) : (
              <SpecRow
                label="Individual Savings Target"
                value={`₦${formatCurrency(
                  targetNaira / (group?.membersLimit || 10)
                )}`}
              />
            )}
            <SpecRow label="Wealth Group" value={`${group?.accessType || "Public"} Group`} />
            <SpecRow
              label="Members Capacity"
              value={membersLimitNum > 0 ? `${activeMembersCount} / ${membersLimitNum}` : `${activeMembersCount} (Unlimited)`}
            />
            <SpecRow
              label="Group Total Contribution"
              value={isTerminated ? "All savings refunded" : `₦${formatCurrency(currentNaira)}`}
            />
            <SpecRow
              label="My Contribution"
              value={
                isRemoved
                  ? "Refunded to Wallet"
                  : isBlacklisted
                  ? `₦${formatCurrency(userContributedNaira)}`
                  : hasFullyWithdrawn
                  ? "Withdrawn to Wallet"
                  : isTerminated
                  ? "Refunded to Wallet"
                  : `₦${formatCurrency(userContributedNaira)}`
              }
            />
            <SpecRow
              label="Late Payment Rule"
              value={
                group?.penaltySetting === "IMMEDIATE_5"
                  ? "Immediate (5%)"
                  : group?.penaltySetting === "GRACE_24"
                  ? "Grace period (24h)"
                  : "No Penalty"
              }
            />
            <SpecRow
              label="Early Exit Rule"
              value={
                !group?.allowEarlyExit
                  ? "Locked (No Exit)"
                  : group?.penaltySetting === "IMMEDIATE_5"
                  ? "Allowed (5% Penalty)"
                  : "Allowed (No Penalty)"
              }
            />
            <SpecRow
              label="Emergency Withdrawal"
              value={group?.allowEmergencyWithdrawal ? "Allowed" : "Not Allowed"}
            />
            <SpecRow
              label="Status"
              value={
                isRemoved
                  ? "Removed (Refunded)"
                  : isBlacklisted
                  ? "Suspended (Freeze)"
                  : isTerminated
                  ? "Terminated (Refunded)"
                  : (group?.status || "Active")
              }
              isLast
            />
          </View>
        </View>
      </ScrollView>

      {/* ─── OPTIONS MENU MODAL ────────────────────────────────────────── */}
      <Modal visible={isMenuVisible} transparent animationType="fade" onRequestClose={() => setIsMenuVisible(false)}>
        <View style={{ flex: 1 }}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsMenuVisible(false)}
          />
          <View
            style={{
              position: "absolute",
              top: 90,
              right: 20,
              width: 175,
              backgroundColor: "white",
              borderRadius: 16,
              paddingVertical: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 6,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <MenuItem
              title="Member List"
              onPress={() => {
                setIsMenuVisible(false);
                router.push(
                  `/portfolio/detail/group/${id}/tribe-settings/members-list` as any
                );
              }}
            />
            {isAdmin && (
              <MenuItem
                title="Tribe Settings"
                onPress={() => {
                  setIsMenuVisible(false);
                  router.push(`/portfolio/detail/group/${id}/tribe-settings` as any);
                }}
              />
            )}
            {group?.groupType === "ROTATIONAL" && isAdmin && (
              <MenuItem
                title="Payout Positions"
                onPress={() => {
                  setIsMenuVisible(false);
                  router.push(`/portfolio/detail/group/${id}/positions` as any);
                }}
              />
            )}
            {!isTerminated && (
              isCreator ? (
                <MenuItem
                  title="Terminate Group"
                  textColor="#EF4444"
                  onPress={handleTerminateGroup}
                />
              ) : (
                <MenuItem
                  title={!group?.allowEarlyExit ? "Exit Group (Locked)" : "Exit Group"}
                  textColor={!group?.allowEarlyExit ? "#94A3B8" : "#F59E0B"}
                  onPress={handleExitGroup}
                />
              )
            )}
            <MenuItem
              title="Report Group"
              textColor="#EF4444"
              isLast
              onPress={handleReportGroup}
            />
          </View>
        </View>
      </Modal>

      {/* ─── STEP 1: CLEAN AMOUNT MODAL ─────────────────────────────── */}
      <Modal visible={isDepositModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 12 }}>
                  <Text style={styles.modalTitle}>Deposit to Tribe: {groupName}</Text>
                  <TouchableOpacity onPress={() => {
                    Keyboard.dismiss();
                    setIsDepositModalVisible(false);
                    setDepositAmount("");
                  }}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 13,
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  Enter the amount you want to contribute from your wallet.
                </Text>

                {(() => {
                  const isFixedOrRotational = group?.groupType === "FIXED" || group?.groupType === "ROTATIONAL";
                  const numDeposit = parseFloat(depositAmount.replace(/,/g, "")) || 0;
                  const isExceeding = numDeposit > walletBalance;
                  const isValid = numDeposit > 0 && !isExceeding;
                  const formattedBal = walletBalance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");

                  return (
                    <>
                      {isFixedOrRotational && (
                        <View
                          style={{
                            width: "100%",
                            backgroundColor: "#F0F9F9",
                            borderColor: "#B2EBF2",
                            borderWidth: 1,
                            borderRadius: 12,
                            padding: 10,
                            marginBottom: 14,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Ionicons name="lock-closed" size={16} color={THEME} />
                          <Text style={{ fontSize: 12, color: "#155D5F", fontWeight: "600", flex: 1 }}>
                            Fixed Contribution Group: Deposit amount is fixed per cycle.
                          </Text>
                        </View>
                      )}

                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#4B5563" }}>Amount (₦)</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#6B7280" }}>
                          Wallet Balance: <Text style={{ fontWeight: "700", color: "#059669" }}>₦{formattedBal}</Text>
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: isFixedOrRotational ? "#EFEFEF" : "#F3F4F6",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          height: 56,
                          marginBottom: isExceeding ? 6 : 20,
                          width: "100%",
                          borderWidth: isExceeding ? 1.5 : 0,
                          borderColor: isExceeding ? "#EF4444" : "transparent",
                        }}
                      >
                        <TextInput
                          style={{ flex: 1, fontSize: 22, fontWeight: "700", textAlign: "center", color: isExceeding ? "#EF4444" : TEXT_DARK }}
                          placeholder="₦0.00"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          editable={!isFixedOrRotational}
                          returnKeyType="done"
                          inputAccessoryViewID={KEYBOARD_ACCESSORY_ID}
                          onSubmitEditing={() => Keyboard.dismiss()}
                          blurOnSubmit={true}
                          autoFocus={!isFixedOrRotational}
                          value={depositAmount ? `₦${depositAmount}` : ""}
                          onChangeText={(v) => {
                            if (isFixedOrRotational) return;
                            const n = v.replace(/\D/g, "");
                            setDepositAmount(n ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");
                          }}
                        />
                        {depositAmount.length > 0 && (
                          <TouchableOpacity
                            onPress={() => Keyboard.dismiss()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{
                              backgroundColor: isExceeding ? "#FEE2E2" : "#E2E8F0",
                              borderRadius: 999,
                              padding: 4,
                              marginLeft: 8,
                            }}
                          >
                            <Ionicons name={isExceeding ? "alert-circle" : "checkmark"} size={14} color={isExceeding ? "#EF4444" : "#0B575B"} />
                          </TouchableOpacity>
                        )}
                      </View>

                      {isExceeding && (
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 16 }}>
                          <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "600" }}>
                            Insufficient wallet balance
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setIsDepositModalVisible(false);
                              setDepositAmount("");
                              router.push("/wallet/deposit");
                            }}
                            style={{
                              backgroundColor: "#ECFDF5",
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: "#A7F3D0",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Ionicons name="wallet-outline" size={14} color="#059669" />
                            <Text style={{ color: "#059669", fontSize: 12, fontWeight: "700" }}>
                              Fund Wallet
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <ThemedButton
                        title="Continue"
                        disabled={!isValid || isNavigating}
                        loading={isNavigating}
                        onPress={() => {
                          if (!isValid || isNavigating) return;
                          Keyboard.dismiss();
                          setIsDepositModalVisible(false);
                          setShowConfirmDepositModal(true);
                        }}
                        style={{
                          backgroundColor: isValid && !isNavigating ? THEME : "#9CA3AF",
                          borderRadius: 14,
                          height: 52,
                          width: "100%",
                          opacity: isValid && !isNavigating ? 1 : 0.6,
                        }}
                      />
                    </>
                  );
                })()}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        <KeyboardDoneAccessory />
      </Modal>

      {/* Deposit Pre-PIN Confirmation Modal */}
      <ConfirmActionModal
        visible={showConfirmDepositModal}
        title="Confirm Tribe Deposit"
        onCancel={() => {
          setShowConfirmDepositModal(false);
          setIsDepositModalVisible(true);
        }}
        onConfirm={() => {
          const numDeposit = parseFloat(depositAmount.replace(/,/g, "")) || 0;
          const amtStr = numDeposit.toString();
          setShowConfirmDepositModal(false);
          setDepositAmount("");
          router.push({
            pathname: "/payment/insert-pin",
            params: {
              amount: amtStr,
              action: "GROUP_DEPOSIT",
              targetId: id as string,
              targetName: groupName,
              returnUrl: `/portfolio/detail/group/${id}`,
            },
          });
        }}
        summaryRows={[
          {
            label: "Amount",
            value: `₦${(parseFloat(depositAmount.replace(/,/g, "")) || 0).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          },
          { label: "Tribe Name", value: `${groupName} (WealthGroup)` },
          { label: "Funding Source", value: "Main Wallet" },
        ]}
      />

      {/* ─── JOIN MODAL ────────────────────────────────────────────────── */}
      <Modal visible={isJoinModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Join {groupName}</Text>
            <Text
              style={{
                color: "#64748B",
                fontSize: 13,
                textAlign: "center",
                marginVertical: 14,
                lineHeight: 20,
              }}
            >
              You are requesting to join this tribe savings circle. The group admin will review and approve your membership.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, width: "100%", marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setIsJoinModalVisible(false)}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E5E5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#64748B", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleJoinSubmit}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: THEME,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "700" }}>Confirm Join</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── JOIN REQUEST SENT MODAL ────────────────────────────────────── */}
      <Modal
        visible={showJoinRequestSentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinRequestSentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#E6F4F2",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="mail-unread-outline" size={32} color={THEME} />
            </View>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: TEXT_DARK,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Join Request Sent!
            </Text>

            <Text
              style={{
                color: "#64748B",
                fontSize: 13,
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 20,
              }}
            >
              Your request to join{" "}
              <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>{groupName}</Text> has been
              sent to the group admin. You will be notified once your membership is approved.
            </Text>

            <TouchableOpacity
              onPress={() => setShowJoinRequestSentModal(false)}
              style={{
                backgroundColor: THEME,
                width: "100%",
                height: 48,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── WITHDRAW MODAL ────────────────────────────────────────────── */}
      <Modal visible={isWithdrawModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isGroupEnded ? "Withdraw to Wallet" : "Emergency Withdrawal"}
            </Text>
            <Text
              style={{
                color: "#64748B",
                fontSize: 13,
                textAlign: "center",
                marginTop: 6,
                marginBottom: 16,
              }}
            >
              Your total savings in this tribe:{" "}
              <Text style={{ fontWeight: "700", color: THEME }}>
                ₦{formatCurrency(userContributedNaira)}
              </Text>
            </Text>

            {/* Withdraw Amount Input with Real-time Savings Validation */}
            {(() => {
              const numWithdraw = parseFloat(withdrawAmount.replace(/,/g, "")) || 0;
              const isExceedingSavings = userContributedNaira > 0 && numWithdraw > userContributedNaira;
              const hasNoSavings = userContributedNaira <= 0;
              const isInvalid = numWithdraw <= 0 || isExceedingSavings || hasNoSavings;

              return (
                <>
                  <View style={{ width: "100%", marginBottom: isExceedingSavings ? 10 : 14 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B" }}>
                        Amount (₦)
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748B" }}>
                          Savings:{" "}
                          <Text style={{ fontWeight: "800", color: THEME }}>
                            ₦{formatCurrency(userContributedNaira)}
                          </Text>
                        </Text>
                        {userContributedNaira > 0 && (
                          <TouchableOpacity
                            onPress={() => {
                              const rounded = Math.floor(userContributedNaira);
                              setWithdrawAmount(rounded.toLocaleString("en-US"));
                            }}
                            style={{
                              backgroundColor: "#E6F4F2",
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: "800", color: THEME }}>
                              Max
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          fontSize: 22,
                          fontWeight: "700",
                          textAlign: "center",
                          height: 56,
                          borderColor: isExceedingSavings ? "#EF4444" : "#E5E7EB",
                          borderWidth: isExceedingSavings ? 1.5 : 1,
                          backgroundColor: isExceedingSavings ? "#FEF2F2" : "#F9FAFB",
                          color: isExceedingSavings ? "#DC2626" : "#1A1A1A",
                        },
                      ]}
                      placeholder="₦0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      autoFocus
                      value={withdrawAmount ? `₦${withdrawAmount}` : ""}
                      onChangeText={(v) => {
                        const n = v.replace(/\D/g, "");
                        setWithdrawAmount(n ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");
                      }}
                    />

                    {isExceedingSavings && (
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 }}>
                        <Ionicons name="alert-circle" size={16} color="#DC2626" />
                        <Text style={{ fontSize: 12, color: "#DC2626", fontWeight: "600" }}>
                          Amount exceeds your total savings of ₦{formatCurrency(userContributedNaira)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={{
                      width: "100%",
                      backgroundColor: isGroupEnded ? "#F0F9F9" : "#FEF3C7",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: isGroupEnded ? "#155D5F" : "#B45309",
                        textAlign: "center",
                        lineHeight: 17,
                      }}
                    >
                      {isGroupEnded
                        ? "Funds will be disbursed from your tribe balance directly into your Main Wallet upon PIN confirmation."
                        : (group as any)?.penaltySetting === "IMMEDIATE_5"
                        ? "⚠️ This is an Emergency Withdrawal before group maturity. A 5% penalty will be deducted from your savings. The remaining balance will be sent to your Main Wallet upon PIN confirmation."
                        : (group as any)?.penaltySetting === "NONE"
                        ? "⚠️ This is an Emergency Withdrawal before group maturity. No penalty applies — funds will be disbursed directly into your Main Wallet upon PIN confirmation."
                        : "⚠️ This is an Emergency Withdrawal before group maturity. Funds will be disbursed directly into your Main Wallet upon PIN confirmation."}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      if (isInvalid) return;
                      Keyboard.dismiss();
                      setIsWithdrawModalVisible(false);
                      setShowConfirmWithdrawModal(true);
                    }}
                    disabled={isInvalid}
                    style={{
                      backgroundColor: isInvalid ? "#CBD5E1" : THEME,
                      width: "100%",
                      height: 52,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
                      Continue
                    </Text>
                  </TouchableOpacity>
                </>
              );
            })()}

            <TouchableOpacity
              onPress={() => {
                setIsWithdrawModalVisible(false);
                setWithdrawAmount("");
              }}
              style={{ marginTop: 14 }}
            >
              <Text style={{ color: "#64748B", fontWeight: "600", fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Withdraw Pre-PIN Confirmation Modal */}
      <ConfirmActionModal
        visible={showConfirmWithdrawModal}
        title={isGroupEnded ? "Confirm Withdrawal" : "Confirm Emergency Withdrawal"}
        onCancel={() => {
          setShowConfirmWithdrawModal(false);
          setIsWithdrawModalVisible(true);
        }}
        onConfirm={() => {
          const num = parseFloat(withdrawAmount.replace(/,/g, "")) || 0;
          const amtStr = num.toString();
          setShowConfirmWithdrawModal(false);
          setWithdrawAmount("");
          router.push({
            pathname: "/payment/insert-pin",
            params: {
              amount: amtStr,
              action: "GROUP_WITHDRAW",
              targetId: id as string,
              targetName: groupName,
              returnUrl: `/portfolio/detail/group/${id}`,
            },
          });
        }}
        summaryRows={[
          {
            label: "Amount",
            value: `₦${(parseFloat(withdrawAmount.replace(/,/g, "")) || 0).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          },
          { label: "From Tribe", value: `${groupName} (WealthGroup)` },
          { label: "Destination", value: "Main Wallet" },
        ]}
      />


      {/* ─── JOIN REQUEST SENT MODAL ───────────────────────────────────── */}
      <Modal
        visible={showJoinRequestSentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinRequestSentModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 28,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 28,
              width: "100%",
              maxWidth: 380,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 10,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#F0FDF4",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#1A1A1A",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Request Sent! 🎉
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 14,
                color: "#64748B",
                textAlign: "center",
                lineHeight: 21,
                marginBottom: 24,
                paddingHorizontal: 4,
              }}
            >
              Your request to join{" "}
              <Text style={{ fontWeight: "700", color: "#155D5F" }}>{groupName}</Text>{" "}
              has been sent successfully.{"\n\n"}Please wait for the admin to review and accept your request.
            </Text>

            {/* Done button */}
            <TouchableOpacity
              onPress={() => setShowJoinRequestSentModal(false)}
              style={{
                width: "100%",
                height: 52,
                borderRadius: 14,
                backgroundColor: THEME,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "800", fontSize: 15 }}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── REPORT GROUP MODAL ────────────────────────────────────────── */}
      <Modal visible={isReportModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Report Group</Text>
            <Text
              style={{
                color: "#64748B",
                fontSize: 13,
                textAlign: "center",
                marginTop: 6,
                marginBottom: 16,
                lineHeight: 18,
              }}
            >
              Please describe the reason for reporting this group. Our moderation team will investigate.
            </Text>

            <TextInput
              style={[
                styles.textInput,
                {
                  height: 100,
                  textAlignVertical: "top",
                  paddingTop: 12,
                  marginBottom: 20,
                  fontSize: 14,
                },
              ]}
              multiline
              numberOfLines={4}
              placeholder="Describe the issue or reason..."
              placeholderTextColor="#9CA3AF"
              value={reportReason}
              onChangeText={setReportReason}
            />

            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => {
                  setIsReportModalVisible(false);
                  setReportReason("");
                }}
                disabled={isReporting}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E5E5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#64748B", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitReport}
                disabled={isReporting}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "#EF4444",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isReporting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "700" }}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* ─── EXIT TRIBE MODAL ─────────────────────────────────────────── */}
      <Modal visible={isExitModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalCard}>
                <Image
                  source={require("../../../../assets/images/terminate.png")}
                  style={{ width: 80, height: 80, marginBottom: 12 }}
                  resizeMode="contain"
                />
                {/* Exit Locked or Exit Confirmation */}
                {(() => {
                  const isExitLocked = !group?.allowEarlyExit;

                  return (
                    <>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "900",
                          color: "#1A1A1A",
                          textAlign: "center",
                          marginBottom: 8,
                        }}
                      >
                        {isExitLocked ? "Early Exit is Locked" : "Exit Tribe?"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                          textAlign: "center",
                          marginBottom: 14,
                          lineHeight: 18,
                        }}
                      >
                        {isExitLocked ? (
                          <>
                            The admin has configured voluntary withdrawals as{" "}
                            <Text style={{ fontWeight: "700", color: "#DC2626" }}>
                              Locked (No Exit)
                            </Text>{" "}
                            for{" "}
                            <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
                              {groupName}
                            </Text>
                            . Members cannot exit early before the group matures.
                          </>
                        ) : (group as any)?.penaltySetting === "IMMEDIATE_5" ? (
                          <>
                            Are you sure you want to leave{" "}
                            <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
                              {groupName}
                            </Text>
                            ? A <Text style={{ fontWeight: "700", color: "#D97706" }}>5% penalty</Text> will be deducted from your accumulated savings before your refund is credited to your Main Wallet.
                          </>
                        ) : (
                          <>
                            Are you sure you want to leave{" "}
                            <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
                              {groupName}
                            </Text>
                            ? Your accumulated savings will be refunded directly into your Main Wallet immediately.
                          </>
                        )}
                      </Text>

                      {/* Savings & Early Exit Breakdown or Locked Card */}
                      {isExitLocked ? (
                        <View
                          style={{
                            width: "100%",
                            backgroundColor: "#FEF2F2",
                            borderColor: "#FECACA",
                            borderWidth: 1,
                            borderRadius: 16,
                            padding: 14,
                            marginBottom: 16,
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                            <Ionicons
                              name="lock-closed"
                              size={18}
                              color="#DC2626"
                              style={{ marginRight: 6 }}
                            />
                            <Text style={{ fontSize: 13, fontWeight: "800", color: "#991B1B" }}>
                              Locked (No Exit Permitted)
                            </Text>
                          </View>

                          <Text style={{ fontSize: 12, color: "#7F1D1D", marginBottom: 12, lineHeight: 16 }}>
                            This tribe operates on a strict No Withdrawal policy. Your contributions remain securely locked and will be disbursed at the end of the group savings period.
                          </Text>

                          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                            <Text style={{ fontSize: 12, color: "#6B7280" }}>Your Total Savings</Text>
                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1A1A" }}>
                              ₦{formatCurrency(userContributedNaira)}
                            </Text>
                          </View>

                          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: group?.allowEmergencyWithdrawal ? 8 : 0 }}>
                            <Text style={{ fontSize: 12, color: "#6B7280" }}>Group Maturity Date</Text>
                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1A1A" }}>
                              {formatDateDisplay(group?.endDate)}
                            </Text>
                          </View>

                          {group?.allowEmergencyWithdrawal && (
                            <>
                              <View style={{ height: 1, backgroundColor: "#FECACA", marginVertical: 8 }} />
                              <Text style={{ fontSize: 11, color: "#991B1B", lineHeight: 15 }}>
                                💡 Emergency Withdrawal is enabled for this tribe. If you have an urgent emergency, you may request an emergency withdrawal.
                              </Text>
                            </>
                          )}
                        </View>
                      ) : (
                        (() => {
                          const hasSavings = userContributedNaira > 0;

                          // Penalty is governed solely by penaltySetting — IMMEDIATE_5 = fixed 5%, anything else = 0%
                          const hasPenalty = group?.penaltySetting === "IMMEDIATE_5";
                          const penaltyRatio = hasPenalty ? 0.05 : 0;
                          const penaltyPctStr = hasPenalty ? "5%" : "0%";
                          const penaltyAmt = userContributedNaira * penaltyRatio;
                          const estimatedRefund = Math.max(0, userContributedNaira - penaltyAmt);

                          return hasSavings ? (
                            <View
                              style={{
                                width: "100%",
                                backgroundColor: hasPenalty ? "#FEF2F2" : "#F0FDF4",
                                borderColor: hasPenalty ? "#FECACA" : "#BBF7D0",
                                borderWidth: 1,
                                borderRadius: 16,
                                padding: 14,
                                marginBottom: 16,
                              }}
                            >
                              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                                <Ionicons
                                  name={hasPenalty ? "alert-circle" : "checkmark-circle"}
                                  size={18}
                                  color={hasPenalty ? "#DC2626" : "#15803D"}
                                  style={{ marginRight: 6 }}
                                />
                                <Text style={{ fontSize: 13, fontWeight: "800", color: hasPenalty ? "#991B1B" : "#166534" }}>
                                  {hasPenalty ? "Early Exit Deduction" : "Full Refund (No Penalty)"}
                                </Text>
                              </View>

                              <Text style={{ fontSize: 12, color: hasPenalty ? "#7F1D1D" : "#15803D", marginBottom: 12, lineHeight: 16 }}>
                                {hasPenalty
                                  ? `Leaving early incurs a ${penaltyPctStr} penalty, deducted from your accumulated savings.`
                                  : "This tribe has no early exit penalty. Your full accumulated contributions will be refunded directly into your Main Wallet."}
                              </Text>

                              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                                <Text style={{ fontSize: 12, color: "#6B7280" }}>Your Total Savings</Text>
                                <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1A1A" }}>
                                  ₦{formatCurrency(userContributedNaira)}
                                </Text>
                              </View>

                              {hasPenalty && (
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                  <Text style={{ fontSize: 12, color: "#DC2626", fontWeight: "700" }}>
                                    Penalty Fee ({penaltyPctStr})
                                  </Text>
                                  <Text style={{ fontSize: 12, fontWeight: "800", color: "#DC2626" }}>
                                    -₦{formatCurrency(penaltyAmt)}
                                  </Text>
                                </View>
                              )}

                              <View style={{ height: 1, backgroundColor: hasPenalty ? "#FECACA" : "#DCFCE7", marginBottom: 8 }} />

                              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ fontSize: 13, fontWeight: "800", color: "#155D5F" }}>
                                  Estimated Refund to Wallet
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: "900", color: "#155D5F" }}>
                                  ₦{formatCurrency(estimatedRefund)}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <View
                              style={{
                                width: "100%",
                                backgroundColor: "#F0FDF4",
                                borderColor: "#BBF7D0",
                                borderWidth: 1,
                                borderRadius: 14,
                                padding: 12,
                                marginBottom: 16,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                              <Text
                                style={{
                                  flex: 1,
                                  fontSize: 13,
                                  color: "#166534",
                                  fontWeight: "600",
                                  lineHeight: 18,
                                }}
                              >
                                Your full accumulated savings will be refunded directly into your Main Wallet immediately.
                              </Text>
                            </View>
                          );
                        })()
                      )}

                      {/* Modal Buttons */}
                      {isExitLocked ? (
                        <TouchableOpacity
                          onPress={() => setIsExitModalVisible(false)}
                          style={{
                            width: "100%",
                            height: 50,
                            borderRadius: 14,
                            backgroundColor: "#155D5F",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontSize: 14, color: "white", fontWeight: "700" }}>
                            Understood
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                          <TouchableOpacity
                            onPress={() => setIsExitModalVisible(false)}
                            disabled={isExiting}
                            style={{
                              flex: 1,
                              height: 50,
                              borderRadius: 14,
                              borderWidth: 1,
                              borderColor: "#E5E5E5",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "600" }}>Cancel</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={handleConfirmExitGroup}
                            disabled={isExiting}
                            style={{
                              flex: 1,
                              height: 50,
                              borderRadius: 14,
                              backgroundColor: "#FEE2E2",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {isExiting ? (
                              <ActivityIndicator color="#EF4444" size="small" />
                            ) : (
                              <Text style={{ fontSize: 14, color: "#E53935", fontWeight: "700" }}>
                                Exit Tribe
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ─── TERMINATE GROUP MODAL ──────────────────────────────────────── */}
      <Modal visible={isTerminateModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalCard}>
                <Image
                  source={require("../../../../assets/images/terminate.png")}
                  style={{ width: 80, height: 80, marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: "#1A1A1A",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Terminate Group?
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    textAlign: "center",
                    marginBottom: 14,
                    lineHeight: 18,
                  }}
                >
                  Are you sure you want to terminate{" "}
                  <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>{groupName}</Text>?
                  Dissolving this group will automatically refund 100% of all active members' saved contributions directly back into their respective Main Wallets immediately.
                </Text>

                <View
                  style={{
                    width: "100%",
                    backgroundColor: "#FEF2F2",
                    borderColor: "#FECACA",
                    borderWidth: 1,
                    borderRadius: 14,
                    padding: 12,
                    marginBottom: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: "#991B1B",
                      fontWeight: "600",
                      lineHeight: 18,
                    }}
                  >
                    All active contributions (₦{formatCurrency(currentNaira)}) will be refunded immediately. This action cannot be undone.
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                  <TouchableOpacity
                    onPress={() => setIsTerminateModalVisible(false)}
                    disabled={isTerminating}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "#E5E5E5",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "600" }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirmTerminateGroup}
                    disabled={isTerminating}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 14,
                      backgroundColor: "#FEE2E2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isTerminating ? (
                      <ActivityIndicator color="#EF4444" size="small" />
                    ) : (
                      <Text style={{ fontSize: 14, color: "#E53935", fontWeight: "700" }}>
                        Terminate Group
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <AppToast toast={toast} onDismiss={() => setToast(null)} />
    </SafeAreaView>
  );
}

// ── Components ──────────────────────────────────────────────────────────
function SpecRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 9,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#E0F2F1",
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "500", color: "#64748B" }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: THEME }}>{value}</Text>
    </View>
  );
}

function MenuItem({
  title,
  textColor = "#1A1A1A",
  isLast = false,
  onPress,
}: {
  title: string;
  textColor?: string;
  isLast?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: textColor }}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
    flex: 1,
    marginRight: 8,
  },
  textInput: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: TEXT_DARK,
  },
});
