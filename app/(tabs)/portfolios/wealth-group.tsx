import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { PortfolioPreferenceMenu } from "@/src/components/common/PortfolioPreferenceMenu";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { RootState } from "@/src/store";
import { WealthGroup } from "@/src/store/slices/wealthGroupSlice";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff, Search, Users } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const THEME = "#155D5F"; // Deep teal
const THEME_BG = "#F2FFFF"; // Request color for info cards
const CREATE_CARD_BG = "#D2FEFF4D";
const BORDER_COLOR = "#D9D9D9";
const DISCOVERY_BORDER = "#E8E8E8";

interface DiscoveryGroup {
  id: string;
  title: string;
  members: number;
  dailyAmount: string;
  endDate: string;
  growth: string;
  image: any;
  category: string;
}

const CREATE_CATEGORIES = [
  {
    id: "fixed",
    title: "Fixed\nContribution\nGroups",
    icon: "people-outline",
  },
  {
    id: "flex",
    title: "Flex\nContribution\nGroups",
    icon: "cash-outline",
  },
  {
    id: "rotational",
    title: "Rotational\nSavings (Ajo/\nEsusu model)",
    icon: "people-circle-outline",
  },
];

import { useListGroupsQuery } from "@/src/store/api/groupApi";
import { WealthGroupModel } from "@/src/types/group";

