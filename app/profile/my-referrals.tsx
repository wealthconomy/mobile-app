import Header from "@/src/components/common/Header";
import {
  getReferralBadgeColor,
  getReferralStatusBadge,
  getReferralStatusSubtitle,
} from "@/src/constants/referralCopy";
import { SECONDARY_TEXT } from "@/src/constants/typography";
import { useReferralEnabled } from "@/src/hooks/useReferralEnabled";
import {
  useGetMyReferralSummaryQuery,
  useLazyGetMyReferralsQuery,
  useLazyGetMyReferralRewardsQuery,
  RefereeItem,
  ReferralRewardItem,
} from "@/src/store/api/referralApi";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
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

const getInitials = (item: RefereeItem) => {
  const referee = item.referee;
  const first =
    referee?.firstName?.[0] ||
    item.firstName?.[0] ||
    item.name?.[0] ||
    "F";
  const last = referee?.lastName?.[0] || item.lastName?.[0] || "";
  return `${first}${last}`.toUpperCase();
};

export default function MyReferralsScreen() {
  const isReferralEnabled = useReferralEnabled({ refreshOnFocus: true });
  const [activeTab, setActiveTab] = useState<Tab>("referrals");
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Summary query
  const {
    data: summaryResp,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useGetMyReferralSummaryQuery(undefined, { refetchOnMountOrArgChange: true });

  // Lazy query triggers for cursor pagination
  const [triggerGetReferrals] = useLazyGetMyReferralsQuery();
  const [triggerGetRewards] = useLazyGetMyReferralRewardsQuery();

  // Paginated state for People Referred
  const [referrals, setReferrals] = useState<RefereeItem[]>([]);
  const [referralsNextCursor, setReferralsNextCursor] = useState<string | null>(null);
  const [referralsHasNext, setReferralsHasNext] = useState<boolean>(false);
  const [isLoadingMoreReferrals, setIsLoadingMoreReferrals] = useState<boolean>(false);

  // Paginated state for Rewards
  const [rewards, setRewards] = useState<ReferralRewardItem[]>([]);
  const [rewardsNextCursor, setRewardsNextCursor] = useState<string | null>(null);
  const [rewardsHasNext, setRewardsHasNext] = useState<boolean>(false);
  const [isLoadingMoreRewards, setIsLoadingMoreRewards] = useState<boolean>(false);

  // Accumulated pending total from multi-page loop
  const [pendingTotalKobo, setPendingTotalKobo] = useState<number>(0);

  // Multi-page accumulator for ALL pending referrals (up to 10 pages of 50)
  const calculatePendingTotal = useCallback(async () => {
    try {
      let sum = 0;
      let cursor: string | undefined = undefined;
      let page = 0;
      let hasMore = true;

      while (hasMore && page < 10) {
        page++;
        const res = await triggerGetReferrals(
          {
            limit: 50,
            status: "PENDING",
            ...(cursor ? { after: cursor } : {}),
          },
          false
        ).unwrap();

        const data: any = res?.data;
        const items: RefereeItem[] = data?.items || (Array.isArray(data) ? data : []);

        for (const item of items) {
          const isPending = (item.status || "PENDING").toUpperCase() === "PENDING";
          const isValid = item.isValid !== false;
          if (isPending && isValid && item.amountKobo !== undefined && item.amountKobo !== null) {
            const val =
              typeof item.amountKobo === "number"
                ? item.amountKobo
                : parseFloat(item.amountKobo);
            if (!isNaN(val) && val > 0) {
              sum += val;
            }
          }
        }

        hasMore = Boolean(data?.hasNext && data?.nextCursor);
        cursor = data?.nextCursor || undefined;
      }

      setPendingTotalKobo(sum);
    } catch (e) {
      // Don't fail the entire screen if pending calculation encounters a network error
      console.error("Failed to calculate pending referral total", e);
    }
  }, [triggerGetReferrals]);

  // Load first page of referrals and rewards (page size 20)
  const loadInitialData = useCallback(async () => {
    try {
      setHasError(false);
      const [refRes, rewRes] = await Promise.all([
        triggerGetReferrals({ limit: 20 }, false).unwrap(),
        triggerGetRewards({ limit: 20 }, false).unwrap(),
        refetchSummary(),
        calculatePendingTotal(),
      ]);

      const refData: any = refRes?.data;
      const refItems: RefereeItem[] = refData?.items || (Array.isArray(refData) ? refData : []);
      setReferrals(refItems);
      setReferralsNextCursor(refData?.nextCursor || null);
      setReferralsHasNext(Boolean(refData?.hasNext));

      const rewData: any = rewRes?.data;
      const rewItems: ReferralRewardItem[] =
        rewData?.items || (Array.isArray(rewData) ? rewData : []);
      setRewards(rewItems);
      setRewardsNextCursor(rewData?.nextCursor || null);
      setRewardsHasNext(Boolean(rewData?.hasNext));
    } catch (e) {
      console.error("Error loading referrals data", e);
      setHasError(true);
    } finally {
      setInitialLoading(false);
    }
  }, [triggerGetReferrals, triggerGetRewards, refetchSummary, calculatePendingTotal]);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleLoadMoreReferrals = async () => {
    if (!referralsHasNext || !referralsNextCursor || isLoadingMoreReferrals) return;
    try {
      setIsLoadingMoreReferrals(true);
      const res = await triggerGetReferrals(
        {
          limit: 20,
          after: referralsNextCursor,
        },
        false
      ).unwrap();

      const data: any = res?.data;
      const newItems: RefereeItem[] = data?.items || [];
      setReferrals((prev) => [...prev, ...newItems]);
      setReferralsNextCursor(data?.nextCursor || null);
      setReferralsHasNext(Boolean(data?.hasNext));
    } catch (e) {
      console.error("Failed to load more referrals", e);
    } finally {
      setIsLoadingMoreReferrals(false);
    }
  };

  const handleLoadMoreRewards = async () => {
    if (!rewardsHasNext || !rewardsNextCursor || isLoadingMoreRewards) return;
    try {
      setIsLoadingMoreRewards(true);
      const res = await triggerGetRewards(
        {
          limit: 20,
          after: rewardsNextCursor,
        },
        false
      ).unwrap();

      const data: any = res?.data;
      const newItems: ReferralRewardItem[] = data?.items || [];
      setRewards((prev) => [...prev, ...newItems]);
      setRewardsNextCursor(data?.nextCursor || null);
      setRewardsHasNext(Boolean(data?.hasNext));
    } catch (e) {
      console.error("Failed to load more rewards", e);
    } finally {
      setIsLoadingMoreRewards(false);
    }
  };

  if (!isReferralEnabled) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="dark" />
        <Header title="My Referrals" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: "#4B5563",
              fontWeight: "600",
              fontFamily: "KumbhSans_600SemiBold",
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Referrals are not available right now.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const summary = summaryResp?.data as any;
  const isLoading = initialLoading || summaryLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <Header title="My Referrals" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#155D5F"
          />
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
            {/* Decorative background shapes */}
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
              {pendingTotalKobo > 0 && (
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.95)",
                    fontSize: 13,
                    fontWeight: "600",
                    fontFamily: "KumbhSans_600SemiBold",
                    marginTop: 4,
                  }}
                >
                  {formatKobo(pendingTotalKobo)} pending
                </Text>
              )}
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
          ) : hasError ? (
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
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
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
                We couldn't load your referrals.
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#4B5563",
                  textAlign: "center",
                  lineHeight: 20,
                  fontFamily: "KumbhSans_600SemiBold",
                  marginBottom: 16,
                }}
              >
                Please check your connection and try again.
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                style={{
                  backgroundColor: "#155D5F",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : activeTab === "referrals" ? (
            referrals.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No referrals yet"
                subtitle="Share your invite link and start earning rewards once your friends complete KYC Level 2 and make their first deposit."
              />
            ) : (
              <>
                {referrals.map((item) => (
                  <RefereeCard key={item.id} item={item} />
                ))}
                {referralsHasNext && (
                  <TouchableOpacity
                    onPress={handleLoadMoreReferrals}
                    disabled={isLoadingMoreReferrals}
                    style={{
                      paddingVertical: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    {isLoadingMoreReferrals ? (
                      <ActivityIndicator size="small" color="#155D5F" />
                    ) : (
                      <Text
                        style={{
                          color: "#155D5F",
                          fontWeight: "700",
                          fontSize: 13,
                          fontFamily: "KumbhSans_600SemiBold",
                        }}
                      >
                        Load more
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )
          ) : rewards.length === 0 ? (
            <EmptyState
              icon="gift-outline"
              title="No rewards yet"
              subtitle="Rewards are credited to your WealthFlex wallet once your referred friends complete KYC Level 2 and make their first deposit."
            />
          ) : (
            <>
              {rewards.map((item) => (
                <RewardCard key={item.id} item={item} />
              ))}
              {rewardsHasNext && (
                <TouchableOpacity
                  onPress={handleLoadMoreRewards}
                  disabled={isLoadingMoreRewards}
                  style={{
                    paddingVertical: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  {isLoadingMoreRewards ? (
                    <ActivityIndicator size="small" color="#155D5F" />
                  ) : (
                    <Text
                      style={{
                        color: "#155D5F",
                        fontWeight: "700",
                        fontSize: 13,
                        fontFamily: "KumbhSans_600SemiBold",
                      }}
                    >
                      Load more
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Referee Card ─── */
function RefereeCard({ item }: { item: RefereeItem }) {
  const [imageError, setImageError] = useState(false);
  const status = (item.status || "PENDING").toUpperCase();
  const statusStyle = getReferralBadgeColor(status);
  const badgeText = getReferralStatusBadge(status);

  const referee = item.referee;
  // Per decision: Never show email or phone
  const displayName =
    [referee?.firstName, referee?.lastName].filter(Boolean).join(" ") ||
    [item.firstName, item.lastName].filter(Boolean).join(" ") ||
    item.name ||
    "Friend";

  const avatarUrl = referee?.imageUrl || item.imageUrl;
  const initials = getInitials(item);

  const totalRewards = item.totalRewardsEarnedKobo ?? item.totalRewards;
  const pendingRewardRaw = item.amountKobo ?? totalRewards;
  const pendingRewardKobo = pendingRewardRaw ? parseFloat(pendingRewardRaw.toString()) : 0;
  const effectiveAmountKobo =
    status === "PAID" ? totalRewards ?? item.amountKobo : item.amountKobo;
  const formattedSubtitleAmount = formatKobo(effectiveAmountKobo);

  const subtitle = getReferralStatusSubtitle(status, formattedSubtitleAmount);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
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

      {/* Main Info Column: keeping at least 120pt on all screens */}
      <View style={{ flex: 1, minWidth: 120 }}>
        {/* Name and Amount row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: 14,
              color: "#1A1A1A",
              flex: 1,
              marginRight: 8,
            }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {status === "PAID" && totalRewards && parseFloat(totalRewards.toString()) > 0 ? (
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: "#155D5F" }}
            >
              {formatKobo(totalRewards)}
            </Text>
          ) : null}
          {status === "PENDING" && pendingRewardKobo > 0 ? (
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#B45309",
                fontFamily: "KumbhSans_600SemiBold",
              }}
            >
              {formatKobo(pendingRewardKobo)} pending
            </Text>
          ) : null}
        </View>

        {/* Invited Date */}
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

        {/* Status Badge below name/date to maintain >=120pt name column on 320/375/430pt screens */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            marginBottom: 4,
          }}
        >
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
                fontSize: 11,
                fontWeight: "700",
                fontFamily: "KumbhSans_600SemiBold",
              }}
            >
              {badgeText}
            </Text>
          </View>
        </View>

        {/* Subtitle per Guide section 3 */}
        <Text
          style={{
            ...SECONDARY_TEXT.subtext.style,
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/* ─── Reward Card ─── */
function RewardCard({ item }: { item: ReferralRewardItem }) {
  const status = (item.status || "PENDING").toUpperCase();
  const statusStyle = getReferralBadgeColor(status);
  const badgeText = getReferralStatusBadge(status);
  const amount = item.amountKobo || item.amount;
  const formattedAmount = formatKobo(amount);
  const subtitle = getReferralStatusSubtitle(status, formattedAmount);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
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

      {/* Main Info Column */}
      <View style={{ flex: 1, minWidth: 120 }}>
        {/* Title and Amount row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: 14,
              color: "#1A1A1A",
              flex: 1,
              marginRight: 8,
            }}
            numberOfLines={1}
          >
            {item.refereeName || item.description || "Referral Reward"}
          </Text>
          <Text
            style={{ fontSize: 14, fontWeight: "800", color: "#155D5F" }}
          >
            {formattedAmount}
          </Text>
        </View>

        {/* Date */}
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </Text>

        {/* Status Badge below title/date */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            marginBottom: 4,
          }}
        >
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
                fontSize: 11,
                fontWeight: "700",
                fontFamily: "KumbhSans_600SemiBold",
              }}
            >
              {badgeText}
            </Text>
          </View>
        </View>

        {/* Subtitle per Guide section 3 */}
        <Text
          style={{
            ...SECONDARY_TEXT.subtext.style,
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
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
          ...SECONDARY_TEXT.subtext.style,
          textAlign: "center",
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
