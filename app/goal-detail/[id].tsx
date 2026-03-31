// import { goalService, WealthGoal } from "@/src/api/goalService";

// Re-defining interface for local use
export interface WealthGoal {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  saved: string;
  progress: number;
  daysLeft: number;
  endDate: string;
  hasUpdate?: boolean;
  isCompleted?: boolean;
  automationFrequency: "Daily" | "Weekly" | "Monthly" | "Manual" | "One-time";
  source: string;
}

// Minimal in-memory service for the detail page
const goalService = {
  getGoals: async (): Promise<WealthGoal[]> => {
    // Including same mocks for detail lookup
    const mockActive: WealthGoal[] = [
      {
        id: "mock-1",
        title: "Buy a Mac",
        subtitle: "Business",
        amount: "1,500,000.00",
        saved: "250,500.00",
        progress: 0.16,
        daysLeft: 120,
        endDate: "24th July 2026",
        automationFrequency: "Monthly",
        source: "Wealth Flex",
      },
      {
        id: "mock-3",
        title: "New Laptop",
        subtitle: "Education",
        amount: "500,000.00",
        saved: "350,000.00",
        progress: 0.7,
        daysLeft: 45,
        endDate: "15th May 2026",
        automationFrequency: "Weekly",
        source: "Bank Account",
      },
      {
        id: "mock-4",
        title: "Emergency Fund",
        subtitle: "Savings",
        amount: "2,000,000.00",
        saved: "1,200,000.00",
        progress: 0.6,
        daysLeft: 200,
        endDate: "30th Oct 2026",
        automationFrequency: "Monthly",
        source: "Wealth Save",
      },
      {
        id: "mock-5",
        title: "Wedding Prep",
        subtitle: "Personal",
        amount: "5,000,000.00",
        saved: "500,000.00",
        progress: 0.1,
        daysLeft: 300,
        endDate: "12th Feb 2027",
        automationFrequency: "Monthly",
        source: "Wealth Flex",
      },
      {
        id: "mock-6",
        title: "Car Downpayment",
        subtitle: "Personal",
        amount: "3,000,000.00",
        saved: "1,500,000.00",
        progress: 0.5,
        daysLeft: 90,
        endDate: "30th June 2026",
        automationFrequency: "Monthly",
        source: "Wealth Save",
      },
    ];
    const mockCompleted: WealthGoal[] = [
      {
        id: "mock-2",
        title: "Summer Vacation",
        subtitle: "Vacation",
        amount: "800,000.00",
        saved: "800,000.00",
        progress: 1,
        daysLeft: 0,
        endDate: "12th Dec 2025",
        automationFrequency: "Monthly",
        source: "Wealth Save",
        isCompleted: true,
      },
      {
        id: "mock-7",
        title: "Rent 2025",
        subtitle: "Rent",
        amount: "1,200,000.00",
        saved: "1,200,000.00",
        progress: 1,
        daysLeft: 0,
        endDate: "1st Jan 2025",
        automationFrequency: "Monthly",
        source: "Wealth Flex",
        isCompleted: true,
      },
      {
        id: "mock-8",
        title: "Side Project",
        subtitle: "Business",
        amount: "200,000.00",
        saved: "200,000.00",
        progress: 1,
        daysLeft: 0,
        endDate: "15th Nov 2024",
        automationFrequency: "One-time",
        source: "Wealth Save",
        isCompleted: true,
      },
      {
        id: "mock-9",
        title: "Courses",
        subtitle: "Education",
        amount: "50,000.00",
        saved: "50,000.00",
        progress: 1,
        daysLeft: 0,
        endDate: "10th Oct 2024",
        automationFrequency: "Daily",
        source: "Wealth Flex",
        isCompleted: true,
      },
    ];
    return [...mockActive, ...mockCompleted];
  },
  updateGoal: async () => {},
};
import Header from "@/src/components/common/Header";
import { Trophy } from "@/src/components/icons/Trophy";
import { ThemedButton } from "@/src/components/ThemedButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [goal, setGoal] = useState<WealthGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGoal = async () => {
      const allGoals = await goalService.getGoals();
      const found = allGoals.find((g) => g.id === id);
      setGoal(found || null);
      setLoading(false);
    };
    loadGoal();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <StatusBar style="dark" />
        <Text className="text-gray-400">Loading goal details...</Text>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <StatusBar style="dark" />
        <Text className="text-gray-400">Goal not found</Text>
        <ThemedButton
          title="Go Back"
          onPress={() => router.back()}
          className="mt-4 px-10"
        />
      </SafeAreaView>
    );
  }

  const isCompleted = goal.isCompleted;

  const renderActiveHeader = () => (
    <View className="px-5 mt-4">
      {/* Stacked Info and Side Arrow */}
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-1 mr-4">
          <Text className="text-[#1A1A1A] font-bold text-[24px] mb-1">
            {goal.title}
          </Text>
          <Text className="text-[#6B7280] text-[14px] mb-4">
            {goal.subtitle}
          </Text>
          <Text className="text-[#1A1A1A] font-bold text-[28px]">
            ₦{goal.saved}
          </Text>
        </View>
        <Image
          source={require("../../assets/images/arrow.png")}
          style={{ width: 120, height: 100 }}
          resizeMode="contain"
        />
      </View>

      {/* Full Width Progress Bar and Labels */}
      <View className="w-full">
        <View
          style={{
            width: 365,
            height: 10,
            borderRadius: 20,
            backgroundColor: "#FFEEF7",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: `${Math.max(goal.progress * 100, 2)}%`,
              height: 10,
              borderRadius: 20,
              backgroundColor: "#FA85C0",
            }}
          />
        </View>
        <View className="flex-row justify-between mb-8">
          <Text className="text-[#9CA3AF] text-[13px] font-medium">
            {Math.round(goal.progress * 100)}%
          </Text>
          <Text className="text-[#9CA3AF] text-[13px] font-medium">
            {goal.daysLeft} days Left
          </Text>
        </View>
      </View>

      {/* Horizontal Line after percent and days */}
      <View className="h-[1px] bg-[#EEEEEE] w-full mb-10" />
    </View>
  );

  const renderCompletedHeader = () => (
    <View className="items-center px-5 mb-10 mt-4">
      <View className="relative items-center justify-center mb-8">
        <Image
          source={require("../../assets/images/success.png")}
          style={{ width: 220, height: 220 }}
          resizeMode="contain"
        />
        <View className="absolute">
          <Trophy size={130} />
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <Text className="text-[24px] mr-2">🎉</Text>
        <Text className="text-[#1A1A1A] font-bold text-[36px]">
          Congratulation
        </Text>
        <Text className="text-[24px] ml-2">🎉</Text>
      </View>

      <Text className="text-[#6B7280] text-center text-[14px] leading-[22px] px-4">
        Your <Text className="font-bold text-[#1A1A1A]">Wealth Goal</Text> as
        been{" "}
        <Text className="font-bold text-[#1A1A1A]">achieved successfully</Text>,
        your <Text className="font-bold text-[#1A1A1A]">"₦{goal.amount}"</Text>{" "}
        has been deposited into your Wealth Save account by {goal.endDate}.
      </Text>
    </View>
  );

  const formatAmount = (val: string | number) => {
    if (!val) return "0.00";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="Review" showBack={true} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="py-4">
          {isCompleted ? renderCompletedHeader() : renderActiveHeader()}

          {/* Jagged Receipt Card */}
          <View
            className="bg-[#F6F6F6] p-8 rounded-t-[24px] relative self-center"
            style={{
              width: 365,
              height: 310,
              borderColor: "#fefcfc40",
              borderWidth: 0.8,
              borderBottomWidth: 0,
            }}
          >
            <View className="flex-row justify-between mb-8">
              <View>
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Target Amount
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  ₦{formatAmount(goal.amount)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Category
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {goal.subtitle}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-8">
              <View>
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Wealth Growth
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  ₦2,463,00
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  End Date
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {goal.endDate}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-8">
              <View>
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Automation Frequency
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {goal.automationFrequency || "Monthly"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Method
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {goal.automationFrequency === "Manual"
                    ? "Manuel"
                    : "Automation"}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-8">
              <View>
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Funding Source
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  {goal.source || "WinUp"}
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

          {/* Removed Action Buttons */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActivityItem({ title, date, amount, type, isSuccess }: any) {
  const color = isSuccess || type === "deposit" ? "#4CAF50" : "#F3007A";

  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-[#F8F8F8] rounded-full items-center justify-center mr-3">
          <MaterialCommunityIcons
            name={
              isSuccess
                ? "check-circle"
                : type === "deposit"
                  ? "arrow-down-left"
                  : "arrow-up-right"
            }
            size={20}
            color={color}
          />
        </View>
        <View>
          <Text className="text-[#1A1A1A] font-bold text-sm tracking-tight">
            {title}
          </Text>
          <Text className="text-[#64748B] text-[10px] opacity-60">{date}</Text>
        </View>
      </View>
      <Text style={{ color }} className="font-bold text-[14px]">
        {type === "deposit" ? "+" : "-"}₦{amount}
      </Text>
    </View>
  );
}
