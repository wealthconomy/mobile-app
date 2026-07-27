import React, { useEffect } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export interface BiometricTargetRingsProps {
  children?: React.ReactNode;
  showShimmer?: boolean;
}

export const BiometricTargetRings: React.FC<BiometricTargetRingsProps> = ({
  children,
  showShimmer = true,
}) => {
  const shimmerTranslateX = useSharedValue(-120);

  useEffect(() => {
    if (showShimmer) {
      shimmerTranslateX.value = withRepeat(
        withTiming(120, {
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false
      );
    }
  }, [showShimmer]);

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: shimmerTranslateX.value },
        { rotate: "35deg" },
      ],
    };
  });

  return (
    <View
      style={{
        width: 130,
        height: 130,
        borderRadius: 105,
        backgroundColor: "#EAF6F6",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 44,
      }}
    >
      {/* Ring 2: Light Teal Ring (174x174 -> 130x130 visually) */}
      <View
        style={{
          width: 130,
          height: 130,
          borderRadius: 87,
          backgroundColor: "#E8F4F5",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Ring 3: Medium Teal Ring (142x142 -> 109x109) */}
        <View
          style={{
            width: 109,
            height: 109,
            borderRadius: 71,
            backgroundColor: "#9CC8C9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Ring 4: Dark-Medium Teal Ring (114x114 -> 90x90) */}
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 57,
              backgroundColor: "#5B9A9C",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Ring 5: Inner Bullseye Core with #155D5F -> #2CC0C5 Gradient */}
            <LinearGradient
              colors={["#155D5F", "#155D5F", "#2CC0C5"]}
              locations={[0, 0.75, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 73,
                height: 73,
                borderRadius: 45,
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {showShimmer && (
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: -40,
                      left: -10,
                      width: 55,
                      height: 160,
                    },
                    shimmerAnimatedStyle,
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(255, 255, 255, 0)",
                      "rgba(255, 255, 255, 0.55)",
                      "rgba(255, 255, 255, 0)",
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              )}

              {/* White Corner Brackets inside Inner Circle */}
              <View
                style={{
                  width: 32.5,
                  height: 32.5,
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Top Left Bracket */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 13,
                    height: 13,
                    borderTopWidth: 2.2,
                    borderLeftWidth: 2.2,
                    borderColor: "white",
                    borderTopLeftRadius: 5,
                  }}
                />
                {/* Top Right Bracket */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 13,
                    height: 13,
                    borderTopWidth: 2.2,
                    borderRightWidth: 2.2,
                    borderColor: "white",
                    borderTopRightRadius: 5,
                  }}
                />
                {/* Bottom Left Bracket */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 13,
                    height: 13,
                    borderBottomWidth: 2.2,
                    borderLeftWidth: 2.2,
                    borderColor: "white",
                    borderBottomLeftRadius: 5,
                  }}
                />
                {/* Bottom Right Bracket */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 13,
                    height: 13,
                    borderBottomWidth: 2.2,
                    borderRightWidth: 2.2,
                    borderColor: "white",
                    borderBottomRightRadius: 5,
                  }}
                />
                {children}
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </View>
  );
};
