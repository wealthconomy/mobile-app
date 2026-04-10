import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = "#005F61";
const THEME_BG = "#F2FFFF";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"about" | "members">("about");

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="Group Details" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* ── Banner Image ──────────────────────────────────────── */}
        <View className="w-full h-48 bg-gray-100">
          <Image
            source={require("../../../../assets/images/group_trending_1.png")}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="px-5 -mt-8">
          {/* ── Group Header ────────────────────────────────────── */}
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 mb-6">
            <Text className="text-[22px] font-black text-[#1A1A1A] mb-2">
              Wealthy People Savings
            </Text>
            <View className="flex-row items-center space-x-2">
              <View className="bg-[#F2FFFF] px-3 py-1 rounded-full">
                <Text
                  className="text-[11px] font-black uppercase"
                  style={{ color: THEME }}
                >
                  Fixed Contribution
                </Text>
              </View>
              <Text className="text-[12px] text-[#64748B] font-bold">
                • 125 Members
              </Text>
            </View>
          </View>

          {/* ── Progress Card ────────────────────────────────────── */}
          <View className="bg-[#F2FFFF] rounded-3xl p-6 mb-8 border border-[#E0F2F2]">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-[12px] text-[#155D5F] font-bold mb-1 opacity-70">
                  Target Savings
                </Text>
                <Text className="text-[24px] font-black text-[#155D5F]">
                  ₦50,373,280.00
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[12px] text-[#155D5F] font-bold mb-1 opacity-70">
                  Growth
                </Text>
                <Text className="text-[18px] font-black text-[#4CAF50]">
                  +₦2.4M
                </Text>
              </View>
            </View>

            <View className="h-4 bg-white/50 rounded-full overflow-hidden mb-3">
              <View
                className="h-full rounded-full"
                style={{ width: "45%", backgroundColor: THEME }}
              />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-[12px] font-black" style={{ color: THEME }}>
                45% Saved
              </Text>
              <Text
                className="text-[12px] font-bold opacity-70"
                style={{ color: THEME }}
              >
                ₦22.6M Remaining
              </Text>
            </View>
          </View>

          {/* ── Tabs ─────────────────────────────────────────────── */}
          <View className="flex-row mb-6 border-b border-gray-100">
            <TouchableOpacity
              onPress={() => setActiveTab("about")}
              className={`pb-3 mr-8 ${activeTab === "about" ? "border-b-2" : ""}`}
              style={{ borderBottomColor: THEME }}
            >
              <Text
                className={`text-[14px] ${activeTab === "about" ? "font-black text-[#1A1A1A]" : "font-bold text-[#94A3B8]"}`}
              >
                About Group
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("members")}
              className={`pb-3 ${activeTab === "members" ? "border-b-2" : ""}`}
              style={{ borderBottomColor: THEME }}
            >
              <Text
                className={`text-[14px] ${activeTab === "members" ? "font-black text-[#1A1A1A]" : "font-bold text-[#94A3B8]"}`}
              >
                Members (125)
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Tab Content ──────────────────────────────────────── */}
          {activeTab === "about" ? (
            <View className="mb-10">
              <Text className="text-[13px] text-[#64748B] leading-[22px] font-medium mb-6">
                This group is for the 2024 homeowners who are disciplined and
                ready to achieve their homeownership goals together. We
                contribute weekly and support each other.
              </Text>

              <View className="space-y-4">
                <DetailItem
                  icon="calendar-outline"
                  label="Frequency"
                  value="Weekly"
                />
                <DetailItem
                  icon="cash-outline"
                  label="Contribution"
                  value="₦100,000.00"
                />
                <DetailItem
                  icon="time-outline"
                  label="Start Date"
                  value="12th Jan 2024"
                />
                <DetailItem
                  icon="flag-outline"
                  label="End Date"
                  value="12th Jan 2025"
                />
              </View>
            </View>
          ) : (
            <View className="mb-10 py-10 items-center justify-center bg-gray-50 rounded-3xl border-dashed border-2 border-gray-200">
              <Ionicons name="people-outline" size={32} color="#94A3B8" />
              <Text className="text-[12px] text-[#94A3B8] font-bold mt-2">
                Member list Coming Soon
              </Text>
            </View>
          )}

          {/* ── Action Buttons ───────────────────────────────────── */}
          <View className="space-y-4 mb-10">
            <TouchableOpacity
              className="h-14 rounded-2xl items-center justify-center"
              style={{ backgroundColor: THEME }}
              onPress={() =>
                router.push({
                  pathname: "/wallet/top-up",
                  params: { portfolioName: "WealthGroup" },
                })
              }
            >
              <Text className="text-white font-black text-[16px]">
                Contribution Group
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="h-14 rounded-2xl items-center justify-center border border-red-50">
              <Text className="text-red-500 font-extrabold text-[16px]">
                Leave Group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between pb-4 border-b border-gray-50">
      <View className="flex-row items-center space-x-3">
        <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
          <Ionicons name={icon} size={16} color={THEME} />
        </View>
        <Text className="text-[13px] text-[#94A3B8] font-bold">{label}</Text>
      </View>
      <Text className="text-[13px] text-[#1A1A1A] font-black">{value}</Text>
    </View>
  );
}
