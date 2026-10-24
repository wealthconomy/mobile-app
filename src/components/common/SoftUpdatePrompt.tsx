import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { openStore } from "../../constants/appLinks";
import { formatDeadlineDate } from "../../utils/appVersion";

const PRIMARY = "#155D5F";
const BRAND_TEAL = "#008185";
const DARK = "#1A1A1A";

export interface SoftUpdatePromptProps {
  visible: boolean;
  currentVersion?: string | null;
  latestAppVersion?: string | null;
  updateDeadline?: string | null;
  updateMessage?: string | null;
  onDismiss: () => void;
}

/**
 * Dismissible overlay View with a dimmed background (not a native Modal).
 * Renders with a 250ms fade and slide-up animation (skipped when reduce motion is enabled).
 * Clipped ambient bubbles at the top of the card match AppInactivityLockModal.
 */
export const SoftUpdatePrompt: React.FC<SoftUpdatePromptProps> = ({
  visible,
  currentVersion,
  latestAppVersion,
  updateDeadline,
  updateMessage,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  // Check reduce-motion accessibility setting
  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!isMounted) return;
        setReduceMotion(enabled);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Animate on mount / visibility change
  useEffect(() => {
    if (!visible) return;

    if (reduceMotion) {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, reduceMotion, fadeAnim, slideAnim]);

  // Dismiss on Android hardware back button
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onDismiss();
      return true;
    });
    return () => sub.remove();
  }, [visible, onDismiss]);

  if (!visible) return null;

  const formattedDeadline = formatDeadlineDate(updateDeadline);
  const showVersionRow = Boolean(currentVersion && latestAppVersion);

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Clipped decorative bubbles inside top of card */}
          <View style={styles.bubbleContainer} pointerEvents="none">
            <View style={styles.cardBubbleTopRight} />
            <View style={styles.cardBubbleTopLeft} />
            <View style={styles.cardBubbleGold} />
          </View>

          {/* Central Teal Circle Icon (approx 72pt) with Ring */}
          <View style={styles.iconOuterRing}>
            <View style={styles.iconInnerCircle}>
              <Ionicons
                name="cloud-download-outline"
                size={36}
                color="#FFFFFF"
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title} maxFontSizeMultiplier={1.3}>
            A new version is available
          </Text>

          {/* Message */}
          <Text style={styles.message} maxFontSizeMultiplier={1.3}>
            {updateMessage || "Update to get the latest improvements and fixes."}
          </Text>

          {/* Version Flow Row (Current -> Latest) */}
          {showVersionRow && (
            <View style={styles.versionRow}>
              <View style={styles.versionPill}>
                <Text style={styles.versionPillText} maxFontSizeMultiplier={1.3}>
                  v{currentVersion}
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={PRIMARY}
                style={styles.versionArrow}
              />
              <View style={[styles.versionPill, styles.versionPillActive]}>
                <Text
                  style={styles.versionPillActiveText}
                  maxFontSizeMultiplier={1.3}
                >
                  v{latestAppVersion}
                </Text>
              </View>
            </View>
          )}

          {/* Amber deadline notice pill when deadline exists */}
          {formattedDeadline && (
            <View style={styles.deadlinePill}>
              <Text style={styles.deadlineText} maxFontSizeMultiplier={1.3}>
                Please update by {formattedDeadline}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => {
                openStore();
              }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Update now"
            >
              <Text style={styles.updateButtonText} maxFontSizeMultiplier={1.3}>
                Update now
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
                style={styles.buttonArrow}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.laterButton}
              onPress={onDismiss}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Later"
            >
              <Text style={styles.laterButtonText} maxFontSizeMultiplier={1.3}>
                Later
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90000,
    elevation: 90000,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 16,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  bubbleContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  cardBubbleTopRight: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${PRIMARY}12`,
  },
  cardBubbleTopLeft: {
    position: "absolute",
    top: -50,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${BRAND_TEAL}10`,
  },
  cardBubbleGold: {
    position: "absolute",
    top: 36,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 207, 101, 0.16)",
  },
  iconOuterRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${PRIMARY}14`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: `${PRIMARY}25`,
    marginBottom: 16,
  },
  iconInnerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    fontFamily: "KumbhSans_700Bold",
    color: DARK,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "KumbhSans_500Medium",
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  versionPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  versionPillText: {
    fontSize: 12,
    fontFamily: "KumbhSans_600SemiBold",
    color: "#6B7280",
  },
  versionArrow: {
    marginHorizontal: 8,
  },
  versionPillActive: {
    backgroundColor: "#E6F4F4",
  },
  versionPillActiveText: {
    fontSize: 12,
    fontFamily: "KumbhSans_700Bold",
    color: PRIMARY,
  },
  deadlinePill: {
    backgroundColor: "#FEF9C3",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  deadlineText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    fontFamily: "KumbhSans_600SemiBold",
    color: "#B45309",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 4,
    gap: 4,
  },
  updateButton: {
    backgroundColor: PRIMARY,
    width: "100%",
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "KumbhSans_700Bold",
  },
  buttonArrow: {
    marginLeft: 6,
  },
  laterButton: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  laterButtonText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "KumbhSans_700Bold",
  },
});
