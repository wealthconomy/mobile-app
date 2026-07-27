import { Skeleton } from "@/src/components/common/skeletons";
import { Text } from "@/src/components/common/ui/Text";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface SupportCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: React.ReactNode;
  avatars?: React.ReactNode;
  loading?: boolean;
}

const SupportCard = ({
  title,
  subtitle,
  onPress,
  icon,
  avatars,
  loading,
}: SupportCardProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    disabled={loading}
    className="w-[48%] min-h-[70px] bg-[#EEF7F8] rounded-[20px] border-[1px] border-[#94BDBD80] flex-row p-3"
  >
    {loading ? (
      <View className="flex-1 justify-center">
        <Skeleton width="80%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={8} />
        {avatars && (
          <View className="mt-1">
            <Skeleton width={40} height={10} borderRadius={5} />
          </View>
        )}
      </View>
    ) : (
      <>
        <View className="flex-1 justify-between">
          <View>
            <Text
              variant="caption"
              className="font-kumbh-bold text-[#323232] leading-[18px]"
            >
              {title}
            </Text>
          </View>
          <View className="mt-1">
            {subtitle ? (
              <Text variant="small" className="text-[#6B7280]">
                {subtitle}
              </Text>
            ) : null}
            {avatars ? <View>{avatars}</View> : null}
          </View>
        </View>
        <View className="justify-center items-end ml-1">{icon}</View>
      </>
    )}
  </TouchableOpacity>
);

export default SupportCard;
