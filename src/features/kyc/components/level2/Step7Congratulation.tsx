import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Level2Badge } from "./Level2Badge";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import Animated, {
  FadeInUp,
  FadeInDown,
  BounceIn,
} from "react-native-reanimated";
import { FountainConfetti, KycButton } from "@/src/components/common";


interface Step7CongratulationProps {
  onFinish: () => void;
}

const THEME_TEAL = "#155D5F";

export const Step7Congratulation: React.FC<Step7CongratulationProps> = ({
  onFinish,
}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Celebration Illustration Container exactly matching input_file_0.png */}
      <Animated.View
        entering={BounceIn.duration(800)}
        style={{
          width: 280,
          height: 280,
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 36,
          zIndex: 10,
        }}
      >
        {/* Fountain Confetti Layer bursting outward from (140, 140) right behind the popping badge */}
        <FountainConfetti particleCount={36} originX={140} originY={140} />

        {/* Exact Original Ribbons & Shards matching input_file_0.png */}
        <View style={{ position: "absolute", width: "100%", height: "100%", zIndex: 10 }}>
          <Svg width="100%" height="100%" viewBox="0 0 280 280" fill="none">
            {/* Top Left Green Spiral Ribbon */}
            <Path
              d="M60 40 C50 55 75 55 65 70"
              stroke="#1E7A52"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Top Right Green Spiral Ribbon */}
            <Path
              d="M210 40 C220 55 195 55 205 70"
              stroke="#1E7A52"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Bottom Left Green Spiral Ribbon */}
            <Path
              d="M70 210 C58 222 80 226 68 238"
              stroke="#1E7A52"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Bottom Right Green Spiral Ribbon */}
            <Path
              d="M210 210 C222 222 200 226 212 238"
              stroke="#1E7A52"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Dark Teal Triangle Shards */}
            <Path d="M90 60 L120 75 L115 50 Z" fill="#155D5F" />
            <Path d="M200 65 L225 70 L210 50 Z" fill="#155D5F" />
            <Path d="M100 200 L118 230 L126 195 Z" fill="#155D5F" />
            <Path d="M190 205 L218 220 L205 190 Z" fill="#155D5F" />

            {/* Gold Confetti Squiggles & Rectangles */}
            <Rect x="115" y="30" width="4" height="8" rx="2" fill="#F59E0B" transform="rotate(-20 115 30)" />
            <Rect x="180" y="45" width="4" height="12" rx="2" fill="#F59E0B" transform="rotate(35 180 45)" />
            <Rect x="68" y="90" width="4" height="8" rx="2" fill="#F59E0B" transform="rotate(15 68 90)" />
            <Rect x="230" y="105" width="4" height="10" rx="2" fill="#F59E0B" transform="rotate(-15 230 105)" />
            <Rect x="185" y="65" width="4" height="10" rx="2" fill="#F59E0B" transform="rotate(45 185 65)" />
            <Rect x="60" y="150" width="4" height="10" rx="2" fill="#F59E0B" transform="rotate(-35 60 150)" />
            <Rect x="230" y="160" width="4" height="12" rx="2" fill="#F59E0B" transform="rotate(25 230 160)" />
            <Rect x="135" y="215" width="4" height="10" rx="2" fill="#F59E0B" transform="rotate(-40 135 215)" />
            <Rect x="170" y="195" width="4" height="12" rx="2" fill="#F59E0B" transform="rotate(20 170 195)" />

            {/* Small Teal Dots */}
            <Circle cx="82" cy="130" r="2.5" fill="#155D5F" />
            <Circle cx="216" cy="138" r="2.5" fill="#155D5F" />
            <Circle cx="180" cy="148" r="2" fill="#F59E0B" />
          </Svg>
        </View>

        {/* Center Silver Medal Badge exactly matching input_file_0.png */}
        <View style={{ transform: [{ scale: 1.5 }], zIndex: 15 }}>
          <Level2Badge />
        </View>
      </Animated.View>

      {/* Title & Subtitle exactly matching input_file_0.png */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(200)}
        style={{ alignItems: "center", width: "100%", marginBottom: 40, zIndex: 10 }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: THEME_TEAL,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Congratulation
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#64748B",
            textAlign: "center",
            lineHeight: 24,
            paddingHorizontal: 16,
            fontWeight: "500",
          }}
        >
          You've completed the 2nd KYC,{"\n"}you're now enable to withdraw funds
        </Text>
      </Animated.View>

      {/* Let's Go! Action Button exactly matching input_file_0.png */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(400)}
        style={{ width: "100%", zIndex: 10 }}
      >
        <KycButton
          title="Let's Go!"
          onPress={onFinish}
          style={{
            width: "100%",
            shadowColor: THEME_TEAL,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 4,
          }}
        />
      </Animated.View>
    </View>
  );
};
