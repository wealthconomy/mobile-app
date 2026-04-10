import { useEffect } from "react";
import { ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  circle?: boolean;
  color?: string;
}

const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
  circle,
  color = "#F3F4F6",
}: SkeletonProps) => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
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

  return <Animated.View style={[shapeStyle, animatedStyle, style]} />;
};

export default Skeleton;
