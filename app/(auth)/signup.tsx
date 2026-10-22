import { Link, useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { AppToast, ToastState } from "../../src/components/common/AppToast";
import {
  REFERRAL_CLIPBOARD_PREFIX,
  REFERRAL_CODE_PATTERN,
} from "../../src/constants/referral";
import { useRegisterMutation } from "../../src/store/api/authApi";

const PRIMARY = "#155D5F";
const DARK = "#323232";
const SECONDARY = "#6B7280";
const BORDER = "#E5E5E5";
const MUTED = "#F7F7F7";
const ERROR = "#DC2626";

const WEALTH_PREFERENCES = [
  {
    value: "INTEREST_WEALTH",
    label: "Interest-Based Wealth",
    subtitle: "Maximize personal growth and returns",
  },
  {
    value: "IMPACT_WEALTH",
    label: "Impact Wealth",
    subtitle: "Channel growth into purposeful initiatives and causes",
  },
  {
    value: "MIXED_WEALTH",
    label: "Mixed Wealth",
    subtitle: "Balanced approach between personal profit and impact",
  },
];

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wealthPreference, setWealthPreference] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasteReferral = async () => {
    try {
      const clipText = await Clipboard.getStringAsync();
      let candidate = (clipText || "").trim();
      if (candidate.startsWith(REFERRAL_CLIPBOARD_PREFIX)) {
        candidate = candidate.slice(REFERRAL_CLIPBOARD_PREFIX.length);
      }
      candidate = candidate.trim().toUpperCase();

      if (REFERRAL_CODE_PATTERN.test(candidate)) {
        setReferralCode(candidate);
        clearError("referralCode");
        setToast({
          type: "success",
          title: "Referral code added",
        });
      } else {
        setToast({
          type: "info",
          title: "No referral code found on your clipboard. You can type it below.",
        });
      }
    } catch {
      setToast({
        type: "info",
        title: "No referral code found on your clipboard. You can type it below.",
      });
    }
  };

  // Inline errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const [registerMutation] = useRegisterMutation();

  const setError = (field: string, msg: string) =>
    setErrors((prev) => ({ ...prev, [field]: msg }));
  const clearError = (field: string) =>
    setErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });

  const handleSignup = async () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!email.trim()) newErrors.email = "Email address is required";
    if (!wealthPreference)
      newErrors.wealthPreference = "Please select a wealth preference";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!agreeToTerms)
      newErrors.terms = "You must agree to the Terms and Conditions";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    // Clean and normalize phone to E.164 (+234...)
    let cleanedDigits = phone.replace(/[^0-9]/g, "");
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("+234")) {
      // Already complete E.164
    } else if (cleanedDigits.startsWith("234")) {
      formattedPhone = "+" + cleanedDigits;
    } else if (cleanedDigits.startsWith("0")) {
      formattedPhone = "+234" + cleanedDigits.slice(1);
    } else {
      formattedPhone = "+234" + cleanedDigits;
    }

    try {
      setIsSubmitting(true);
      await registerMutation({
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: formattedPhone,
        wealthPreference,
        referralCode: referralCode.trim() ? referralCode.trim() : undefined,
      }).unwrap();
      router.push({
        pathname: "/(auth)/otp",
        params: { email: email.trim(), context: "signup" },
      } as any);
    } catch (err: any) {
      const rawMsg = err?.data?.message || err?.message || "";
      const messages: string[] = Array.isArray(rawMsg)
        ? rawMsg
        : typeof rawMsg === "string"
        ? [rawMsg]
        : ["Signup failed. Please try again."];

      const fieldErrors: Record<string, string> = {};
      const unmapped: string[] = [];

      for (const m of messages) {
        const lower = m.toLowerCase();
        if (
          lower.includes("wealthpreference") ||
          lower.includes("wealth preference")
        ) {
          fieldErrors.wealthPreference =
            "Please select a valid wealth preference option.";
        } else if (
          lower.includes("phone") &&
          (lower.includes("exist") ||
            lower.includes("already") ||
            lower.includes("taken") ||
            lower.includes("registered") ||
            lower.includes("in use"))
        ) {
          fieldErrors.phone =
            "This phone number is already registered. Please log in or use another number.";
        } else if (lower.includes("phone")) {
          fieldErrors.phone = m || "Please enter a valid phone number (e.g. 801 234 5678).";
        } else if (
          lower.includes("email") &&
          (lower.includes("exist") ||
            lower.includes("already") ||
            lower.includes("taken") ||
            lower.includes("registered") ||
            lower.includes("in use"))
        ) {
          fieldErrors.email =
            "This email is already registered. Please log in instead.";
        } else if (lower.includes("email")) {
          fieldErrors.email = m || "Please enter a valid email address.";
        } else if (lower.includes("password")) {
          fieldErrors.password = m;
        } else if (lower.includes("first name") || lower.includes("firstname")) {
          fieldErrors.firstName = "First name is required.";
        } else if (lower.includes("last name") || lower.includes("lastname")) {
          fieldErrors.lastName = "Last name is required.";
        } else if (lower.includes("referral")) {
          fieldErrors.referralCode = m;
        } else {
          unmapped.push(m);
        }
      }

      if (unmapped.length > 0) {
        fieldErrors.general = unmapped.join(". ");
      }
      setErrors(fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputWrap = (hasError: boolean) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: hasError ? ERROR : BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: MUTED,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 4,
          gap: 4,
        }}
      >
        <ChevronLeft size={24} color={DARK} style={{ width: 12 }} />
        <Text style={{ color: DARK, fontSize: 14, fontWeight: "500" }}>
          Back
        </Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 36,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + Header */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(100)}
            style={{ alignItems: "center", marginTop: 24, marginBottom: 28 }}
          >
            <Image
              source={require("../../assets/images/logo1.png")}
              style={{ width: 69, height: 73 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: DARK,
                marginTop: 16,
                marginBottom: 6,
              }}
            >
              Sign Up
            </Text>
            <Text
              style={{ color: SECONDARY, fontSize: 13, textAlign: "center" }}
            >
              Join other purposeful wealth builders
            </Text>
          </Animated.View>

          {/* General Error */}
          {errors.general ? (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: ERROR, fontSize: 13 }}>
                {errors.general}
              </Text>
            </View>
          ) : null}

          <Animated.View entering={FadeInDown.duration(600).delay(250)}>
          <F label="First Name" field="firstName" errors={errors}>
            <View style={inputWrap(!!errors.firstName)}>
              <TextInput
                placeholder="First Name"
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 15, color: DARK }}
                autoCapitalize="words"
                value={firstName}
                onChangeText={(v) => {
                  setFirstName(v);
                  clearError("firstName");
                }}
              />
            </View>
          </F>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(320)}>
          <F label="Last Name" field="lastName" errors={errors}>
            <View style={inputWrap(!!errors.lastName)}>
              <TextInput
                placeholder="Last Name"
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 15, color: DARK }}
                autoCapitalize="words"
                value={lastName}
                onChangeText={(v) => {
                  setLastName(v);
                  clearError("lastName");
                }}
              />
            </View>
          </F>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(380)}>
          <F label="Phone Number" field="phone" errors={errors}>
            <View style={[inputWrap(!!errors.phone), { paddingLeft: 8 }]}>
              {/* Dial Code Prefix Pill */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#E6F4F4",
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  borderRadius: 8,
                  marginRight: 10,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 16 }}>🇳🇬</Text>
                <Text
                  style={{
                    color: PRIMARY,
                    fontWeight: "700",
                    fontSize: 13.5,
                  }}
                >
                  +234
                </Text>
              </View>
              <TextInput
                placeholder="801 234 5678"
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 15, color: DARK }}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(v) => {
                  const cleaned = v.replace(/[^0-9]/g, "");
                  setPhone(cleaned);
                  clearError("phone");
                }}
              />
            </View>
          </F>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(430)}>
          <F label="Email Address" field="email" errors={errors}>
            <View style={inputWrap(!!errors.email)}>
              <Mail
                size={18}
                color={errors.email ? ERROR : "#9CA3AF"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="e.g user@gmail.com"
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 15, color: DARK }}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  clearError("email");
                }}
              />
            </View>
          </F>
          </Animated.View>

          {/* Wealth Preference Dropdown */}
          <Animated.View entering={FadeInDown.duration(600).delay(480)}>
          <View style={{ marginBottom: 14 }}>
            <Text
              style={{
                color: DARK,
                fontWeight: "500",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              Wealth Preference
            </Text>
            <TouchableOpacity
              onPress={() => setShowDropdown(!showDropdown)}
              style={[
                inputWrap(!!errors.wealthPreference),
                { justifyContent: "space-between" },
              ]}
            >
              <Text
                style={{
                  color: wealthPreference ? DARK : "#9CA3AF",
                  fontSize: 15,
                  flex: 1,
                  fontWeight: wealthPreference ? "600" : "400",
                }}
              >
                {WEALTH_PREFERENCES.find((p) => p.value === wealthPreference)
                  ?.label || "Select Wealth Preference"}
              </Text>
              {showDropdown ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
            {showDropdown && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: BORDER,
                  borderRadius: 12,
                  backgroundColor: "#fff",
                  marginTop: 4,
                  overflow: "hidden",
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                }}
              >
                {WEALTH_PREFERENCES.map((pref) => {
                  const isSelected = wealthPreference === pref.value;
                  return (
                    <TouchableOpacity
                      key={pref.value}
                      onPress={() => {
                        setWealthPreference(pref.value);
                        setShowDropdown(false);
                        clearError("wealthPreference");
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F5F5F5",
                        backgroundColor: isSelected ? "#F0F9F9" : "#FFFFFF",
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? PRIMARY : DARK,
                          fontSize: 14.5,
                          fontWeight: isSelected ? "700" : "600",
                          marginBottom: 2,
                        }}
                      >
                        {pref.label}
                      </Text>
                      <Text style={{ color: "#6B7280", fontSize: 12 }}>
                        {pref.subtitle}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {errors.wealthPreference ? (
              <Text style={{ color: ERROR, fontSize: 12, marginTop: 4 }}>
                {errors.wealthPreference}
              </Text>
            ) : null}
          </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(530)}>
          <F label="Password" field="password" errors={errors}>
            <View style={inputWrap(!!errors.password)}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 15, color: DARK }}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  clearError("password");
                  clearError("confirmPassword");
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </F>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(570)}>
          <F label="Confirm Password" field="confirmPassword" errors={errors}>
            <View style={inputWrap(!!errors.confirmPassword)}>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 15, color: DARK }}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  clearError("confirmPassword");
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </F>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(610)}>
          {!referralCode.trim() && !bannerDismissed && (
            <View
              style={{
                backgroundColor: "#EEF7F8",
                borderColor: "#C8E6E8",
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={handlePasteReferral}
                activeOpacity={0.7}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="clipboard-outline" size={16} color={PRIMARY} />
                <Text
                  style={{
                    color: PRIMARY,
                    fontSize: 12,
                    fontWeight: "600",
                    flex: 1,
                    lineHeight: 16,
                  }}
                >
                  Have a referral code from a friend? Tap to paste it.
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBannerDismissed(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ marginLeft: 8, padding: 2 }}
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
          <F
            label="Referral Code (Optional)"
            field="referralCode"
            errors={errors}
          >
            <View style={inputWrap(!!errors.referralCode)}>
              <TextInput
                placeholder="Referral Code"
                placeholderTextColor="#6B7280"
                style={{ flex: 1, fontSize: 15, color: DARK }}
                autoCapitalize="characters"
                maxLength={16}
                value={referralCode}
                onChangeText={(v) => {
                  setReferralCode(v);
                  clearError("referralCode");
                }}
              />
            </View>
          </F>
          </Animated.View>

          {/* T&C Checkbox */}
          <Animated.View entering={FadeInDown.duration(600).delay(650)}>
          <TouchableOpacity
            onPress={() => {
              setAgreeToTerms(!agreeToTerms);
              clearError("terms");
            }}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: errors.terms ? 6 : 24,
            }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: errors.terms
                  ? ERROR
                  : agreeToTerms
                    ? PRIMARY
                    : BORDER,
                backgroundColor: agreeToTerms ? PRIMARY : "#fff",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
                marginTop: 2,
              }}
            >
              {agreeToTerms && (
                <Text
                  style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}
                >
                  ✓
                </Text>
              )}
            </View>
            <Text
              style={{
                color: SECONDARY,
                fontSize: 13,
                flex: 1,
                lineHeight: 20,
              }}
            >
              I agree with the{" "}
              <Text style={{ color: PRIMARY, fontWeight: "600" }}>
                Terms and Conditions
              </Text>{" "}
              and{" "}
              <Text style={{ color: PRIMARY, fontWeight: "600" }}>
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
          {errors.terms ? (
            <Text style={{ color: ERROR, fontSize: 12, marginBottom: 16 }}>
              {errors.terms}
            </Text>
          ) : null}
          </Animated.View>

          {/* Register Button */}
          <Animated.View entering={FadeInDown.duration(600).delay(700)}>
          {(() => {
            const isFormValid =
              firstName &&
              lastName &&
              phone &&
              email &&
              wealthPreference &&
              password &&
              confirmPassword &&
              agreeToTerms;
            return (
              <TouchableOpacity
                onPress={handleSignup}
                disabled={isSubmitting || !isFormValid}
                style={{
                  backgroundColor: PRIMARY,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 16,
                  opacity: isSubmitting || !isFormValid ? 0.5 : 1,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                >
                  {isSubmitting ? "Creating Account..." : "Register"}
                </Text>
              </TouchableOpacity>
            );
          })()}
          </Animated.View>

          {/* Already have account */}
          <Animated.View entering={FadeInDown.duration(600).delay(750)}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
            <Text
              style={{ color: SECONDARY, paddingHorizontal: 12, fontSize: 13 }}
            >
              Already have an account?
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
          </View>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity
              style={{ alignItems: "center", marginBottom: 16 }}
            >
              <Text style={{ color: PRIMARY, fontWeight: "600", fontSize: 15 }}>
                Login an account
              </Text>
            </TouchableOpacity>
          </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppToast toast={toast} onDismiss={() => setToast(null)} />
    </SafeAreaView>
  );
}

const F = ({
  label,
  field,
  errors,
  children,
}: {
  label: string;
  field: string;
  errors: Record<string, string>;
  children: React.ReactNode;
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text
      style={{
        color: DARK,
        fontWeight: "500",
        fontSize: 13,
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
    {children}
    {errors[field] ? (
      <Text style={{ color: ERROR, fontSize: 12, marginTop: 4 }}>
        {errors[field]}
      </Text>
    ) : null}
  </View>
);
