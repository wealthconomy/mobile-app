import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  circle?: boolean;
  color?: string;
  shimmerColor?: string;
}

const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
  circle,
  color = "#F3F4F6", // Lighter gray
  shimmerColor = "rgba(255,255,255,0.3)",
}: SkeletonProps) => {
  const shimmerValue = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(SCREEN_WIDTH, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerValue.value }],
    };
  });

  const shapeStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    borderRadius: circle
      ? typeof height === "number"
        ? height / 2
        : 999
      : borderRadius,
    backgroundColor: color,
    overflow: "hidden",
  };

  return (
    <View style={[shapeStyle, style]}>
      <AnimatedLinearGradient
        colors={["transparent", shimmerColor, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          StyleSheet.absoluteFill,
          animatedStyle,
          { width: SCREEN_WIDTH },
        ]}
      />
    </View>
  );
};

export default Skeleton;
