import React from "react";
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PRIMARY = "#155D5F";
const BRAND_TEAL = "#008185";
const GOLD = "#FFCF65";

interface UpdateBackdropProps {
  style?: ViewStyle;
  width?: number;
  height?: number;
}

export const UpdateBackdrop: React.FC<UpdateBackdropProps> = ({
  style,
  width = SCREEN_WIDTH,
  height = SCREEN_HEIGHT,
}) => {
  return (
    <View
      style={[StyleSheet.absoluteFillObject, styles.container, style]}
      pointerEvents="none"
    >
      {/* Top-Right Glowing Teal Ambient Bubble */}
      <View style={styles.topRightBubble} />

      {/* Bottom-Left Glowing Brand Teal Bubble */}
      <View style={styles.bottomLeftBubble} />

      {/* Mid-Left Faded Accent Bubble */}
      <View style={styles.midLeftBubble} />

      {/* Small Gold Accent Bubble */}
      <View style={styles.goldBubble} />

      {/* Center-Right Faded Accent Bubble */}
      <View style={styles.centerRightBubble} />

      {/* Fluid Ambient Wave Paths */}
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <LinearGradient
            id="updateWaveGrad1"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.10" />
            <Stop offset="100%" stopColor={BRAND_TEAL} stopOpacity="0.03" />
          </LinearGradient>
          <LinearGradient
            id="updateWaveGrad2"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={BRAND_TEAL} stopOpacity="0.07" />
            <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Top Diagonal Fluid Wave */}
        <Path
          d={`M-20,-20 Q${width * 0.4},${height * 0.18} ${width + 40},40 L${width + 40},-20 Z`}
          fill="url(#updateWaveGrad1)"
        />

        {/* Middle Flowing Wave */}
        <Path
          d={`M-30,${height * 0.45} Q${width * 0.5},${height * 0.35} ${width + 30},${height * 0.55} L${width + 30},${height * 0.72} Q${width * 0.4},${height * 0.65} -30,${height * 0.58} Z`}
          fill="url(#updateWaveGrad2)"
        />

        {/* Bottom Swooping Wave */}
        <Path
          d={`M-30,${height + 20} Q${width * 0.5},${height * 0.82} ${width + 30},${height + 20} Z`}
          fill="url(#updateWaveGrad1)"
        />

        {/* Soft Decorative Accent Circles */}
        <Circle
          cx={width * 0.85}
          cy={height * 0.22}
          r={32}
          fill={PRIMARY}
          fillOpacity="0.05"
        />
        <Circle
          cx={width * 0.12}
          cy={height * 0.68}
          r={44}
          fill={BRAND_TEAL}
          fillOpacity="0.04"
        />
        <Circle
          cx={width * 0.88}
          cy={height * 0.78}
          r={22}
          fill={PRIMARY}
          fillOpacity="0.06"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#FBFDFD",
  },
  topRightBubble: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: `${PRIMARY}12`, // ~7% opacity
  },
  bottomLeftBubble: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: `${BRAND_TEAL}10`, // ~6% opacity
  },
  midLeftBubble: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.22,
    left: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: `${PRIMARY}08`, // ~5% opacity
  },
  goldBubble: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.38,
    left: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 207, 101, 0.16)", // low-opacity gold (#FFCF65)
  },
  centerRightBubble: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.48,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${PRIMARY}08`,
  },
});
