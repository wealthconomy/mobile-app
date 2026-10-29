import { RootState } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useKycAutoRefresh } from "@/src/hooks/useKycAutoRefresh";
import {
  isLevel2Verified,
  isLevel2Rejected,
  isLevel2Pending,
  hasLevel2Uploads,
  isLevel3Verified,
  isLevel3Rejected,
  isLevel3Pending,
  hasLevel3AddressDoc,
  idDocStatus,
  faceDocStatus,
  idRejectionText,
  faceRejectionText,
} from "@/src/features/kyc/utils/kycState";

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
      height: 104,
      backgroundColor: "#FFCF6533",
    }}
  >
    <View className="flex-row justify-between items-start mb-1">
      <Text
        className="text-[#1A1A1A] font-kumbh-bold font-bold text-[14px] leading-tight flex-1 mr-2"
        numberOfLines={1}
        maxFontSizeMultiplier={1.35}
      >
        {title}
      </Text>
      <View className="mt-[-2px]">{icon}</View>
    </View>
    <Text
      className="text-[#4B5563] text-[13px] leading-[18px] font-kumbh-semibold pr-2"
      numberOfLines={2}
      maxFontSizeMultiplier={1.35}
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
  const { kycDocs } = useKycAutoRefresh();

  const l2Verified = isLevel2Verified(kycDocs, user);
  const l2Rejected = isLevel2Rejected(kycDocs, user);
  const l2Pending = isLevel2Pending(kycDocs, user);
  const l2Uploads = hasLevel2Uploads(kycDocs, user);

  const l3Verified = isLevel3Verified(kycDocs, user);
  const l3Rejected = isLevel3Rejected(kycDocs, user);
  const l3Pending = isLevel3Pending(kycDocs, user);
  const l3HasDoc = hasLevel3AddressDoc(kycDocs);

  const hasIdUpload = Boolean(kycDocs?.idImageUrl || user?.idImageUrl);
  const hasFaceUpload = Boolean(
    kycDocs?.faceImageUrl ||
    kycDocs?.selfieUrl ||
    user?.faceImageUrl ||
    user?.imageUrl ||
    kycDocs?.faceVerified
  );

  const currentKycLevel = l3Verified ? 3 : l2Verified ? 2 : 1;

  const userState = {
    kycLevel: currentKycLevel,
    isEmailVerified: true,
    hasFirstGoal: false,
    hasJoinedTribe: false,
    hasEnabledSecurity: false,
    hasFundedWallet: false,
  };

  const onboardingTasks = [];

  // 1. KYC Sequential Logic
  if (!l2Verified) {
    if (l2Rejected) {
      const isIdRejected = idDocStatus(kycDocs) === "REJECTED";
      const isFaceRejected = faceDocStatus(kycDocs) === "REJECTED";
      const idReason = isIdRejected ? idRejectionText(kycDocs) : null;
      const faceReason = isFaceRejected ? faceRejectionText(kycDocs) : null;
      const generalReason =
        idReason ||
        faceReason ||
        kycDocs?.kycRejectionReason ||
        kycDocs?.rejectionReason ||
        user?.kycRejectionReason;

      const specificReason =
        isIdRejected && isFaceRejected && idReason && faceReason && idReason !== faceReason
          ? `ID: ${idReason} | Face: ${faceReason}`
          : idReason || faceReason || generalReason || "Please review and resubmit your KYC documents";

      onboardingTasks.push({
        id: "kyc-rejected",
        title: "KYC Needs Attention",
        description: specificReason,
        icon: <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />,
        onPress: () => router.push("/kyc/level2-intro"),
        isComplete: false,
      });
    } else if (l2Pending) {
      onboardingTasks.push({
        id: "kyc-pending",
        title: "KYC Under Review",
        description: "Your documents are currently being verified by compliance",
        icon: <Ionicons name="time-outline" size={18} color="#D97706" />,
        onPress: () => router.push("/kyc/level2-intro"),
        isComplete: false,
      });
    } else if (!l2Uploads && (user?.kycStatus === "PENDING" || user?.kycStatus === "pending" || hasIdUpload || hasFaceUpload)) {
      onboardingTasks.push({
        id: "kyc-incomplete",
        title: "Complete KYC Level 2",
        description: !hasIdUpload
          ? "Upload your Government ID to complete verification"
          : "Complete your live face scan to finish verification",
        icon: <Ionicons name="alert-circle-outline" size={18} color="#D97706" />,
        onPress: () => router.push("/kyc/level2-intro"),
        isComplete: false,
      });
    } else {
      onboardingTasks.push({
        id: "kyc2",
        title: "Proceed to level 2",
        description: "Complete your KYC registration to enable withdrawal",
        icon: <Ionicons name="id-card-outline" size={18} color="#1A1A1A" />,
        onPress: () => router.push("/kyc/level2-intro"),
        isComplete: false,
      });
    }
  } else {
    // Level 2 is verified -> Level 3 cards
    if (l3Verified) {
      // Level 3 verified -> no KYC card
    } else if (l3Rejected) {
      onboardingTasks.push({
        id: "kyc3-rejected",
        title: "Address Needs Attention",
        description:
          kycDocs?.utilityRejectionReason ||
          user?.kycRejectionReason ||
          "Please review and resubmit your address document",
        icon: <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />,
        onPress: () => router.push("/kyc/level3-intro"),
        isComplete: false,
      });
    } else if (l3Pending) {
      onboardingTasks.push({
        id: "kyc3-pending",
        title: "Address Under Review",
        description: "Your Level 3 address documents are being verified",
        icon: <Ionicons name="time-outline" size={18} color="#D97706" />,
        onPress: () => router.push("/kyc/level3-intro"),
        isComplete: false,
      });
    } else if (!l3HasDoc) {
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
        <Text className="text-[#1A1A1A] font-bold text-lg" maxFontSizeMultiplier={1.35}>
          Todo
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5"
        contentContainerStyle={{ paddingHorizontal: 20 }}
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
