import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  circle?: boolean;
}

const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
  circle,
}: SkeletonProps) => {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const translateX = useSharedValue(-1);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: w } = event.nativeEvent.layout;
    setLayoutWidth(w);
    translateX.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            translateX.value,
            [-1, 1],
            [-layoutWidth, layoutWidth],
          ),
        },
      ],
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
    backgroundColor: "#F3F4F6", // Gray 100 - cleaner base
    overflow: "hidden",
  };

  return (
    <View style={[shapeStyle, style]} onLayout={onLayout}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(255, 255, 255, 0.6)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export default Skeleton;
