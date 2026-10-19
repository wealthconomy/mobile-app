import React from "react";
import Skeleton from "./Skeleton";
import { ViewStyle } from "react-native";

interface AvatarSkeletonProps {
  size?: number;
  style?: ViewStyle;
}

const AvatarSkeleton = ({ size = 48, style }: AvatarSkeletonProps) => {
  return <Skeleton width={size} height={size} circle style={style} />;
};

export default AvatarSkeleton;
