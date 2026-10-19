import React, { useEffect } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const BRAND_CONFETTI_COLORS = [
  "#F59E0B", // Wealth Gold / Amber
  "#D97706", // Deep Amber
  "#155D5F", // Brand Primary Deep Teal
  "#1E7A52", // Emerald Ribbon Green
  "#2CC0C5", // Vibrant Cyan Core Glow
  "#38BEC9", // Mint Cyan
];

export interface FountainConfettiPieceProps {
  index: number;
  originX?: number;
  originY?: number;
}

export const FountainConfettiPiece: React.FC<FountainConfettiPieceProps> = ({
  index,
  originX = 140,
  originY = 140,
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  // Deterministic burst angles & physics parameters
  const angle = ((index * 37) % 360) * (Math.PI / 180);
  const burstDistanceX = Math.cos(angle) * (60 + ((index * 19) % 110));
  // Ensure the pop shoots upward first (negative Y) or outward across top hemisphere
  const burstUpwardY = -((index * 29) % 160) - 70;
  const fallTargetY = SCREEN_HEIGHT * 0.75;
  const totalCycleDuration = 2800 + ((index * 97) % 1200);
  const delay = (index * 47) % 900;
  const size = 7 + (index % 8);
  const color = BRAND_CONFETTI_COLORS[index % BRAND_CONFETTI_COLORS.length];
  const shapeType = index % 4; // 0: Ribbon, 1: Dot, 2: Diamond shard, 3: Squiggle

  useEffect(() => {
    // 1. Scale pop from 0 to full, runs ONCE
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1 + (index % 3) * 0.15, { damping: 12, stiffness: 120 }),
        withTiming(0.9, { duration: totalCycleDuration - 600 })
      )
    );

    // 2. Opacity fades in fast, stays during fall, fades out at bottom, runs ONCE
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 180 }),
        withTiming(1, { duration: totalCycleDuration - 680 }),
        withTiming(0, { duration: 500 })
      )
    );

    // 3. Y Trajectory: Explosive UPWARD pop first (550ms), then natural gravity apex & tumbling fall, runs ONCE
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(burstUpwardY, {
          duration: 550,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(fallTargetY, {
          duration: totalCycleDuration - 550,
          easing: Easing.in(Easing.quad),
        })
      )
    );

    // 4. X Trajectory: Shoot outward horizontally first, then flutter side-to-side while falling, runs ONCE
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(burstDistanceX, {
          duration: 550,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(burstDistanceX + ((index % 2 === 0 ? 1 : -1) * 35), {
          duration: (totalCycleDuration - 550) * 0.5,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(burstDistanceX - ((index % 2 === 0 ? 1 : -1) * 25), {
          duration: (totalCycleDuration - 550) * 0.5,
          easing: Easing.inOut(Easing.sin),
        })
      )
    );

    // 5. 3D Tumbling Paper Rotation, runs ONCE
    rotation.value = withDelay(
      delay,
      withTiming(1080 + ((index % 4) * 360), {
        duration: totalCycleDuration,
        easing: Easing.linear,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: originX - size / 2,
      top: originY - size / 2,
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {shapeType === 0 && (
        <View
          style={{
            width: size * 0.55,
            height: size * 1.8,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      )}
      {shapeType === 1 && (
        <View
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2,
          }}
        />
      )}
      {shapeType === 2 && (
        <View
          style={{
            width: size * 1.1,
            height: size * 1.1,
            backgroundColor: color,
            transform: [{ rotate: "45deg" }],
            borderRadius: 2,
          }}
        />
      )}
      {shapeType === 3 && (
        <View
          style={{
            width: size * 1.4,
            height: 3.5,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      )}
    </Animated.View>
  );
};

export interface FountainConfettiProps {
  particleCount?: number;
  originX?: number;
  originY?: number;
  containerWidth?: number;
  containerHeight?: number;
}

export const FountainConfetti: React.FC<FountainConfettiProps> = ({
  particleCount = 36,
  originX = 140,
  originY = 140,
  containerWidth = 280,
  containerHeight = 280,
}) => {
  const confettiIndices = Array.from({ length: particleCount }).map((_, i) => i);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: containerWidth,
        height: containerHeight,
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {confettiIndices.map((index) => (
        <FountainConfettiPiece key={index} index={index} originX={originX} originY={originY} />
      ))}
    </View>
  );
};
