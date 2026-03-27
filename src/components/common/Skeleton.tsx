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
}

const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
  circle,
}: SkeletonProps) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const shapeStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    borderRadius: circle
      ? typeof height === "number"
        ? height / 2
        : 999
      : borderRadius,
    backgroundColor: "#E5E7EB", // Tailwind gray-200
  };

  return <Animated.View style={[shapeStyle, animatedStyle, style]} />;
};

export default Skeleton;
