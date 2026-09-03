import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import {
  useContributeToGroupMutation,
  useGetGroupDetailsQuery,
  useGetGroupMembersQuery,
  useJoinGroupMutation,
  useToggleGroupMuteMutation,
} from "@/src/store/api/groupApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { useListNotificationsQuery } from "@/src/store/api/notificationApi";
import { RootState } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
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
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

  // Deposit Form state
  const [depositAmount, setDepositAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [joinRequested, setJoinRequested] = useState(false);

  // Queries & Mutations
  const {
    data: group,
    isLoading: loading,
    refetch,
  } = useGetGroupDetailsQuery(id as string, {
    skip: !id || id === "new",
  });

  const { data: membersData, refetch: refetchMembers } = useGetGroupMembersQuery(
    { id: id as string, populate: ["user"] },
    { skip: !id || id === "new" }
  );

  const { data: notificationsData } = useListNotificationsQuery(
    { limit: 50 },
    {
      pollingInterval: 10000,
      refetchOnFocus: true,
    }
  );

  const [joinGroup] = useJoinGroupMutation();
  const [contributeToGroup] = useContributeToGroupMutation();
  const [toggleGroupMute] = useToggleGroupMuteMutation();
  const [verifyPin] = useVerifyPinMutation();

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

  const rawSavings = group?.totalSavings ?? group?.currentBalance ?? 0;
  const savingsNum = typeof rawSavings === "string" ? parseFloat(rawSavings) : Number(rawSavings);
  const membersTotal = membersData?.items?.reduce(
    (sum, m) => sum + (parseFloat(m.totalContributed?.toString() || "0") || 0),
    0
  ) || 0;
  const effectiveKobo = (savingsNum > 0 ? savingsNum : membersTotal) || 0;
  const currentNaira = effectiveKobo / 100;

  // Membership & Creator detection
  const isCreator =
    (currentUser?.id && group?.creatorId === currentUser.id) ||
    membersData?.items?.some(
      (m) => m.userId === currentUser?.id && (m.role === "OWNER" || m.role === "CREATOR")
    );

  const isPendingJoin =
    joinRequested ||
    membersData?.items?.some(
      (m) =>
        m.userId === currentUser?.id &&
        (m.status === "PENDING" || (m.status as string) === "Pending")
    ) ||
    (group as any)?.userStatus === "PENDING" ||
    (group as any)?.memberStatus === "PENDING";

  const isMember =
    !isPendingJoin &&
    (isCreator ||
      (group?.isMember &&
        (group as any)?.memberStatus !== "PENDING" &&
        (group as any)?.userStatus !== "PENDING") ||
      membersData?.items?.some(
        (m) =>
          m.userId === currentUser?.id &&
          (m.status === "ACTIVE" || m.status === "PAID" || m.status === "UNPAID") &&
          m.status !== "PENDING"
      ));

  const isAdmin =
    isCreator ||
    group?.isAdmin ||
    membersData?.items?.some(
      (m) => m.userId === currentUser?.id && (m.role === "OWNER" || m.role === "ADMIN")
    );

  // Calculations
  const progress = targetNaira > 0 ? (currentNaira / targetNaira) * 100 : 0;
  const progressPct = Math.min(Math.max(Math.round(progress), 0), 100);

  const getTimelineLeft = () => {
    if (!group?.endDate) return "Flexible";
    const end = new Date(group.endDate).getTime();
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
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ── Actions ──────────────────────────────────────────────────────────
  const handleInvite = async () => {
    setIsMenuVisible(false);
    try {
      await Share.share({
        message: `Join my Wealth Tribe "${groupName}" on Wealthconomy! 🚀\n\nTarget: ₦${formatCurrency(
          targetNaira
        )}\n\nJoin here: wealthconomy://group/join/${id}`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleJoinSubmit = async () => {
    setIsProcessing(true);
    try {
      console.log(`👥 [WealthGroup Join Request] POST /api/v1/groups/${id}/join`);
      await joinGroup(id as string).unwrap();
      setJoinRequested(true);
      Alert.alert(
        "Request Sent",
        "Your request to join this group has been sent to the group admin for approval."
      );
      setIsJoinModalVisible(false);
      refetch();
      refetchMembers();
    } catch (err: any) {
      console.error("❌ [WealthGroup Join Error]:", err);
      const msg = err?.data?.message || err?.message || "Failed to join group.";
      if (msg.toLowerCase().includes("already")) {
        setJoinRequested(true);
      }
      Alert.alert("Notice", msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMuteToggle = async () => {
    setIsMenuVisible(false);
    try {
      await toggleGroupMute({ id: id as string, isMuted: true }).unwrap();
      Alert.alert("Notifications Muted", "Group notifications have been muted.");
    } catch (err: any) {
      Alert.alert("Notice", "Group notification preferences updated.");
    }
  };

  const handleReportGroup = () => {
    setIsMenuVisible(false);
    router.push("/support/chat" as any);
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

        {isMember ? (
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

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-4 pb-16">
          {/* ── Sub-header: Group Details + Notification Bell ────────── */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[20px] font-black text-[#1A1A1A]">Group Details</Text>
            {isMember && (
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
            {group?.coverImage ? (
              <Image
                source={{ uri: group.coverImage }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: THEME_BG, alignItems: "center", justifyContent: "center" }}>
                <Users size={64} color={THEME} />
              </View>
            )}
          </View>

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
                    ••••••••
                  </Text>
                )}
              </View>

              <View className="flex-row items-center space-x-1">
                <Text className="text-[#4B5563] text-[13px] font-extrabold">
                  Group wealth grew by ₦{group?.dailyWealthGrowth ? (parseFloat(group.dailyWealthGrowth.toString()) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} today
                </Text>
                <Text className="text-[#4CAF50] text-[15px] font-bold"> ↑</Text>
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

          {/* ── Action Buttons for Members (Deposit / Withdraw) ─────── */}
          {isMember ? (
            <View style={{ gap: 12, marginBottom: 20 }}>
              {/* Deposit funds (Works like Top Up) */}
              <TouchableOpacity
                onPress={() => setIsDepositModalVisible(true)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: THEME,
                  height: 52,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Plus size={20} color="white" strokeWidth={2.5} />
                <Text style={{ color: "white", fontWeight: "800", fontSize: 15 }}>
                  Deposit funds
                </Text>
              </TouchableOpacity>

              {/* Withdraw funds (Inactive until maturity) */}
              <TouchableOpacity
                disabled={true}
                activeOpacity={0.9}
                style={{
                  backgroundColor: "#F3F4F6",
                  height: 52,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Text style={{ color: "#9CA3AF", fontWeight: "700", fontSize: 15 }}>
                  ↗ Withdraw funds
                </Text>
              </TouchableOpacity>
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
            <SpecRow label="Category" value={group?.category || "Business"} />
            <SpecRow label="Started by" value={formatDateDisplay(group?.startDate)} />
            <SpecRow label="Ends by" value={formatDateDisplay(group?.endDate)} />
            <SpecRow label="Target 🎯" value={`₦${formatCurrency(targetNaira)}`} />
            <SpecRow label="Wealth Group" value={`${group?.accessType || "Public"} Group`} />
            <SpecRow label="Daily Wealth Growth" value="20%" />
            <SpecRow
              label="Individual Savings"
              value={`₦${formatCurrency(
                (targetNaira / (group?.membersLimit || 10))
              )}`}
            />
            <SpecRow label="Each Wealth Growth" value="15%" />
            <SpecRow label="Contribution Frequency" value={group?.frequency || "Monthly"} />
            <SpecRow
              label="Tribe Members"
              value={`${membersData?.items?.length || group?.activeMembersCount || 1} members`}
              isLast
            />
          </View>

          {/* ── Bottom CTA ───────────────────────────────────────────── */}
          {isMember ? (
            /* Invite Members Button */
            <TouchableOpacity
              onPress={handleInvite}
              activeOpacity={0.85}
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                height: 52,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Share2 size={18} color="#64748B" />
              <Text style={{ color: "#64748B", fontWeight: "700", fontSize: 14 }}>
                Invite Members
              </Text>
            </TouchableOpacity>
          ) : (
            /* Join Group Button for Non-Members / Pending Users */
            <TouchableOpacity
              onPress={() => (isPendingJoin ? null : setIsJoinModalVisible(true))}
              disabled={isPendingJoin || isProcessing}
              activeOpacity={0.85}
              style={{
                backgroundColor: isPendingJoin ? "#E2E8F0" : THEME,
                height: 54,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: isPendingJoin ? "#64748B" : "white",
                  fontWeight: "800",
                  fontSize: 16,
                }}
              >
                {isPendingJoin ? "Request Pending Approval" : "Join Group"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ─── 3-DOT MENU MODAL / POPUP ──────────────────────────────────── */}
      <Modal visible={isMenuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 85 : 55,
              right: 18,
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
            <MenuItem
              title="Report Group"
              textColor="#EF4444"
              isLast
              onPress={handleReportGroup}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ─── STEP 1: CLEAN AMOUNT MODAL ─────────────────────────────── */}
      <Modal visible={isDepositModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Deposit to Tribe</Text>
            <Text
              style={{
                color: "#64748B",
                fontSize: 13,
                textAlign: "center",
                marginTop: 6,
                marginBottom: 20,
              }}
            >
              Enter the amount you want to contribute from your wallet.
            </Text>

            {/* Clean Amount Input */}
            <View style={{ width: "100%", marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 8 }}>
                Amount (₦)
              </Text>
              <TextInput
                style={[styles.textInput, { fontSize: 22, fontWeight: "700", textAlign: "center", height: 56 }]}
                placeholder="₦0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                autoFocus
                value={depositAmount ? `₦${depositAmount}` : ""}
                onChangeText={(v) => {
                  const n = v.replace(/\D/g, "");
                  setDepositAmount(n ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");
                }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                const num = parseFloat(depositAmount.replace(/,/g, ""));
                if (!num || num <= 0) {
                  Alert.alert("Invalid Amount", "Please enter a valid deposit amount.");
                  return;
                }
                const amtStr = num.toString();
                setIsDepositModalVisible(false);
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
              style={{
                backgroundColor: THEME,
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

            <TouchableOpacity
              onPress={() => {
                setIsDepositModalVisible(false);
                setDepositAmount("");
              }}
              style={{ marginTop: 14 }}
            >
              <Text style={{ color: "#64748B", fontWeight: "600", fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── JOIN MODAL ────────────────────────────────────────────────── */}
      <Modal visible={isJoinModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_DARK,
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
