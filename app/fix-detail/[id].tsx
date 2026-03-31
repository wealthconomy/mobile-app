import Header from "@/src/components/common/Header";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Re-defining interface for local use
export interface WealthFix {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  saved: string;
  progress: number;
  daysLeft: number;
  endDate: string;
  automationFrequency: "Daily" | "Weekly" | "Monthly" | "Manual" | "One-time";
  source: string;
  lockDuration: string;
  wealthGrowth: string;
  wealthGrowsInto: string;
}

const fixService = {
  getFixes: async (): Promise<WealthFix[]> => {
    const base = {
      automationFrequency: "Manual" as const,
      source: "WealthFlex",
      lockDuration: "365 days",
      wealthGrowth: "₦2,453.00",
      wealthGrowsInto: "WinUp",
      endDate: "31th Dec 2023",
    };
    return [
      {
        ...base,
        id: "fix-1",
        title: "House Rent",
        subtitle: "Business",
        amount: "3,000,000.00",
        saved: "2,400,000.00",
        progress: 0.8,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fix-2",
        title: "Wedding Clothes",
        subtitle: "Personal",
        amount: "1,234,144.00",
        saved: "863,900.00",
        progress: 0.7,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fix-3",
        title: "House Rent",
        subtitle: "Business",
        amount: "3,000,000.00",
        saved: "1,800,000.00",
        progress: 0.6,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fix-4",
        title: "House Rent",
        subtitle: "Business",
        amount: "3,000,000.00",
        saved: "1,800,000.00",
        progress: 0.6,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fix-5",
        title: "Wedding Clothes",
        subtitle: "Personal",
        amount: "3,000,000.00",
        saved: "1,800,000.00",
        progress: 0.6,
        daysLeft: 54,
      },
      {
        ...base,
        id: "fix-u1",
        title: "Wedding Clothes",
        subtitle: "Personal",
        amount: "3,000,000.00",
        saved: "3,000,000.00",
        progress: 1.0,
        daysLeft: 0,
      },
      {
        ...base,
        id: "fix-u2",
        title: "House Rent",
        subtitle: "Business",
        amount: "3,000,000.00",
        saved: "3,000,000.00",
        progress: 1.0,
        daysLeft: 0,
      },
      {
        ...base,
        id: "fix-u3",
        title: "House Rent",
        subtitle: "Business",
        amount: "3,000,000.00",
        saved: "3,000,000.00",
        progress: 1.0,
        daysLeft: 0,
      },
      {
        ...base,
        id: "fix-u4",
        title: "Wedding Clothes",
        subtitle: "Personal",
        amount: "3,000,000.00",
        saved: "3,000,000.00",
        progress: 1.0,
        daysLeft: 0,
      },
    ];
  },
};

export default function FixDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fix, setFix] = useState<WealthFix | null>(null);
  const [loading, setLoading] = useState(true);

  const THEME_COLOR = "#D48E00";

  useEffect(() => {
    const loadFix = async () => {
      const allFixes = await fixService.getFixes();
      const found = allFixes.find((f) => f.id === id);
      setFix(found || null);
      setLoading(false);
    };
    loadFix();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <StatusBar style="dark" />
        <Text className="text-gray-400">Loading details...</Text>
      </SafeAreaView>
    );
  }

  if (!fix) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <StatusBar style="dark" />
        <Text className="text-gray-400">Fix not found</Text>
      </SafeAreaView>
    );
  }

  const isUnlocked = fix.progress >= 1;

  const renderLockedHeader = () => (
    <View className="px-5 mt-4">
      {/* Title, Subtitle, Amount & Icon Row */}
      <View className="flex-row justify-between items-start mb-8">
        <View className="flex-1 mr-4">
          <Text className="text-[#1A1A1A] font-bold text-[24px] mb-1">
            {fix.title}
          </Text>
          <Text className="text-[#6B7280] text-[14px] mb-4">
            {fix.subtitle}
          </Text>
          <Text className="text-[#1A1A1A] font-bold text-[28px]">
            ₦{fix.amount}
          </Text>
        </View>
        <Image
          source={require("../../assets/images/fix1.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>

      {/* Progress Bar Area */}
      <View className="w-full">
        <View
          style={{
            width: 365,
            height: 10,
            borderRadius: 20,
            backgroundColor: "#FFF8E1",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: `${Math.max(fix.progress * 100, 2)}%`,
              height: 10,
              borderRadius: 20,
              backgroundColor: THEME_COLOR,
            }}
          />
        </View>
        <View className="flex-row justify-between mb-8">
          <Text className="text-[#9CA3AF] text-[13px] font-medium">
            {Math.round(fix.progress * 100)}%
          </Text>
          <Text className="text-[#9CA3AF] text-[13px] font-medium">
            {fix.daysLeft} days Left
          </Text>
        </View>
      </View>

      {/* Horizontal Line */}
      <View className="h-[1px] bg-[#EEEEEE] w-full mb-10" />
    </View>
  );

  const renderUnlockedHeader = () => (
    <View className="items-center px-5 mb-10">
      <View
        className="relative items-center justify-center mb-8"
        style={{ width: 220, height: 220 }}
      >
        <Image
          source={require("../../assets/images/success.png")}
          style={{ width: 220, height: 220, position: "absolute" }}
          resizeMode="contain"
        />
        <Image
          source={require("../../assets/images/fix2.png")}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
      </View>

      <View className="flex-row items-center mb-3">
        <Text className="text-[24px] mr-2">🎉</Text>
        <Text className="text-[#1A1A1A] font-bold text-[28px]">
          Wealth Unlocked
        </Text>
        <Text className="text-[24px] ml-2">🎉</Text>
      </View>

      <Text className="text-[#6B7280] text-center text-[14px] leading-[22px] px-4">
        Your <Text className="font-bold text-[#1A1A1A]">Fixed Wealth</Text> has
        been{" "}
        <Text className="font-bold text-[#1A1A1A]">unlocked successfully</Text>,
        your <Text className="font-bold text-[#1A1A1A]">"₦{fix.amount}"</Text>{" "}
        is sent into your Wealth Save account by {fix.endDate}.
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Review" showBack={true} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="py-4">
          {isUnlocked ? renderUnlockedHeader() : renderLockedHeader()}

          {/* Jagged Summary Card */}
          <View
            className="bg-[#F6F6F6] p-8 rounded-t-[24px] relative self-center"
            style={{
              width: 365,
              height: 380, // Increased to fit 7 rows
              borderColor: "#fefcfc40",
              borderWidth: 0.8,
              borderBottomWidth: 0,
            }}
          >
            <View className="flex-row justify-between mb-8">
              <View>
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Amount To Fix
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  ₦{fix.amount}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Lock Duration
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {fix.lockDuration}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-8">
              <View>
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Wealth Growth
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {fix.wealthGrowth}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Wealth from:
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {fix.source}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-8">
              <View>
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Method
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {fix.automationFrequency === "Manual"
                    ? "Manuel"
                    : "Automation"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  End Date
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {fix.endDate}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-8">
              <View>
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Wealth grows Into
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {fix.wealthGrowsInto}
                </Text>
              </View>
            </View>

            {/* Jagged Edge Bottom */}
            <View
              className="flex-row absolute -bottom-[10px] left-0 right-0 overflow-hidden"
              style={{ width: 365.1 }}
            >
              {Array.from({ length: 40 }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "white",
                    transform: [{ rotate: "45deg" }],
                    marginTop: 4,
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
