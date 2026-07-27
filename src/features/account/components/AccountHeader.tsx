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

    const formattedKycStatus = useMemo(() => {
      const level = kycLevel ?? user?.kycLevel ?? 1;
      const status = kycStatus ? ` • ${kycStatus}` : "";
      return `KYC level ${level}${status}`;
    }, [kycLevel, user?.kycLevel, kycStatus]);

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
                className="flex-row items-center bg-[#FFF1D6] px-2.5 py-1 rounded-full mt-1.5 self-start"
              >
                <Ionicons name="medal" size={12} color="#F59E0B" />
                <Text className="text-[10px] font-bold text-[#D97706] ml-1 capitalize">
                  {formattedKycStatus.toLowerCase()}
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
