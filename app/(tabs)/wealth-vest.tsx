import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "../../src/store";
import { useJoinWaitlistMutation } from "../../src/store/api/userApi";
import { Ionicons } from "@expo/vector-icons";
import { ThemedButton } from "../../src/components/ThemedButton";

const TEAL = "#155D5F";
const BRAND_TEAL = "#008185";
const DARK = "#1A1A1A";

const PILLARS = [
  {
    id: "vetted",
    title: "Vetted Asset Opportunities",
    subtitle: "Rigorously analyzed portfolios with transparent risk ratings and collateral backing.",
    iconName: "shield-checkmark-outline" as const,
  },
  {
    id: "growth",
    title: "Accelerated Wealth Compounding",
    subtitle: "Move beyond standard savings with competitive annual yields and disciplined distributions.",
    iconName: "trending-up-outline" as const,
  },
  {
    id: "custody",
    title: "Institutional Custody & Protection",
    subtitle: "User funds and invested capital held under regulated trustee and banking supervision.",
    iconName: "lock-closed-outline" as const,
  },
];

const INVESTMENT_CATEGORIES = [
  "Real Estate",
  "Agriculture",
  "Fixed Income",
  "Venture Assets",
];

export default function WealthVestScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [joinWaitlistApi, { isLoading: isJoining }] = useJoinWaitlistMutation();

  const [hasJoined, setHasJoined] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Real Estate");

  // Check server state if user profile exposes waitlist membership
  const serverHasJoined = Boolean((user as any)?.hasJoinedWaitlist || (user as any)?.waitlistJoined);
  const serverWaitlistPos = (user as any)?.waitlistPosition;

  useEffect(() => {
    if (serverHasJoined) {
      setHasJoined(true);
      if (serverWaitlistPos) setWaitlistPosition(serverWaitlistPos);
      return;
    }

    if (!user?.id) return;
    const key = `@wealth_waitlist_joined_${user.id}`;
    const posKey = `@wealth_waitlist_pos_${user.id}`;

    AsyncStorage.getItem(key)
      .then((val) => {
        if (val === "true") {
          setHasJoined(true);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem(posKey)
      .then((val) => {
        if (val) {
          const parsed = parseInt(val, 10);
          if (!isNaN(parsed)) setWaitlistPosition(parsed);
        }
      })
      .catch(() => {});
  }, [user?.id, serverHasJoined, serverWaitlistPos]);

  const handleJoinWaitlist = async () => {
    try {
      const res = await joinWaitlistApi({
        feature: "WEALTH_VEST",
        email: user?.email || undefined,
        fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || undefined,
        intendedInvestment: selectedCategory,
      }).unwrap();

      const pos = res?.data?.waitlistPosition;
      if (pos) {
        setWaitlistPosition(pos);
      }
      setHasJoined(true);

      if (user?.id) {
        AsyncStorage.setItem(`@wealth_waitlist_joined_${user.id}`, "true").catch(() => {});
        if (pos) {
          AsyncStorage.setItem(`@wealth_waitlist_pos_${user.id}`, String(pos)).catch(() => {});
        }
      }

      Alert.alert(
        "Waitlist Confirmed! 🎉",
        pos
          ? `You are #${pos} on the Priority Waitlist! You'll receive priority access and an email invitation as soon as allocations go live.`
          : (res?.message || "Thank you for registering your interest. You'll receive priority access as soon as allocations go live.")
      );
    } catch (err: any) {
      const errorMsg = (err?.data?.message || err?.message || "").toString();
      const lower = errorMsg.toLowerCase();
      const isAlreadyJoined =
        err?.status === 409 ||
        lower.includes("already") ||
        lower.includes("exist") ||
        lower.includes("duplicate");

      if (isAlreadyJoined) {
        setHasJoined(true);
        if (user?.id) {
          AsyncStorage.setItem(`@wealth_waitlist_joined_${user.id}`, "true").catch(() => {});
        }
        Alert.alert(
          "Already on Waitlist! 🎉",
          "You are already registered on the Priority Waitlist. We'll notify you as soon as allocations go live."
        );
      } else {
        const msg = errorMsg || "Unable to join waitlist. Please check your connection and try again.";
        Alert.alert("Unable to Join Waitlist", msg);
      }
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />

      {/* Top Header */}
      <View className="px-6 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
        <View>
          <Text className="text-[24px] font-extrabold text-[#1A1A1A]">
            WealthVest
          </Text>
          <Text className="text-[12px] text-[#6B7280] font-medium">
            Curated Wealth & Alternative Portfolios
          </Text>
        </View>
        <View className="bg-[#E6F4F4] px-3 py-1.5 rounded-full">
          <Text className="text-[#155D5F] font-bold text-[11px] uppercase tracking-wider">
            Early Access
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 60,
        }}
      >
        {/* Hero Card */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={{
            backgroundColor: BRAND_TEAL,
            borderTopLeftRadius: 36,
            borderTopRightRadius: 18,
            borderBottomRightRadius: 36,
            borderBottomLeftRadius: 18,
            padding: 24,
            marginBottom: 24,
            position: "relative",
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-3">
            <Text className="text-white text-[11px] font-bold">
              Cohort Allocation · Q3
            </Text>
          </View>

          <Text className="text-white text-[24px] font-extrabold leading-[32px] mb-2">
            The Future of{"\n"}Wealth is Vesting.
          </Text>

          <Text className="text-[#E6F4FE] text-[13px] leading-[20px]">
            Move beyond regular saving. Start owning curated, high-yield alternative assets structured for long-term financial independence.
          </Text>
        </Animated.View>

        {/* Priority Waitlist Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          className="bg-[#F8F9FA] rounded-[24px] p-6 border border-gray-100 mb-6"
        >
          {hasJoined ? (
            <View className="items-center py-4">
              <View className="w-16 h-16 rounded-full bg-[#DCFCE7] items-center justify-center mb-3">
                <Ionicons name="checkmark-circle" size={36} color="#166534" />
              </View>
              {waitlistPosition && (
                <View className="bg-[#E6F4F4] px-3.5 py-1 rounded-full mb-2">
                  <Text className="text-[#155D5F] font-extrabold text-[12px]">
                    Priority Queue #{waitlistPosition}
                  </Text>
                </View>
              )}
              <Text className="text-[#1A1A1A] font-extrabold text-[18px] text-center mb-1">
                You're on the Priority List!
              </Text>
              <Text className="text-[#6B7280] text-[13px] text-center leading-[19px] px-2 mb-2">
                We've reserved your spot in the opening cohort. Notifications will be sent to{" "}
                <Text className="font-bold text-[#155D5F]">{user?.email || "your registered email"}</Text>.
              </Text>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[#1A1A1A] font-extrabold text-[16px]">
                  Join Early Access Waitlist
                </Text>
                <View className="bg-[#FEF3C7] px-2.5 py-0.5 rounded-md">
                  <Text className="text-[#92400E] text-[10px] font-extrabold uppercase">
                    Priority
                  </Text>
                </View>
              </View>

              <Text className="text-[#6B7280] text-[12.5px] leading-[18px] mb-4">
                Be the first to access prime portfolios when allocation opens. Select your primary investment interest:
              </Text>

              {/* Category Pills */}
              <View className="flex-row flex-wrap gap-2 mb-5">
                {INVESTMENT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: isSelected ? TEAL : "#FFFFFF",
                        borderColor: isSelected ? TEAL : "#E5E7EB",
                        borderWidth: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? "#FFFFFF" : "#4B5563",
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ThemedButton
                title={isJoining ? "Submitting..." : "Join Priority Waitlist"}
                onPress={handleJoinWaitlist}
                loading={isJoining}
                style={{
                  backgroundColor: TEAL,
                  borderRadius: 14,
                  height: 50,
                }}
              />
            </View>
          )}
        </Animated.View>

        {/* Core Pillars Section */}
        <Text className="text-[#1A1A1A] font-extrabold text-[16px] mb-3 px-1">
          Why WealthVest?
        </Text>

        <View className="gap-3">
          {PILLARS.map((pillar, index) => (
            <Animated.View
              key={pillar.id}
              entering={FadeInDown.duration(400).delay(150 + index * 80)}
              className="bg-white rounded-[20px] p-4 border border-gray-100 flex-row items-start gap-3.5"
            >
              <View className="w-10 h-10 rounded-xl bg-[#E6F4F4] items-center justify-center mt-0.5">
                <Ionicons name={pillar.iconName} size={20} color={TEAL} />
              </View>
              <View className="flex-1 pr-1">
                <Text className="text-[#1A1A1A] font-bold text-[14px] mb-0.5">
                  {pillar.title}
                </Text>
                <Text className="text-[#6B7280] text-[12px] leading-[18px]">
                  {pillar.subtitle}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
