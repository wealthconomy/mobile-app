import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = "#155D5F"; // Deep teal
const THEME_BG = "#F2FFFF"; // Request color for info cards
const CREATE_CARD_BG = "#D2FEFF4D";
const BORDER_COLOR = "#D9D9D9";
const DISCOVERY_BORDER = "#E8E8E8";

interface GroupCategory {
  id: string;
  title: string;
  icon: string;
}

const CREATE_CATEGORIES: GroupCategory[] = [
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

const DUMMY_TRENDING: DiscoveryGroup[] = [
  {
    id: "t1",
    title: "Wealthy People Savings",
    category: "Fixed Contribution Groups",
    dailyAmount: "₦2,000 Daily",
    endDate: "2/12/2023",
    growth: "₦3M/day",
    members: 283,
    image: require("../../../assets/images/group_trending_1.png"),
  },
  {
    id: "t2",
    title: "Road to ₦300M",
    category: "Flex Contribution Group",
    dailyAmount: "₦2,000 Daily",
    endDate: "2/12/2023",
    growth: "₦3M/day",
    members: 283,
    image: require("../../../assets/images/advert.jpg"),
  },
  {
    id: "t3",
    title: "Future Achievers",
    category: "Fixed Contribution",
    dailyAmount: "₦5,000 Weekly",
    endDate: "12/12/2024",
    growth: "₦500k/day",
    members: 45,
    image: require("../../../assets/images/group_trending_1.png"),
  },
  {
    id: "t4",
    title: "Techies Fund",
    category: "Flex Contribution",
    dailyAmount: "₦10,000 Mo",
    endDate: "1/1/2025",
    growth: "₦1M/day",
    members: 120,
    image: require("../../../assets/images/group_recommended_1.png"),
  },
];

const DUMMY_RECOMMENDED: DiscoveryGroup[] = [
  {
    id: "r1",
    title: "Supportive Hands",
    category: "Flex Contribution Group",
    dailyAmount: "₦2,000 Daily",
    endDate: "2/12/2023",
    growth: "₦3M/day",
    members: 283,
    image: require("../../../assets/images/group_recommended_1.png"),
  },
  {
    id: "r2",
    title: "Future Finance Cooperative",
    category: "Rotational Savings (Ajo/Esusu model)",
    dailyAmount: "₦2,000 Daily",
    endDate: "2/12/2023",
    growth: "₦3M/day",
    members: 283,
    image: require("../../../assets/images/group_trending_1.png"),
  },
  {
    id: "r3",
    title: "Homeowners 2025",
    category: "Fixed Contribution",
    dailyAmount: "₦50k/Monthly",
    endDate: "2/12/2025",
    growth: "₦10M/day",
    members: 500,
    image: require("../../../assets/images/group_recommended_1.png"),
  },
  {
    id: "r4",
    title: "Travelers Hub",
    category: "Rotational",
    dailyAmount: "₦5,000 Daily",
    endDate: "1/5/2024",
    growth: "₦1.2M/day",
    members: 156,
    image: require("../../../assets/images/advert.jpg"),
  },
];

export default function WealthGroupScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const [showBalance, setShowBalance] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">(
    "ongoing",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [ongoingGroups] = useState<any[]>([]); // Empty state by default

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <Header title="Wealth Group" onBack={() => router.back()} />
        <PortfolioDetailSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="Wealth Group" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-2">
          {/* ── Hero Card ────────────────────────────────────────── */}
          <View
            className="relative overflow-hidden mb-8"
            style={{
              width: "100%",
              height: 160,
              borderRadius: 20,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
              borderWidth: 1,
              borderColor: "#dbdcdcff",
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
                <Text className="text-[#64748B] text-[13px] font-bold">
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
                    amount="₦300,735.42"
                    fontSize={34}
                    color="#1A1A1A"
                  />
                ) : (
                  <Text className="text-[#1A1A1A] text-[34px] font-black tracking-tight">
                    ••••••••
                  </Text>
                )}
              </View>

              <View className="flex-row items-center space-x-1">
                <Text className="text-[#64748B] text-[12px] font-bold">
                  Your wealth grew to N230.00 today
                </Text>
                <Text className="text-[#4CAF50] text-[15px] font-bold">↑</Text>
              </View>
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
            data={DUMMY_TRENDING}
            onViewAll={() => {}}
          />

          {/* ── Recommended Groups ────────────────────────────────── */}
          <DiscoverySection
            title="Recommended Groups"
            data={DUMMY_RECOMMENDED}
            onViewAll={() => {}}
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

          {/* ── Empty State ───────────────────────────────────────── */}
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
              For users with an invite code or those looking for "Open" groups.
            </Text>
          </View>
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
          <Text className="text-[13px] font-bold text-[#64748B]">View all</Text>
        </TouchableOpacity>
      </View>
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
          className="text-[8px] text-[#64748B] font-bold mb-1"
        >
          {item.category}
        </Text>

        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-[10px] text-[#1A1A1A] font-black font-bold">
            {item.dailyAmount}
          </Text>
          <Text className="text-[10px] text-[#64748B] font-medium">
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
            {item.members} Members
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
