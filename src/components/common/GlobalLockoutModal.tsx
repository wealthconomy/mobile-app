import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { clearLockout, LockoutType } from "../../store/slices/appStatusSlice";
import { logout } from "../../store/slices/authSlice";
import { UpdateBackdrop } from "./UpdateBackdrop";

/**
 * Dev-only lockout override:
 * Set to "MAINTENANCE" | "SUSPENDED" | "BLOCKED" to preview each state without
 * modifying server settings or database records.
 * Only applied when __DEV__ is true. Must remain null in release builds.
 */
export const DEV_FORCE_LOCKOUT: "MAINTENANCE" | "SUSPENDED" | "BLOCKED" | null =
  null;

const SUPPORT_EMAIL = "support@wealthconomy.com";
const SUPPORT_PHONE = "+2348000000000";

const PRIMARY = "#155D5F";
const DARK = "#1A1A1A";

const MAINTENANCE_POLL_INTERVAL_MS = 30_000;

/**
 * Formats a Date object into 12-hour format ("10:42 AM") without using the Intl API.
 */
function format12HourTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minutesStr} ${ampm}`;
}

export const GlobalLockoutModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLocked, lockoutType, title, message } = useSelector(
    (state: RootState) => state.appStatus
  );

  const effectiveLockoutType: LockoutType =
    __DEV__ && DEV_FORCE_LOCKOUT ? DEV_FORCE_LOCKOUT : isLocked ? lockoutType : null;
  const isEffectiveLocked = Boolean(effectiveLockoutType);

  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>(() =>
    format12HourTime(new Date())
  );

  // Block Android hardware back button while the lockout overlay is active
  useEffect(() => {
    if (!isEffectiveLocked) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [isEffectiveLocked]);

  // Health check callback for recovery verification
  const checkServerHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
      const res = await fetch(`${baseUrl}/health`, { method: "GET" });
      setLastCheckedTime(format12HourTime(new Date()));
      if (res.ok) {
        // Server is reachable again: clear lockout and trigger fresh session
        dispatch(clearLockout());
        dispatch(logout());
      }
    } catch {
      // Still unreachable: update timestamp and keep showing screen with no alert
      setLastCheckedTime(format12HourTime(new Date()));
    } finally {
      setIsChecking(false);
    }
  }, [dispatch]);

  // Periodic 30-second polling for MAINTENANCE mode
  useEffect(() => {
    if (!isEffectiveLocked || effectiveLockoutType !== "MAINTENANCE") return;

    const poll = setInterval(() => {
      checkServerHealth();
    }, MAINTENANCE_POLL_INTERVAL_MS);

    return () => clearInterval(poll);
  }, [isEffectiveLocked, effectiveLockoutType, checkServerHealth]);

  if (!isEffectiveLocked || !effectiveLockoutType) return null;

  const handleLogout = () => {
    dispatch(clearLockout());
    dispatch(logout());
  };

  const handleContactEmail = () => {
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=Account%20Issue%20-%20${encodeURIComponent(
        effectiveLockoutType
      )}`
    );
  };

  const handleContactPhone = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const isMaintenance = effectiveLockoutType === "MAINTENANCE";
  const isSuspended = effectiveLockoutType === "SUSPENDED";

  // Icon mapping
  const iconName: keyof typeof Ionicons.glyphMap = isMaintenance
    ? "construct-outline"
    : isSuspended
    ? "lock-closed-outline"
    : "shield-outline";

  // Text contents
  const displayTitle = isMaintenance
    ? "Maintenance mode is on"
    : title || (isSuspended ? "Account Suspended" : "Account Blocked");

  const displayMessage = isMaintenance
    ? "Wealthconomy is temporarily unavailable while we carry out maintenance. Please check back shortly."
    : message ||
      (isSuspended
        ? "Your account has been temporarily suspended by the administration. Please contact support."
        : "Your account has been permanently blocked due to policy or compliance violations.");

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
          <View
            style={[
              styles.logoSection,
              isMaintenance && { marginBottom: 24 },
            ]}
          >
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

          {/* Teal Circle Icon Badge (omitted for Maintenance, shown for Suspended & Blocked) */}
          {!isMaintenance && (
            <View style={styles.iconCircle}>
              <Ionicons name={iconName} size={28} color={PRIMARY} />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title} maxFontSizeMultiplier={1.3}>
            {displayTitle}
          </Text>

          {/* Message */}
          <Text style={styles.message} maxFontSizeMultiplier={1.3}>
            {displayMessage}
          </Text>

          {/* Maintenance Status Area & Refresh Button */}
          {isMaintenance && (
            <View style={styles.maintenanceCard}>
              <View style={styles.statusRow}>
                <View style={styles.statusPulseDot} />
                <Text style={styles.statusLine} maxFontSizeMultiplier={1.3}>
                  Refresh to see if the app is back on
                </Text>
              </View>
              <Text style={styles.lastCheckedText} maxFontSizeMultiplier={1.3}>
                Last checked {lastCheckedTime}
              </Text>

              {/* Refresh Primary Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={checkServerHealth}
                disabled={isChecking}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Refresh"
              >
                {isChecking ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#FFFFFF"
                      style={styles.buttonIcon}
                    />
                    <Text
                      style={styles.primaryButtonText}
                      maxFontSizeMultiplier={1.3}
                    >
                      Refresh
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Suspended & Blocked: Reason Card & Contact Support Row */}
          {!isMaintenance && (
            <>
              {/* Reason Card */}
              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel} maxFontSizeMultiplier={1.3}>
                  Reason
                </Text>
                <Text style={styles.reasonText} maxFontSizeMultiplier={1.3}>
                  {displayMessage}
                </Text>
              </View>

              {/* Contact Support Row (Email + Call) */}
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel} maxFontSizeMultiplier={1.3}>
                  Need help?
                </Text>
                <TouchableOpacity
                  onPress={handleContactEmail}
                  activeOpacity={0.7}
                  accessibilityRole="link"
                  accessibilityLabel="Email Support"
                >
                  <Text style={styles.contactLink} maxFontSizeMultiplier={1.3}>
                    Email Support
                  </Text>
                </TouchableOpacity>
                <Text style={styles.contactSep}>·</Text>
                <TouchableOpacity
                  onPress={handleContactPhone}
                  activeOpacity={0.7}
                  accessibilityRole="link"
                  accessibilityLabel="Call Us"
                >
                  <Text style={styles.contactLink} maxFontSizeMultiplier={1.3}>
                    Call Us
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Primary Log Out Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogout}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Log out"
              >
                <Text
                  style={styles.primaryButtonText}
                  maxFontSizeMultiplier={1.3}
                >
                  Log Out
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Maintenance Secondary Action: Log Out */}
          {isMaintenance && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogout}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Log out"
            >
              <Text
                style={styles.secondaryButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Log Out
              </Text>
            </TouchableOpacity>
          )}

          {/* Footer Notice */}
          <Text style={styles.footerText} maxFontSizeMultiplier={1.3}>
            {isMaintenance
              ? "We will be back shortly. Thank you for your patience."
              : `If you believe this is a mistake, please reach out at ${SUPPORT_EMAIL}`}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999990,
    elevation: 999990,
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
    marginBottom: 16,
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
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: `${PRIMARY}14`,
    borderWidth: 1,
    borderColor: `${PRIMARY}24`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "KumbhSans_700Bold",
    color: DARK,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4B5563",
    fontFamily: "KumbhSans_500Medium",
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 20,
  },
  maintenanceCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#F0F9F9",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: `${PRIMARY}20`,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginRight: 8,
  },
  statusLine: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4B5563",
    fontWeight: "600",
    fontFamily: "KumbhSans_600SemiBold",
    textAlign: "center",
  },
  lastCheckedText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#6B7280",
    fontWeight: "600",
    fontFamily: "KumbhSans_600SemiBold",
    marginBottom: 16,
  },
  reasonBox: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: `${PRIMARY}10`,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
    fontFamily: "KumbhSans_700Bold",
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#1F2937",
    fontWeight: "600",
    fontFamily: "KumbhSans_600SemiBold",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  contactLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "KumbhSans_500Medium",
  },
  contactLink: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY,
    textDecorationLine: "underline",
    fontFamily: "KumbhSans_700Bold",
  },
  contactSep: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    width: "100%",
    maxWidth: 340,
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "KumbhSans_700Bold",
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "KumbhSans_700Bold",
  },
  footerText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "KumbhSans_500Medium",
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 310,
  },
});
