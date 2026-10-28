import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface PasscodeKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear?: () => void;
  disabled?: boolean;
  leftSlot?: React.ReactNode;
}

const DIGIT_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

export const PasscodeKeypad: React.FC<PasscodeKeypadProps> = ({
  onDigit,
  onBackspace,
  onClear,
  disabled = false,
  leftSlot,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompact = windowHeight <= 700;
  const keyHeight = isCompact ? 44 : 52;
  const bottomInset = Math.max(insets.bottom, 0);

  return (
    <View
      style={[
        styles.panel,
        {
          paddingBottom: bottomInset + 8,
        },
      ]}
      accessible={false}
    >
      {DIGIT_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((digit) => (
            <Pressable
              key={digit}
              onPressIn={() => {
                if (!disabled) onDigit(digit);
              }}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={digit}
              style={styles.keyPressable}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.digitKey,
                    {
                      height: keyHeight,
                      backgroundColor:
                        pressed && !disabled ? "#C9CDD3" : "#FFFFFF",
                    },
                    disabled && styles.disabledKey,
                  ]}
                >
                  <Text style={styles.digitText} maxFontSizeMultiplier={1.2}>
                    {digit}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      ))}

      {/* Row 4: [leftSlot / empty] [0] [backspace] */}
      <View style={styles.row}>
        {/* Left cell (stays empty by default) */}
        <View style={styles.keyPressable}>
          {leftSlot ? (
            <View style={[styles.backspaceKey, { height: keyHeight }]}>
              {leftSlot}
            </View>
          ) : (
            <View style={{ height: keyHeight }} />
          )}
        </View>

        {/* Center cell ("0") */}
        <Pressable
          onPressIn={() => {
            if (!disabled) onDigit("0");
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="0"
          style={styles.keyPressable}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.digitKey,
                {
                  height: keyHeight,
                  backgroundColor:
                    pressed && !disabled ? "#C9CDD3" : "#FFFFFF",
                },
                disabled && styles.disabledKey,
              ]}
            >
              <Text style={styles.digitText} maxFontSizeMultiplier={1.2}>
                0
              </Text>
            </View>
          )}
        </Pressable>

        {/* Right cell (Backspace / Clear) */}
        <Pressable
          onPressIn={() => {
            if (!disabled) onBackspace();
          }}
          onLongPress={() => {
            if (!disabled && onClear) onClear();
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Delete"
          style={styles.keyPressable}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.backspaceKey,
                {
                  height: keyHeight,
                  backgroundColor:
                    pressed && !disabled ? "#C9CDD3" : "transparent",
                },
                disabled && styles.disabledKey,
              ]}
            >
              <Ionicons name="backspace-outline" size={26} color="#1A1A1A" />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    backgroundColor: "#D8DBE0",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 6,
    paddingTop: 8,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  keyPressable: {
    flex: 1,
  },
  digitKey: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  backspaceKey: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  digitText: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "KumbhSans_600SemiBold",
    color: "#1A1A1A",
  },
  disabledKey: {
    opacity: 0.35,
  },
});
