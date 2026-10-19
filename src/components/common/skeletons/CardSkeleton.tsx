import React from "react";
import { View, ViewStyle } from "react-native";
import Skeleton from "./Skeleton";

interface CardSkeletonProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

const CardSkeleton = ({ style, children }: CardSkeletonProps) => {
  return (
    <View
      className="bg-white rounded-[20px] p-4 border border-[#E5E7EB]"
      style={style}
    >
      {children ? (
        children
      ) : (
        <View className="space-y-4">
          <Skeleton width="100%" height={150} borderRadius={12} />
          <View className="space-y-2">
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={14} />
          </View>
        </View>
      )}
    </View>
  );
};

export default CardSkeleton;
