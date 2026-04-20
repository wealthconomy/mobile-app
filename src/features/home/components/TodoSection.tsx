import { RootState } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

interface TodoCardProps {
  title: string;
  description: string;
  isComplete?: boolean;
  onPress: () => void;
  icon: React.ReactNode;
}

const TodoCard = ({
  title,
  description,
  isComplete,
  onPress,
  icon,
}: TodoCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    className="rounded-[15px] p-4 mr-4 relative"
    style={{
      width: 218,
      height: 91,
      backgroundColor: "#FFCF6533",
    }}
  >
    <View className="flex-row justify-between items-start mb-1">
      <Text
        className="text-[#1A1A1A] font-bold text-[14px] leading-tight flex-1 mr-2"
        numberOfLines={1}
      >
        {title}
      </Text>
      <View className="mt-[-2px]">{icon}</View>
    </View>
    <Text
      className="text-[#64748B] text-[10px] leading-[14px] font-medium pr-2"
      numberOfLines={2}
    >
      {description}
    </Text>

    {/* Red dot status indicator at the tip of the card */}
    {!isComplete && (
      <View
        className="absolute w-3.5 h-3.5 rounded-full bg-[#FF4B4B] border-2 border-white shadow-sm"
        style={{ top: 0, right: -5, zIndex: 10 }}
      />
    )}
  </TouchableOpacity>
);

export const TodoSection = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const userState = {
    kycLevel: user?.kycLevel || 1,
    isEmailVerified: true,
    hasFirstGoal: false,
    hasJoinedTribe: false,
    hasEnabledSecurity: false,
    hasFundedWallet: false,
  };

  const onboardingTasks = [];

  // 1. KYC Sequential Logic
  if (userState.kycLevel === 1) {
    onboardingTasks.push({
      id: "kyc2",
      title: "Proceed to level 2",
      description: "Complete your KYC registration to enable withdrawal",
      icon: <Ionicons name="id-card-outline" size={18} color="#1A1A1A" />,
      onPress: () => router.push("/kyc/level2-intro"),
      isComplete: false,
    });
  } else if (userState.kycLevel === 2) {
    onboardingTasks.push({
      id: "kyc3",
      title: "Proceed to level 3",
      description: "Upgrade your account for higher limits and features",
      icon: (
        <Ionicons name="shield-checkmark-outline" size={18} color="#1A1A1A" />
      ),
      onPress: () => router.push("/kyc/level3-intro"),
      isComplete: false,
    });
  }

  // 2. Security
  if (!userState.hasEnabledSecurity) {
    onboardingTasks.push({
      id: "security",
      title: "Secure Your Account",
      description: "Enable biometrics or 2FA for extra safety",
      icon: <Ionicons name="finger-print-outline" size={18} color="#1A1A1A" />,
      onPress: () => router.push("/profile/security" as any),
      isComplete: false,
    });
  }

  // 4. Wallet Funding
  if (!userState.hasFundedWallet) {
    onboardingTasks.push({
      id: "fund",
      title: "Fund Your Wallet",
      description: "Make your first deposit to start building wealth",
      icon: <Ionicons name="wallet-outline" size={18} color="#1A1A1A" />,
      onPress: () => router.push("/wallet/deposit" as any),
      isComplete: false,
    });
  }

  // 5. First Goal
  if (!userState.hasFirstGoal) {
    onboardingTasks.push({
      id: "first-goal",
      title: "Set your first Goal",
      description: "Build the discipline to reach your financial goals",
      icon: <Ionicons name="flag-outline" size={18} color="#1A1A1A" />,
      onPress: () => router.push("/(tabs)/portfolios/wealth-goal" as any),
      isComplete: false,
    });
  }

  // 6. Join a Tribe
  if (!userState.hasJoinedTribe) {
    onboardingTasks.push({
      id: "join-tribe",
      title: "Join a Tribe",
      description: "Save and grow wealth with others in a community",
      icon: <Ionicons name="people-outline" size={18} color="#1A1A1A" />,
      onPress: () => router.push("/(tabs)/portfolios/wealth-group" as any),
      isComplete: false,
    });
  }

  if (onboardingTasks.length === 0) return null;

  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[#1A1A1A] font-bold text-lg">Todo</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 px-5"
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {onboardingTasks.map((task) => (
          <TodoCard
            key={task.id}
            title={task.title}
            description={task.description}
            onPress={task.onPress}
            isComplete={task.isComplete}
            icon={task.icon}
          />
        ))}
      </ScrollView>
    </View>
  );
};
