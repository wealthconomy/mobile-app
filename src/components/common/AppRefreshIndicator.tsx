import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Text,
  View,
} from "react-native";

interface AppRefreshIndicatorProps {
  refreshing: boolean;
  label?: string;
  topOffset?: number;
}

const THEME = "#155D5F";

export function AppRefreshIndicator({
  refreshing,
  label = "Refreshing...",
  topOffset,
}: AppRefreshIndicatorProps) {
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const defaultTop = topOffset ?? (Platform.OS === "ios" ? 56 : 42);

  useEffect(() => {
    if (refreshing) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 70,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [refreshing]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: defaultTop,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 9999,
        elevation: 12,
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          paddingVertical: 9,
          paddingHorizontal: 16,
          borderRadius: 30,
          borderWidth: 1.5,
          borderColor: "#A7D7D8",
          shadowColor: "#155D5F",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.16,
          shadowRadius: 12,
          elevation: 8,
          gap: 10,
        }}
      >
        <ActivityIndicator size="small" color={THEME} />
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: THEME,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}
