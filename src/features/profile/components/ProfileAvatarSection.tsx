import KycIcon from "@/src/components/common/KycIcon";
import { Skeleton } from "@/src/components/common/skeletons";
import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface ProfileAvatarSectionProps {
  user: any;
  kycLevel?: number;
  loading?: boolean;
  uploading?: boolean;
  onPressPhoto: () => void;
}

export const ProfileAvatarSection = memo(
  ({
    user,
    kycLevel,
    loading,
    uploading,
    onPressPhoto,
  }: ProfileAvatarSectionProps) => {
    const displayName = useMemo(() => {
      if (!user) return "WealthBuilder";
      const first = user.firstName || "";
      const last = user.lastName || "";
      if (first || last) return `${first} ${last}`.trim();
      return user.name || user.username || "WealthBuilder";
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

    const displayKycLevel = kycLevel ?? user?.kycLevel ?? 1;

    return (
      <Animated.View
        entering={FadeInUp.duration(700).delay(100)}
        className="items-center mb-8"
      >
        <TouchableOpacity
          onPress={onPressPhoto}
          activeOpacity={0.8}
          disabled={uploading || loading}
          className="relative"
        >
          {loading ? (
            <Skeleton width={96} height={96} circle />
          ) : (
            <View className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-[#155D5F] items-center justify-center">
              {hasImage && avatarUrl ? (
                <Image source={avatarUrl} className="w-full h-full" />
              ) : (
                <Text className="text-white text-[32px] font-extrabold tracking-wider">
                  {initials}
                </Text>
              )}
              {uploading && (
                <View className="absolute inset-0 bg-black/40 items-center justify-center">
                  <ActivityIndicator color="white" size="small" />
                </View>
              )}
            </View>
          )}

          {!loading && (
            <View className="absolute bottom-0 right-0 bg-[#155D5F] w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm">
              <Ionicons name="camera-outline" size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {loading ? (
          <View className="mt-4">
            <Skeleton width={140} height={24} />
          </View>
        ) : (
          <Text className="text-[20px] font-extrabold text-[#323232] mt-4">
            {displayName}
          </Text>
        )}

        {loading ? (
          <View className="mt-2">
            <Skeleton width={100} height={28} borderRadius={14} />
          </View>
        ) : (
          <View className="flex-row items-center bg-[#FFF1D6] px-3 py-1.5 rounded-full mt-2 gap-x-1.5">
            <KycIcon />
            <Text className="text-[12px] font-bold text-[#D97706]">
              KYC level {displayKycLevel}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  },
);

ProfileAvatarSection.displayName = "ProfileAvatarSection";
