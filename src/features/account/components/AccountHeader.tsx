import { Skeleton } from "@/src/components/common/skeletons";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface AccountHeaderProps {
  user: any;
  kycLevel?: number;
  kycStatus?: string;
  loading?: boolean;
  onPressKyc?: () => void;
}

export const AccountHeader = React.memo(
  ({
    user,
    kycLevel,
    kycStatus,
    loading,
    onPressKyc,
  }: AccountHeaderProps) => {
    const displayName = useMemo(() => {
      if (!user) return "Hi, WealthBuilder";
      if (user.firstName) {
        return `Hi, ${user.firstName}`;
      }
      if (user.name) {
        const firstWord = user.name.split(" ")[0];
        return `Hi, ${firstWord}`;
      }
      return user.username ? `Hi, ${user.username}` : "Hi, WealthBuilder";
    }, [user]);

    const hasImage = Boolean(user?.imageUrl || user?.profilePicture);

    const avatarUrl = useMemo(() => {
      if (hasImage) {
        return { uri: user?.imageUrl || user?.profilePicture };
      }
      return null;
    }, [user, hasImage]);

    const initials = useMemo(() => {
      if (!user) return "U";
      const first =
        user.firstName?.[0] || user.name?.[0] || user.username?.[0] || "U";
      const last = user.lastName?.[0] || "";
      return (first + last).toUpperCase();
    }, [user]);

    const isPending =
      kycStatus?.toUpperCase() === "PENDING" ||
      kycStatus?.toLowerCase() === "pending";
    const isVerified =
      kycStatus?.toUpperCase() === "VERIFIED" ||
      kycStatus?.toUpperCase() === "APPROVED";
    const isRejected =
      kycStatus?.toUpperCase() === "REJECTED";

    const formattedKycStatus = useMemo(() => {
      const level = kycLevel ?? user?.kycLevel ?? 1;
      if (isPending) {
        return `KYC level ${level} • In Review`;
      }
      if (isVerified) {
        return `KYC level ${level} • Verified`;
      }
      if (isRejected) {
        return `KYC level ${level} • Action Required`;
      }
      return `KYC level ${level}`;
    }, [kycLevel, user?.kycLevel, isPending, isVerified, isRejected]);

    const badgeBg = isVerified
      ? "#DCFCE7"
      : isRejected
      ? "#FEF2F2"
      : isPending
      ? "#FEF9C3"
      : "#FFF1D6";

    const badgeColor = isVerified
      ? "#166534"
      : isRejected
      ? "#DC2626"
      : isPending
      ? "#854D0E"
      : "#D97706";

    const iconColor = isVerified
      ? "#16A34A"
      : isRejected
      ? "#DC2626"
      : isPending
      ? "#CA8A04"
      : "#F59E0B";

    return (
      <Animated.View
        entering={FadeInUp.duration(600).delay(100)}
        className="flex-row items-center mb-8"
      >
        {loading ? (
          <Skeleton width={64} height={64} circle />
        ) : hasImage && avatarUrl ? (
          <View className="w-16 h-16 rounded-full border-2 border-white shadow-sm overflow-hidden bg-[#E0F2F1]">
            <Image source={avatarUrl} className="w-full h-full" />
          </View>
        ) : (
          <View className="w-16 h-16 rounded-full border-2 border-white shadow-sm overflow-hidden bg-[#155D5F] items-center justify-center">
            <Text className="text-white text-[22px] font-extrabold tracking-wider">
              {initials}
            </Text>
          </View>
        )}
        <View className="ml-4 flex-1">
          {loading ? (
            <View className="space-y-2">
              <Skeleton width={100} height={20} />
              <Skeleton width={80} height={24} borderRadius={12} />
            </View>
          ) : (
            <>
              <Text className="text-[20px] font-extrabold text-[#323232]">
                {displayName}
              </Text>
              <TouchableOpacity
                onPress={onPressKyc}
                activeOpacity={0.8}
                style={{ backgroundColor: badgeBg }}
                className="flex-row items-center px-2.5 py-1 rounded-full mt-1.5 self-start"
              >
                <Ionicons name="medal" size={12} color={iconColor} />
                <Text
                  style={{ color: badgeColor }}
                  className="text-[10px] font-bold ml-1"
                >
                  {formattedKycStatus}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    );
  }
);

AccountHeader.displayName = "AccountHeader";
