import Header from "@/src/components/common/Header";
import {
  useGetMyReferralRewardsQuery,
  useGetMyReferralsQuery,
  useGetMyReferralSummaryQuery,
  RefereeItem,
  ReferralRewardItem,
} from "@/src/store/api/referralApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tab = "referrals" | "rewards";

const formatKobo = (kobo?: string | number) => {
  if (!kobo) return "₦0.00";
  const naira = parseFloat(kobo.toString()) / 100;
  return `₦${naira.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getStatusColor = (status?: string) => {
  if (status === "PAID") return { bg: "#DCFCE7", text: "#16A34A" };
  if (status === "CANCELLED") return { bg: "#FEE2E2", text: "#DC2626" };
  return { bg: "#FEF9C3", text: "#B45309" }; // PENDING
};

const getInitials = (item: RefereeItem) => {
  const referee = item.referee;
  const first =
    referee?.firstName?.[0] ||
    item.firstName?.[0] ||
    item.name?.[0] ||
    referee?.email?.[0] ||
    item.email?.[0] ||
    "?";
  const last = referee?.lastName?.[0] || item.lastName?.[0] || "";
  return `${first}${last}`.toUpperCase();
};

export default function MyReferralsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("referrals");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: summaryResp,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useGetMyReferralSummaryQuery(undefined, { refetchOnMountOrArgChange: true });

  const {
    data: referralsResp,
    isLoading: referralsLoading,
    refetch: refetchReferrals,
  } = useGetMyReferralsQuery({ limit: 50 }, { refetchOnMountOrArgChange: true });

  const {
    data: rewardsResp,
    isLoading: rewardsLoading,
    refetch: refetchRewards,
  } = useGetMyReferralRewardsQuery({ limit: 50 }, { refetchOnMountOrArgChange: true });

  const summary = summaryResp?.data as any;
  const referralsRaw = referralsResp?.data as any;
  const rewardsRaw = rewardsResp?.data as any;

  const referrals: RefereeItem[] = referralsRaw?.items || referralsRaw || [];
  const rewards: ReferralRewardItem[] = rewardsRaw?.items || rewardsRaw || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchReferrals(), refetchRewards()]);
    setRefreshing(false);
  };

  const isLoading = summaryLoading || referralsLoading || rewardsLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <Header title="My Referrals" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#155D5F" />
        }
      >
        {/* ─── Summary Card ─── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: "#155D5F",
              borderRadius: 24,
              padding: 24,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Decorative circle */}
            <View
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: "#FFFFFF15",
                top: -30,
                right: -30,
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: "#FFFFFF10",
                bottom: -20,
                left: 100,
              }}
            />

            {/* Left stat */}
            <View>
              <Text
                style={{
                  color: "#FFFFFF99",
                  fontSize: 12,
                  fontWeight: "500",
                  marginBottom: 6,
                }}
              >
                Total Referrals
              </Text>
              {summaryLoading ? (
                <ActivityIndicator color="#FFCF65" />
              ) : (
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 36,
                    fontWeight: "800",
                  }}
                >
                  {summary?.totalReferrals ?? 0}
                </Text>
              )}
              <Text
                style={{ color: "#FFFFFF80", fontSize: 11, marginTop: 4 }}
              >
                People you invited
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                width: 1,
                height: 60,
                backgroundColor: "#FFFFFF30",
              }}
            />

            {/* Right stat */}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: "#FFFFFF99",
                  fontSize: 12,
                  fontWeight: "500",
                  marginBottom: 6,
                }}
              >
                Total Earned
              </Text>
              {summaryLoading ? (
                <ActivityIndicator color="#FFCF65" />
              ) : (
                <Text
                  style={{
                    color: "#FFCF65",
                    fontSize: 24,
                    fontWeight: "800",
                  }}
                >
                  {formatKobo(summary?.totalEarnedKobo)}
                </Text>
              )}
              <Text
                style={{ color: "#FFFFFF80", fontSize: 11, marginTop: 4 }}
              >
                Rewards paid out
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Tabs ─── */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
          }}
        >
          {(["referrals", "rewards"] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor:
                  activeTab === tab ? "#155D5F" : "transparent",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 13,
                  color: activeTab === tab ? "#FFFFFF" : "#6B7280",
                  textTransform: "capitalize",
                }}
              >
                {tab === "referrals"
                  ? `People Referred (${referrals.length})`
                  : `Rewards (${rewards.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Tab Content ─── */}
        <View style={{ paddingHorizontal: 20 }}>
          {isLoading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 60,
              }}
            >
              <ActivityIndicator size="large" color="#155D5F" />
              <Text
                style={{
                  color: "#9CA3AF",
                  marginTop: 12,
                  fontSize: 13,
                }}
              >
                Loading your referrals...
              </Text>
            </View>
          ) : activeTab === "referrals" ? (
            referrals.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No referrals yet"
                subtitle="Share your invite link and start earning rewards when friends join and transact!"
              />
            ) : (
              referrals.map((item) => (
                <RefereeCard key={item.id} item={item} />
              ))
            )
          ) : rewards.length === 0 ? (
            <EmptyState
              icon="gift-outline"
              title="No rewards yet"
              subtitle="Rewards are earned when your referrals complete their first transaction."
            />
          ) : (
            rewards.map((item) => (
              <RewardCard key={item.id} item={item} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Referee Card ─── */
function RefereeCard({ item }: { item: RefereeItem }) {
  const [imageError, setImageError] = useState(false);
  const statusStyle = getStatusColor(item.status);
  const initials = getInitials(item);
  const referee = item.referee;
  const displayName =
    [referee?.firstName, referee?.lastName].filter(Boolean).join(" ") ||
    referee?.email ||
    item.name ||
    [item.firstName, item.lastName].filter(Boolean).join(" ") ||
    item.email ||
    "Anonymous";

  const avatarUrl = referee?.imageUrl || item.imageUrl;
  const totalRewards = item.totalRewardsEarnedKobo ?? item.totalRewards;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#F3F4F6",
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#155D5F20",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          overflow: "hidden",
        }}
      >
        {avatarUrl && !imageError ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Text
            style={{ color: "#155D5F", fontWeight: "800", fontSize: 15 }}
          >
            {initials}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontWeight: "700", fontSize: 14, color: "#1A1A1A" }}
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
          Invited{" "}
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </Text>
      </View>

      {/* Right side: status + reward */}
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View
          style={{
            backgroundColor: statusStyle.bg,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: statusStyle.text,
              fontSize: 10,
              fontWeight: "700",
            }}
          >
            {item.status || "PENDING"}
          </Text>
        </View>
        {totalRewards && parseFloat(totalRewards.toString()) > 0 ? (
          <Text
            style={{ fontSize: 12, fontWeight: "700", color: "#155D5F" }}
          >
            {formatKobo(totalRewards)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ─── Reward Card ─── */
function RewardCard({ item }: { item: ReferralRewardItem }) {
  const statusStyle = getStatusColor(item.status);
  const amount = item.amountKobo || item.amount;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#F3F4F6",
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#FFCF6520",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name="gift-outline" size={20} color="#D48E00" />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontWeight: "700", fontSize: 14, color: "#1A1A1A" }}
          numberOfLines={1}
        >
          {item.refereeName || item.description || "Referral Reward"}
        </Text>
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </Text>
      </View>

      {/* Amount + status */}
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <Text
          style={{ fontSize: 14, fontWeight: "800", color: "#155D5F" }}
        >
          {formatKobo(amount)}
        </Text>
        <View
          style={{
            backgroundColor: statusStyle.bg,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: statusStyle.text,
              fontSize: 10,
              fontWeight: "700",
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ─── Empty State ─── */
function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "#EEF7F8",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={32} color="#155D5F" />
      </View>
      <Text
        style={{
          fontWeight: "800",
          fontSize: 16,
          color: "#1A1A1A",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: "#6B7280",
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
