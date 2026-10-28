import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Keyboard,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppDispatch, RootState } from "../../store";
import { useVerifyPasscodeMutation } from "../../store/api/userApi";
import { useLoginMutation } from "../../store/api/authApi";
import { logout } from "../../store/slices/authSlice";
import {
  suspendAppLock,
  unlockAppFromInactivity,
} from "../../store/slices/appStatusSlice";
import * as LocalAuthentication from "expo-local-authentication";
import { PasscodeKeypad } from "./PasscodeKeypad";

const USE_CUSTOM_KEYPAD = Platform.OS === "android";

const PRIMARY = "#155D5F";
const BRAND_TEAL = "#008185";
const DARK = "#1A1A1A";

export const AppInactivityLockModal: React.FC = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isCompact = windowHeight <= 700;

  // Responsive passcode box dimensions: clamp width between 40 and 48, min 24dp side margin
  const pinGap = windowWidth < 360 ? 8 : 10;
  const boxWidth = Math.min(
    48,
    Math.max(40, Math.floor((windowWidth - 2 * 24 - 5 * pinGap) / 6)),
  );
  const boxHeight = Math.round(boxWidth * 1.12);

  const dispatch = useDispatch<AppDispatch>();
  const { isInactivityLocked } = useSelector(
    (state: RootState) => state.appStatus,
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const [passcode, setPasscode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBioAuthenticating, setIsBioAuthenticating] = useState(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const [bioIconName, setBioIconName] = useState<"fingerprint" | "face-recognition">("fingerprint");

  const [loginApi, { isLoading: isVerifyingPassword }] = useLoginMutation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const inputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [verifyPasscodeApi] = useVerifyPasscodeMutation();

  // Determine if biometric icon should be shown
  useEffect(() => {
    let isMounted = true;

    async function checkBiometricsAvailability() {
      // 1. Check if user has biometricsEnabled (from Redux user or stored local setting)
      let isEnabled = Boolean(user?.biometricsEnabled);
      if (!isEnabled) {
        try {
          const storedBio = await AsyncStorage.getItem("@wealth_biometrics_enabled");
          if (storedBio === "true") {
            isEnabled = true;
          }
        } catch {
          // Ignore
        }
      }

      if (!isEnabled) {
        if (isMounted) setCanUseBiometrics(false);
        return;
      }

      try {
        // 2. Check device hardware
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
          if (isMounted) setCanUseBiometrics(false);
          return;
        }

        // 3. Check enrollment
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
          if (isMounted) setCanUseBiometrics(false);
          return;
        }

        // Detect supported auth types (Face ID vs Fingerprint)
        try {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            if (isMounted) setBioIconName("face-recognition");
          } else {
            if (isMounted) setBioIconName("fingerprint");
          }
        } catch {
          if (isMounted) setBioIconName("fingerprint");
        }

        if (isMounted) setCanUseBiometrics(true);
      } catch (err) {
        if (isMounted) setCanUseBiometrics(false);
      }
    }

    if (isInactivityLocked) {
      checkBiometricsAvailability();
    }
    return () => {
      isMounted = false;
    };
  }, [isInactivityLocked, user?.biometricsEnabled]);

  const handlePasswordUnlock = async () => {
    if (!unlockPassword.trim()) {
      setPasswordError("Please enter your account password.");
      return;
    }
    setPasswordError("");
    try {
      await loginApi({
        email: user?.email || "",
        password: unlockPassword.trim(),
      }).unwrap();
      setShowPasswordModal(false);
      setUnlockPassword("");
      dispatch(unlockAppFromInactivity());
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Incorrect password. Please try again.";
      setPasswordError(typeof msg === "string" ? msg : "Incorrect password. Please try again.");
    }
  };

  const handleLogoutFromLock = () => {
    setShowPasswordModal(false);
    dispatch(unlockAppFromInactivity());
    dispatch(logout());
  };

  // Prevent hardware back press on Android
  useEffect(() => {
    if (!isInactivityLocked) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [isInactivityLocked]);

  // Reset state when lock appears; for iOS, focus the native input
  useEffect(() => {
    if (isInactivityLocked) {
      setPasscode("");
      setErrorMessage("");
      if (!USE_CUSTOM_KEYPAD) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [isInactivityLocked]);

  // Native keyboard input handler (iOS)
  const handlePasscodeChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 6);
    setPasscode(cleaned);
    setErrorMessage("");

    if (cleaned.length === 6) {
      executeVerification(cleaned);
    }
  };

  // In-app numeric keypad handlers (Android)
  const handleCustomKeypadDigit = (digit: string) => {
    if (isVerifying) return;
    if (passcode.length >= 6) return;
    const next = passcode + digit;
    setPasscode(next);
    setErrorMessage("");
    if (next.length === 6) {
      executeVerification(next);
    }
  };

  const handleCustomKeypadBackspace = () => {
    if (isVerifying) return;
    if (passcode.length > 0) {
      setPasscode((prev) => prev.slice(0, -1));
      setErrorMessage("");
    }
  };

  const handleCustomKeypadClear = () => {
    if (isVerifying) return;
    setPasscode("");
    setErrorMessage("");
  };

  const executeVerification = async (entered: string) => {
    setIsVerifying(true);
    setErrorMessage("");
    try {
      const res = await verifyPasscodeApi({ passcode: entered }).unwrap();
      if (res?.data?.valid || res?.success) {
        dispatch(unlockAppFromInactivity());
      } else {
        setErrorMessage("Invalid passcode. Please try again.");
        setPasscode("");
        if (!USE_CUSTOM_KEYPAD) {
          setTimeout(() => inputRef.current?.focus(), 250);
        }
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "";
      if (
        err?.status === 404 ||
        (typeof msg === "string" && msg.includes("Cannot POST"))
      ) {
        const savedPasscode = await AsyncStorage.getItem("@wealth_app_passcode");
        if (savedPasscode && savedPasscode !== entered) {
          setErrorMessage("Invalid passcode. Please try again.");
          setPasscode("");
          if (!USE_CUSTOM_KEYPAD) {
            setTimeout(() => inputRef.current?.focus(), 250);
          }
        } else {
          dispatch(unlockAppFromInactivity());
        }
      } else {
        setErrorMessage(
          typeof msg === "string" && msg.length > 0 && !msg.includes("Cannot")
            ? msg
            : "Invalid passcode. Please try again."
        );
        setPasscode("");
        if (!USE_CUSTOM_KEYPAD) {
          setTimeout(() => inputRef.current?.focus(), 250);
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBiometricUnlock = async () => {
    if (isBioAuthenticating) return;
    setIsBioAuthenticating(true);
    setErrorMessage("");
    suspendAppLock(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Wealthconomy",
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        dispatch(unlockAppFromInactivity());
      } else {
        // Cancelled or failed attempt: stay on passcode screen with no crash
        if (
          result.error !== "user_cancel" &&
          result.error !== "app_cancel" &&
          result.error !== "system_cancel"
        ) {
          setErrorMessage(
            "Biometric authentication failed. Please enter your passcode."
          );
        }
      }
    } catch (err) {
      console.log("Biometric unlock error:", err);
      setErrorMessage(
        "Biometric authentication failed. Please enter your passcode."
      );
    } finally {
      suspendAppLock(false);
      setIsBioAuthenticating(false);
    }
  };

  if (!isInactivityLocked) return null;

  const displayName = user?.firstName || "there";
  const userInitials = (user?.firstName?.[0] || "W").toUpperCase();

  return (
    <Modal
      transparent={false}
      visible={isInactivityLocked}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        {/* Ambient Teal Waves & Diagonal Bubble Art Background */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {/* Top-Right Glowing Ambient Bubble */}
          <View style={styles.topRightBubble} />

          {/* Bottom-Left Glowing Ambient Bubble */}
          <View style={styles.bottomLeftBubble} />

          {/* Center-Right Faded Accent Bubble */}
          <View style={styles.centerRightBubble} />

          {/* Fluid Diagonal Wave Paths */}
          <Svg
            width={windowWidth}
            height={windowHeight}
            viewBox={`0 0 ${windowWidth} ${windowHeight}`}
            fill="none"
            style={StyleSheet.absoluteFillObject}
          >
            <Defs>
              <LinearGradient
                id="waveGrad1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <Stop offset="0%" stopColor="#155D5F" stopOpacity="0.12" />
                <Stop offset="100%" stopColor="#008185" stopOpacity="0.04" />
              </LinearGradient>
              <LinearGradient
                id="waveGrad2"
                x1="100%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <Stop offset="0%" stopColor="#008185" stopOpacity="0.08" />
                <Stop offset="100%" stopColor="#155D5F" stopOpacity="0.02" />
              </LinearGradient>
            </Defs>

            {/* Top Diagonal Fluid Wave */}
            <Path
              d={`M-20,-20 Q${windowWidth * 0.4},${windowHeight * 0.18} ${windowWidth + 40},40 L${windowWidth + 40},-20 Z`}
              fill="url(#waveGrad1)"
            />

            {/* Middle Diagonal Flowing Wave */}
            <Path
              d={`M-30,${windowHeight * 0.45} Q${windowWidth * 0.5},${windowHeight * 0.35} ${windowWidth + 30},${windowHeight * 0.55} L${windowWidth + 30},${windowHeight * 0.72} Q${windowWidth * 0.4},${windowHeight * 0.65} -30,${windowHeight * 0.58} Z`}
              fill="url(#waveGrad2)"
            />

            {/* Bottom Swooping Wave */}
            <Path
              d={`M-30,${windowHeight + 20} Q${windowWidth * 0.5},${windowHeight * 0.82} ${windowWidth + 30},${windowHeight + 20} Z`}
              fill="url(#waveGrad1)"
            />

            {/* Faded Diagonal Accent Circles */}
            <Circle
              cx={windowWidth * 0.85}
              cy={windowHeight * 0.22}
              r={34}
              fill="#155D5F"
              fillOpacity="0.05"
            />
            <Circle
              cx={windowWidth * 0.15}
              cy={windowHeight * 0.7}
              r={48}
              fill="#008185"
              fillOpacity="0.04"
            />
            <Circle
              cx={windowWidth * 0.88}
              cy={windowHeight * 0.78}
              r={22}
              fill="#155D5F"
              fillOpacity="0.06"
            />
          </Svg>
        </View>

        <SafeAreaView
          style={{ flex: 1 }}
          edges={USE_CUSTOM_KEYPAD ? ["top"] : ["top", "bottom"]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <ScrollView
                contentContainerStyle={[
                  styles.scrollContent,
                  USE_CUSTOM_KEYPAD
                    ? {
                        paddingTop: isCompact
                          ? 10
                          : Math.max(16, Math.round(windowHeight * 0.04)),
                        paddingBottom: 8,
                      }
                    : {
                        paddingTop: Math.round(
                          windowHeight * (Platform.OS === "ios" ? 0.1 : 0.08),
                        ),
                        paddingBottom: 24,
                      },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* User Avatar with Glowing Double Ring */}
                <Animated.View
                  entering={FadeInDown.duration(500)}
                  style={[
                    styles.avatarSection,
                    isCompact && styles.avatarSectionCompact,
                  ]}
                >
                  <View
                    style={[
                      styles.outerRing,
                      isCompact && styles.outerRingCompact,
                    ]}
                  >
                    <View
                      style={[
                        styles.innerRing,
                        isCompact && styles.innerRingCompact,
                      ]}
                    >
                      {user?.imageUrl ? (
                        <Image
                          source={{ uri: user.imageUrl }}
                          style={[
                            styles.avatarImage,
                            isCompact && styles.avatarImageCompact,
                          ]}
                        />
                      ) : (
                        <View
                          style={[
                            styles.avatarPlaceholder,
                            isCompact && styles.avatarPlaceholderCompact,
                          ]}
                        >
                          <Text
                            style={[
                              styles.avatarInitial,
                              isCompact && styles.avatarInitialCompact,
                            ]}
                          >
                            {userInitials}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Animated.View>

                {/* Title & Subtitle */}
                <Animated.View
                  entering={FadeInDown.duration(500).delay(100)}
                  style={[
                    styles.textSection,
                    isCompact && styles.textSectionCompact,
                  ]}
                >
                  <Text
                    style={[
                      styles.greetingTitle,
                      isCompact && styles.greetingTitleCompact,
                    ]}
                  >
                    Welcome Back, {displayName}{" "}
                  </Text>
                  <Text
                    style={[
                      styles.loginSubtitle,
                      isCompact && styles.loginSubtitleCompact,
                    ]}
                  >
                    Log in with your passcode
                  </Text>
                </Animated.View>

                {/* App Standard 6-Box PinInput with accessibility label */}
                <Animated.View
                  entering={FadeInDown.duration(500).delay(200)}
                  style={{ width: "100%" }}
                >
                  <Pressable
                    onPress={
                      !USE_CUSTOM_KEYPAD ? () => inputRef.current?.focus() : undefined
                    }
                    disabled={USE_CUSTOM_KEYPAD}
                    style={[styles.pinWrapper, isCompact && styles.pinWrapperCompact]}
                    accessible={true}
                    accessibilityRole={USE_CUSTOM_KEYPAD ? "text" : "button"}
                    accessibilityLabel={`Passcode, ${passcode.length} of 6 digits entered`}
                  >
                    <View style={[styles.boxesRow, { gap: pinGap }]}>
                      {Array(6)
                        .fill(0)
                        .map((_, i) => {
                          const isFilled = passcode.length > i;
                          const isCurrent = passcode.length === i;
                          return (
                            <View
                              key={i}
                              style={[
                                styles.box,
                                {
                                  width: boxWidth,
                                  height: boxHeight,
                                  borderRadius: isCompact ? 14 : 16,
                                  borderColor: isCurrent
                                    ? PRIMARY
                                    : isFilled
                                      ? PRIMARY
                                      : "#E5E7EB",
                                  backgroundColor: isFilled
                                    ? "#EEF7F8"
                                    : "#FFFFFF",
                                  shadowColor: isCurrent ? PRIMARY : "#000",
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: isCurrent ? 0.12 : 0.03,
                                  shadowRadius: 6,
                                  elevation: isCurrent ? 3 : 1,
                                },
                              ]}
                            >
                              {isFilled && <View style={styles.filledDot} />}
                            </View>
                          );
                        })}
                    </View>

                    {!USE_CUSTOM_KEYPAD && (
                      <TextInput
                        ref={inputRef}
                        value={passcode}
                        onChangeText={handlePasscodeChange}
                        keyboardType="numeric"
                        maxLength={6}
                        style={styles.hiddenNativeInput}
                        autoFocus={Platform.OS === "ios"}
                        showSoftInputOnFocus
                        caretHidden
                      />
                    )}
                  </Pressable>
                </Animated.View>

                {/* Error Message */}
                {!!errorMessage && (
                  <Text
                    style={[
                      styles.errorText,
                      isCompact && styles.errorTextCompact,
                    ]}
                  >
                    {errorMessage}
                  </Text>
                )}

                {/* Loading Indicator */}
                {isVerifying && (
                  <View
                    style={[
                      styles.loadingRow,
                      isCompact && styles.loadingRowCompact,
                    ]}
                  >
                    <ActivityIndicator size="small" color={PRIMARY} />
                    <Text style={styles.loadingText}>Unlocking account...</Text>
                  </View>
                )}

                {/* Biometrics Action (Styled circular button) & Forgot Passcode link */}
                <Animated.View
                  entering={FadeInUp.duration(500).delay(300)}
                  style={[
                    styles.bottomActionWrapper,
                    isCompact && styles.bottomActionWrapperCompact,
                  ]}
                >
                  {canUseBiometrics && (
                    <TouchableOpacity
                      style={[
                        styles.bioIconButton,
                        isCompact && styles.bioIconButtonCompact,
                      ]}
                      onPress={handleBiometricUnlock}
                      activeOpacity={0.7}
                      disabled={isBioAuthenticating}
                      accessibilityLabel={
                        bioIconName === "face-recognition"
                          ? "Unlock with Face ID"
                          : "Unlock with Fingerprint"
                      }
                      accessibilityRole="button"
                    >
                      {isBioAuthenticating ? (
                        <ActivityIndicator size="small" color={PRIMARY} />
                      ) : (
                        <MaterialCommunityIcons
                          name={bioIconName}
                          size={isCompact ? 28 : 36}
                          color={PRIMARY}
                        />
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      setShowPasswordModal(true);
                      setPasswordError("");
                      setUnlockPassword("");
                    }}
                    activeOpacity={0.7}
                    style={{
                      marginTop: canUseBiometrics
                        ? isCompact
                          ? 8
                          : 16
                        : isCompact
                          ? 4
                          : 8,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ color: PRIMARY, fontSize: 13.5, fontWeight: "600" }}>
                      Forgot Passcode? Unlock with Password
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </ScrollView>

              {/* In-App Numeric Keypad Panel at the bottom (Android) */}
              {USE_CUSTOM_KEYPAD && (
                <Animated.View entering={FadeInUp.duration(400)}>
                  <PasscodeKeypad
                    onDigit={handleCustomKeypadDigit}
                    onBackspace={handleCustomKeypadBackspace}
                    onClear={handleCustomKeypadClear}
                    disabled={isVerifying}
                  />
                </Animated.View>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Password Unlock Modal */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}
          onShow={() => {
            setTimeout(() => {
              passwordInputRef.current?.focus();
            }, 150);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
              <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: DARK }}>
                    Unlock with Account Password
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPasswordModal(false)}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" }}
                  >
                    <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
                  Enter your Wealthconomy account password to unlock your app session.
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, paddingHorizontal: 14, height: 50, marginBottom: 12 }}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    ref={passwordInputRef}
                    value={unlockPassword}
                    onChangeText={(t) => {
                      setUnlockPassword(t);
                      setPasswordError("");
                    }}
                    placeholder="Enter your account password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPasswordText}
                    style={{ flex: 1, marginLeft: 10, fontSize: 14, color: DARK }}
                  />
                  <TouchableOpacity onPress={() => setShowPasswordText(!showPasswordText)}>
                    <MaterialCommunityIcons
                      name={showPasswordText ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                {!!passwordError && (
                  <Text style={{ color: "#DC2626", fontSize: 12.5, fontWeight: "600", marginBottom: 12, textAlign: "center" }}>
                    {passwordError}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handlePasswordUnlock}
                  disabled={isVerifyingPassword}
                  style={{
                    backgroundColor: PRIMARY,
                    height: 50,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 6,
                    marginBottom: 12,
                  }}
                >
                  {isVerifyingPassword ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                      Unlock App
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogoutFromLock}
                  style={{ alignItems: "center", paddingVertical: 10 }}
                >
                  <Text style={{ color: "#DC2626", fontWeight: "600", fontSize: 13.5 }}>
                    Log Out of Wealthconomy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFDFD",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  // Ambient Glowing Bubbles
  topRightBubble: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: `${PRIMARY}12`,
  },
  bottomLeftBubble: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: `${BRAND_TEAL}10`,
  },
  centerRightBubble: {
    position: "absolute",
    top: "42%",
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${PRIMARY}08`,
  },
  // Avatar Section
  avatarSection: {
    marginBottom: 16,
  },
  avatarSectionCompact: {
    marginBottom: 10,
  },
  outerRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: `${PRIMARY}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: `${PRIMARY}25`,
  },
  outerRingCompact: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  innerRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  innerRingCompact: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarImageCompact: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E6F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderCompact: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: "800",
    color: PRIMARY,
  },
  avatarInitialCompact: {
    fontSize: 24,
  },
  textSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  textSectionCompact: {
    marginBottom: 14,
  },
  greetingTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
    marginBottom: 6,
  },
  greetingTitleCompact: {
    fontSize: 20,
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  loginSubtitleCompact: {
    fontSize: 13,
  },
  pinWrapper: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  pinWrapperCompact: {
    marginBottom: 10,
  },
  boxesRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  boxesRowCompact: {
    gap: 8,
  },
  box: {
    width: 48,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  boxCompact: {
    width: 42,
    height: 48,
    borderRadius: 14,
  },
  filledDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DARK,
  },
  hiddenNativeInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  errorTextCompact: {
    fontSize: 12,
    marginBottom: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  loadingRowCompact: {
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  bottomActionWrapper: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  bottomActionWrapperCompact: {
    marginTop: 10,
  },
  bioIconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F9F9",
    borderWidth: 1.5,
    borderColor: `${PRIMARY}25`,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  bioIconButtonCompact: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
