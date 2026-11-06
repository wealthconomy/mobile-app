import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  BackHandler,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { openStore } from "../../constants/appLinks";
import { UpdateBackdrop } from "./UpdateBackdrop";

const PRIMARY = "#155D5F";
const DARK = "#1A1A1A";

export interface UpdateRequiredModalProps {
  visible: boolean;
  message?: string | null;
  currentVersion?: string | null;
  requiredVersion?: string | null;
}

/**
 * Full-screen, absolutely positioned overlay View (not a native <Modal>).
 * Renders at the root of app/_layout.tsx with maximum zIndex/elevation.
 * Completely blocks touches to underlying views and blocks Android hardware back button.
 */
export const UpdateRequiredModal: React.FC<UpdateRequiredModalProps> = ({
  visible,
  message,
  currentVersion,
  requiredVersion,
}) => {
  // Block Android hardware back button while the overlay is visible
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [visible]);

  if (!visible) return null;

  const hasCurrentVersion = Boolean(currentVersion);
  const hasRequiredVersion = Boolean(requiredVersion);
  const showVersionCard = hasCurrentVersion || hasRequiredVersion;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <UpdateBackdrop />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FBFDFD" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Wealthconomy Round Logo in Ambient Glowing Double Ring */}
          <View style={styles.logoSection}>
            <View style={styles.outerRing}>
              <View style={styles.innerRing}>
                <Image
                  source={require("../../../assets/images/icon.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title} maxFontSizeMultiplier={1.3}>
            Update required
          </Text>

          {/* Message */}
          <Text style={styles.message} maxFontSizeMultiplier={1.3}>
            {message ||
              "A new version of Wealthconomy is required to continue."}
          </Text>

          {/* Version Comparison Card (2 Columns) */}
          {showVersionCard && (
            <View style={styles.versionCard}>
              {hasCurrentVersion && (
                <View style={styles.versionCol}>
                  <Text style={styles.versionLabel} maxFontSizeMultiplier={1.3}>
                    Your version
                  </Text>
                  <Text
                    style={styles.versionValueCurrent}
                    maxFontSizeMultiplier={1.3}
                  >
                    {currentVersion}
                  </Text>
                </View>
              )}

              {hasCurrentVersion && hasRequiredVersion && (
                <View style={styles.versionDivider} />
              )}

              {hasRequiredVersion && (
                <View style={styles.versionCol}>
                  <Text style={styles.versionLabel} maxFontSizeMultiplier={1.3}>
                    Latest version
                  </Text>
                  <Text
                    style={styles.versionValueRequired}
                    maxFontSizeMultiplier={1.3}
                  >
                    {requiredVersion}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Full-width Primary Update Button */}
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
              size={18}
              color="#FFFFFF"
              style={styles.buttonArrow}
            />
          </TouchableOpacity>

          {/* Small Footer Notice */}
          <Text style={styles.footerText} maxFontSizeMultiplier={1.3}>
            Your data is safe. Updating takes less than a minute.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    elevation: 999999,
    backgroundColor: "#FBFDFD",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: "100%",
  },
  logoSection: {
    marginBottom: 24,
    alignItems: "center",
  },
  outerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${PRIMARY}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: `${PRIMARY}25`,
  },
  innerRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    fontFamily: "KumbhSans_700Bold",
    color: DARK,
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
    fontFamily: "KumbhSans_500Medium",
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 22,
  },
  versionCard: {
    width: "100%",
    maxWidth: 330,
    flexDirection: "row",
    backgroundColor: "#F0F9F9",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: `${PRIMARY}20`,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  versionCol: {
    flex: 1,
    alignItems: "center",
  },
  versionDivider: {
    width: 1,
    height: 32,
    backgroundColor: `${PRIMARY}25`,
  },
  versionLabel: {
    fontSize: 12,
    fontFamily: "KumbhSans_600SemiBold",
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  versionValueCurrent: {
    fontSize: 15,
    fontFamily: "KumbhSans_700Bold",
    fontWeight: "700",
    color: DARK,
  },
  versionValueRequired: {
    fontSize: 15,
    fontFamily: "KumbhSans_700Bold",
    fontWeight: "700",
    color: PRIMARY,
  },
  updateButton: {
    backgroundColor: PRIMARY,
    width: "100%",
    maxWidth: 330,
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "KumbhSans_700Bold",
  },
  buttonArrow: {
    marginLeft: 8,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "KumbhSans_500Medium",
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 18,
  },
});