export default function WealthGroupScreen() {
  const {
    data: groupsData,
    isLoading: loading,
    refetch,
  } = useListGroupsQuery(
    { populate: ["members", "creator"] },
    {
      pollingInterval: 10000,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );
  const portfolioPreference = useSelector(
    (state: RootState) => state.portfolioPreference.group
  );
  const showInterest = portfolioPreference !== "Impact Wealth";

  const [showBalance, setShowBalance] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">("ongoing");
  const [searchQuery, setSearchQuery] = useState("");

  const allGroups: WealthGroupModel[] = groupsData?.items || [];

  // Map API groups to DiscoveryGroup interface
  const mappedGroups: DiscoveryGroup[] = allGroups.map((g) => {
    const memberCount =
      (g as any).membersCount ??
      (g as any).memberCount ??
      (g as any)._count?.members ??
      (g as any).members?.length ??
      1;

    const frequencyLabel = g.frequency
      ? g.frequency.charAt(0).toUpperCase() + g.frequency.slice(1).toLowerCase()
      : "Monthly";

    const formattedEnd = g.endDate
      ? new Date(g.endDate).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "2-digit",
        })
      : "Flexible";

    return {
      id: g.id,
      title: g.name,
      category: g.category || "General",
      dailyAmount: `₦${(parseFloat(g.targetAmount?.toString() || "0") / 100).toLocaleString()} ${frequencyLabel}`,
      endDate: formattedEnd,
      growth: "₦0/day",
      members: memberCount,
      image: g.coverImage
        ? { uri: g.coverImage }
        : require("../../../assets/images/group_trending_1.png"),
    };
  });

  const filteredGroups = mappedGroups.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const trendingGroups = filteredGroups;
  const recommendedGroups = filteredGroups;

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const isUserMemberOfGroup = (g: WealthGroupModel) => {
    if (!currentUser?.id) return false;
    const uid = currentUser.id;

    // 1. Creator checks
    if (g.creatorId === uid || (g as any).creator?.id === uid) return true;

    // 2. Explicit admin flag
    if (g.isAdmin) return true;

    // 3. Status checks on group user membership (MUST BE ACTIVE/APPROVED, NOT PENDING)
    const userStatus =
      (g as any).userStatus ||
      (g as any).membershipStatus ||
      (g as any).memberStatus;
    if (
      userStatus === "ACTIVE" ||
      userStatus === "PAID" ||
      userStatus === "UNPAID" ||
      userStatus === "APPROVED"
    ) {
      return true;
    }

    // 4. Check populated members array
    const membersList =
      (g as any).members ||
      (g as any).groupMembers ||
      (g as any).membersList;
    if (Array.isArray(membersList) && membersList.length > 0) {
      const found = membersList.some((m: any) => {
        if (!m) return false;
        if (typeof m === "string") return m === uid;
        const memberUid =
          m.userId ||
          m.id ||
          m.user?.id ||
          (typeof m.userId === "object" ? m.userId?.id : null);
        const memberStatus = m.status;
        const memberRole = m.role;
        return (
          memberUid === uid &&
          (memberRole === "OWNER" ||
            memberRole === "ADMIN" ||
            memberStatus === "ACTIVE" ||
            memberStatus === "PAID" ||
            memberStatus === "UNPAID" ||
            memberStatus === "APPROVED")
        );
      });
      if (found) return true;
    }

    // 5. Check if user is in userMembership object with ACTIVE status
    if (
      (g as any).userMembership &&
      ((g as any).userMembership.status === "ACTIVE" ||
        (g as any).userMembership.status === "APPROVED")
    ) {
      return true;
    }

    // 6. Explicit boolean only if not pending
    if (g.isMember && userStatus !== "PENDING") return true;

    return false;
  };

  const ongoingGroups = allGroups.filter(
    (g) =>
      isUserMemberOfGroup(g) &&
      g.status !== "COMPLETED" &&
      g.status !== "TERMINATED"
  );
  const completedGroups = allGroups.filter(
    (g) =>
      isUserMemberOfGroup(g) &&
      (g.status === "COMPLETED" || g.status === "TERMINATED")
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const totalSavingsKobo = ongoingGroups.reduce((acc, g) => {
    const rawVal = g.totalSavings ?? g.currentBalance ?? 0;
    const num = typeof rawVal === "string" ? parseFloat(rawVal) : Number(rawVal);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
        <StatusBar style="dark" />
      <Header
        title="WealthGroup"
        onBack={() => router.back()}
        rightElement={<PortfolioPreferenceMenu portfolioType="group" />}
      />
        <PortfolioDetailSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header
        title="WealthGroup"
        onBack={() => router.back()}
        rightElement={<PortfolioPreferenceMenu portfolioType="group" />}
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-2">
          {/* ── Hero Card ────────────────────────────────────────── */}
          <View
            className="relative overflow-hidden mb-8 self-center"
            style={{
              width: 365,
              height: 160,
              borderTopLeftRadius: 50,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 50,
              borderBottomLeftRadius: 20,
              backgroundColor: "white",
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
              source={require("../../../assets/images/group.png")}
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

            <View style={{ padding: 24 }}>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[#4B5563] text-[14px] font-extrabold">
                  Total Savings
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
                    amount={`₦${(totalSavingsKobo / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    fontSize={34}
                    color="#1A1A1A"
                  />
                ) : (
                  <Text className="text-[#1A1A1A] text-[34px] font-black tracking-tight">
                    ••••••••
                  </Text>
                )}
              </View>

              {showInterest && (
                <View className="flex-row items-center space-x-1">
                  <Text className="text-[#4B5563] text-[13px] font-extrabold">
                    Your wealth grew by ₦{(ongoingGroups.reduce((acc, g) => acc + (parseFloat(g.dailyWealthGrowth?.toString() || "0")), 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} today
                  </Text>
                  <Text className="text-[#4CAF50] text-[15px] font-bold">↑</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Create a Group Section ────────────────────────────── */}
          <View className="mb-10">
            <Text
              className="text-[18px] font-bold text-[#1A1A1A] mb-4 tracking-tighter"
              style={{
                textShadowColor: "rgba(26, 26, 26, 0.2)",
                textShadowOffset: { width: 0.1, height: 0.1 },
                textShadowRadius: 0.3,
              }}
            >
              Create a group
            </Text>
            <View className="flex-row justify-between">
              {CREATE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  style={{
                    width: 114,
                    height: 89,
                    borderRadius: 13,
                    borderWidth: 1,
                    borderColor: BORDER_COLOR,
                    backgroundColor: CREATE_CARD_BG,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                  onPress={() => router.push("/portfolio/create/group")}
                >
                  <View className="mb-2">
                    <Ionicons name={cat.icon as any} size={24} color={THEME} />
                  </View>
                  <Text className="text-[9px] font-bold text-[#1A1A1A] text-center leading-[11px]">
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Tips Card ─────────────────────────────────────────── */}
          {showTips && (
            <View
              className="relative p-6 mb-10"
              style={{
                width: "100%",
                minHeight: 226,
                backgroundColor: THEME_BG,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: BORDER_COLOR,
              }}
            >
              <TouchableOpacity
                className="absolute right-4 top-4 z-10"
                onPress={() => setShowTips(false)}
              >
                <Ionicons name="close" size={20} color={THEME} />
              </TouchableOpacity>
              <Text
                className="font-extrabold text-[14px] mb-4"
                style={{ color: "#155D5F" }}
              >
                What's on Wealth Group?
              </Text>
              <Text
                className="text-[11px] leading-[16px] mb-4 font-medium"
                style={{ color: "#155D5F", opacity: 0.8 }}
              >
                A community-powered savings feature that enables users to create
                or join structured group savings models for collective financial
                goals.
              </Text>
              <View className="space-y-3">
                <TipRow
                  label="Fixed Contribution Groups"
                  text="All members save the same amount at the same frequency (e.g., ₦20,000 monthly for 12 months)."
                />
                <TipRow
                  label="Flex Contribution Groups"
                  text="Members save at their own pace towards a shared, defined goal."
                />
                <TipRow
                  label="Rotational Savings (Ajo/Esusu Model)"
                  text="Members contribute regularly, and payouts rotate per an agreed schedule. (Note: This group is strictly monitored by admin and can only be created with vetted, established processes.)"
                />
              </View>
            </View>
          )}

          {/* ── Search Bar ────────────────────────────────────────── */}
          <View
            className="flex-row items-center mb-10"
            style={{
              width: "100%",
              height: 49,
              backgroundColor: THEME_BG,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: BORDER_COLOR,
              paddingLeft: 12,
              paddingRight: 96,
            }}
          >
            <Search size={18} color="#94A3B8" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-3 text-[13px] font-medium"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* ── Trending Groups ───────────────────────────────────── */}
          <DiscoverySection
            title="Trending Groups"
            data={trendingGroups}
            onViewAll={() =>
              router.push({
                pathname: "/portfolio/group/discovery",
                params: { type: "trending" },
              })
            }
          />

          {/* ── Recommended Groups ────────────────────────────────── */}
          <DiscoverySection
            title="Recommended Groups"
            data={recommendedGroups}
            onViewAll={() =>
              router.push({
                pathname: "/portfolio/group/discovery",
                params: { type: "recommended" },
              })
            }
          />

          {/* ── Tabs ─────────────────────────────────────────────── */}
          <View
            style={{
              width: "100%",
              height: 44,
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 30,
              paddingHorizontal: 0,
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("ongoing")}
              activeOpacity={1}
              style={{
                width: "48%",
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor:
                  activeTab === "ongoing" ? "#F2FFFF" : "transparent",
                borderBottomWidth: activeTab === "ongoing" ? 2 : 0,
                borderBottomColor: THEME,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: activeTab === "ongoing" ? THEME : "#64748B",
                  fontSize: 14,
                  fontWeight: activeTab === "ongoing" ? "900" : "600",
                }}
              >
                Progress Tracking
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("completed")}
              activeOpacity={1}
              style={{
                width: "48%",
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor:
                  activeTab === "completed" ? "#F2FFFF" : "transparent",
                borderBottomWidth: activeTab === "completed" ? 2 : 0,
                borderBottomColor: THEME,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: activeTab === "completed" ? THEME : "#64748B",
                  fontSize: 14,
                  fontWeight: activeTab === "completed" ? "900" : "600",
                }}
              >
                Completed Goals
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Group List ────────────────────────────────────────── */}
          {activeTab === "ongoing" ? (
            ongoingGroups.length > 0 ? (
              <View className="space-y-6 mb-10">
                {ongoingGroups.map((g: WealthGroupModel) => {
                  const targetNum = (parseFloat(g.targetAmount?.toString() || "10000000")) / 100;
                  const rawSavings = g.totalSavings ?? g.currentBalance ?? 0;
                  const currentNum = (typeof rawSavings === "string" ? parseFloat(rawSavings) : Number(rawSavings)) / 100;
                  const progressRatio = targetNum > 0 ? (currentNum / targetNum) * 100 : 0;
                  const formattedPct = progressRatio >= 100 ? "100%" : `${progressRatio.toFixed(1)}%`;
                  const barWidth = Math.min(Math.max(progressRatio, 2), 100);

                  const memberCount =
                    (g as any).membersCount ??
                    (g as any).memberCount ??
                    (g as any)._count?.members ??
                    (g as any).members?.length ??
                    1;

                  return (
                    <TouchableOpacity
                      key={g.id}
                      onPress={() =>
                        router.push({
                          pathname: "/portfolio/detail/group/[id]",
                          params: { id: g.id },
                        })
                      }
                      className="flex-row items-center p-4 bg-white rounded-2xl mb-4"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 5,
                        elevation: 1,
                        borderWidth: 1,
                        borderColor: "#F1F5F9",
                      }}
                    >
                      <View className="w-16 h-16 rounded-xl overflow-hidden mr-4">
                        {g.coverImage ? (
                          <Image
                            source={{ uri: g.coverImage }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-full h-full bg-[#F2FFFF] items-center justify-center">
                            <Users size={28} color={THEME} />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-[16px] font-bold text-[#1A1A1A] mb-1">
                          {g.name}
                        </Text>
                        <View className="flex-row items-center justify-between mb-1.5">
                          <Text className="text-[13px] font-bold text-[#4B5563]">
                            Progress:{" "}
                            <Text className="text-[#155D5F] font-black">
                              ₦{currentNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                            <Text className="text-[11px] text-[#6B7280] font-medium">
                              {" "}({formattedPct})
                            </Text>
                          </Text>
                          <Text className="text-[12px] font-bold text-[#4B5563]">
                            {memberCount} {memberCount === 1 ? "member" : "members"}
                          </Text>
                        </View>
                        {/* Progress Bar */}
                        <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-[#155D5F] rounded-full"
                            style={{ width: `${barWidth}%` }}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View className="items-center justify-center py-10 mb-10">
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#F2FFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Ionicons name="person-add-outline" size={30} color={THEME} />
                </View>
                <Text className="text-[18px] font-black text-[#155D5F] mb-4">
                  Create or Join a group
                </Text>
                <Text className="text-[11px] text-center text-[#155D5F] opacity-70 px-10 leading-[18px]">
                  For users who want to start a new savings circle (leads to
                  choosing Fixed, Flex, or Rotational). {"\n"}
                  For users with an invite code or those looking for "Open"
                  groups.
                </Text>
              </View>
            )
          ) : completedGroups.length > 0 ? (
            <View className="space-y-6 mb-10">
              {completedGroups.map((g: WealthGroupModel) => {
                const targetNum = (parseFloat(g.targetAmount?.toString() || "10000000")) / 100;
                const rawSavings = g.totalSavings ?? g.currentBalance ?? 0;
                const currentNum = (typeof rawSavings === "string" ? parseFloat(rawSavings) : Number(rawSavings)) / 100;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() =>
                      router.push({
                        pathname: "/portfolio/detail/group/[id]",
                        params: { id: g.id },
                      })
                    }
                    className="flex-row items-center p-4 bg-white rounded-2xl mb-4"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.03,
                      shadowRadius: 5,
                      elevation: 1,
                      borderWidth: 1,
                      borderColor: "#F1F5F9",
                    }}
                  >
                    <View className="w-16 h-16 rounded-xl overflow-hidden mr-4">
                      {g.coverImage ? (
                        <Image
                          source={{ uri: g.coverImage }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full bg-[#F2FFFF] items-center justify-center">
                          <Users size={28} color={THEME} />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-[16px] font-bold text-[#1A1A1A] mb-1">
                        {g.name}
                      </Text>
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-[13px] font-bold text-[#10B981]">
                          Status: Completed
                        </Text>
                        <Text className="text-[12px] font-bold text-[#4B5563]">
                          Total: ₦{currentNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="items-center justify-center py-10 mb-10">
              <Text className="text-gray-400">No completed groups yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TipRow({ label, text }: { label: string; text: string }) {
  return (
    <View className="flex-row items-start space-x-2">
      <Text
        style={{ color: "#155D5F" }}
        className="text-[11px] font-black mt-0.5"
      >
        •
      </Text>
      <Text
        className="flex-1 text-[10.5px] leading-[15px]"
        style={{ color: "#155D5F" }}
      >
        <Text className="font-extrabold">{label}:</Text> {text}
      </Text>
    </View>
  );
}

function DiscoverySection({
  title,
  data,
  onViewAll,
}: {
  title: string;
  data: DiscoveryGroup[];
  onViewAll: () => void;
}) {
  return (
    <View className="mb-10">
      <View className="flex-row justify-between items-center mb-6">
        <Text
          className="text-[18px] font-bold text-[#1A1A1A] tracking-tighter"
          style={{
            textShadowColor: "rgba(26, 26, 26, 0.2)",
            textShadowOffset: { width: 0.1, height: 0.1 },
            textShadowRadius: 0.3,
          }}
        >
          {title}
        </Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text className="text-[14px] font-extrabold text-[#374151]">View all</Text>
        </TouchableOpacity>
      </View>
      {data.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="space-x-4"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {data.map((item) => (
            <DiscoveryCard key={item.id} item={item} />
          ))}
        </ScrollView>
      ) : (
        <View className="w-full h-32 items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Ionicons name="people-outline" size={32} color="#94A3B8" />
          <Text className="text-[#374151] text-[13px] font-bold mt-2 text-center px-4">
            No groups found yet. Create a tribe or search by name.
          </Text>
        </View>
      )}
    </View>
  );
}

function DiscoveryCard({ item }: { item: DiscoveryGroup }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="bg-white rounded-[10px] border border-[#E8E8E8] overflow-hidden p-[10px]"
      style={{
        width: 170,
        height: 194,
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        borderColor: "#dbdcdcff",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Image
        source={item.image}
        style={{ width: 152, height: 72, borderRadius: 7 }}
      />
      <View className="mt-2 flex-1">
        <Text
          numberOfLines={1}
          className="text-[11px] font-black text-[#1A1A1A] mb-1 font-bold"
        >
          {item.title}
        </Text>
        <Text
          numberOfLines={1}
          className="text-[10px] text-[#4B5563] font-extrabold mb-1"
        >
          {item.category}
        </Text>

        <View className="flex-row justify-between items-center mb-1">
          <Text
            numberOfLines={1}
            className="text-[10px] text-[#1A1A1A] font-black font-bold flex-1 mr-1"
          >
            {item.dailyAmount}
          </Text>
          <Text className="text-[10px] text-[#4B5563] font-bold">
            Ends: {item.endDate}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-baseline space-x-0.5">
            <Text className="text-[8px] text-[#4CAF50] font-bold">
              Wealth Growth
            </Text>
            <Text className="text-[10px] text-[#4CAF50] font-black font-bold">
              {item.growth}
            </Text>
          </View>
          <Text className="text-[10px] text-[#155D5F] font-black">
            {item.members} {item.members === 1 ? "Member" : "Members"}
          </Text>
        </View>

        <TouchableOpacity
          className="w-full h-[34px] rounded-[8px] items-center justify-center p-2"
          style={{ backgroundColor: THEME }}
          onPress={() =>
            router.push({
              pathname: "/portfolio/detail/group/[id]",
              params: { id: item.id },
            })
          }
        >
          <Text className="text-white text-[10px] font-black ">View Group</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
