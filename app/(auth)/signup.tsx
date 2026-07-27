import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { ChevronDown, ChevronUp, Mail } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  AUTH_COLORS,
  AuthErrorBanner,
  AuthField,
  AuthHeader,
  AuthLayout,
  AuthPasswordField,
  AuthSubmitButton,
  SocialAuthSection,
} from "../../src/components/auth";
import { getApiErrorMessage } from "../../src/hooks/useAuthHooks";
import { useRegisterMutation } from "../../src/store/api/authApi";
import { RegisterFormData, registerSchema } from "../../src/validations/authSchemas";

const WEALTH_PREFERENCES = [
  "Impact Wealth (Impact/Halal Savings)",
  "Interest Wealth (Conventional Savings)",
  "Mixed Wealth (Split/Donate)",
];

export default function SignupScreen() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [generalError, setGeneralError] = useState("");

  const router = useRouter();
  const [registerMutation, { isLoading: isSubmitting }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    trigger,
    formState: { isValid, errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      wealthPreference: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    mode: "onChange",
  });

  const wealthPreference = watch("wealthPreference");
  const agreeToTerms = watch("agreeToTerms");

  const formatPhone = (phoneInput?: string) => {
    if (!phoneInput) return undefined;
    const cleaned = phoneInput.trim();
    if (!cleaned) return undefined;
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.startsWith("234")) return `+${cleaned}`;
    if (cleaned.startsWith("0") && cleaned.length === 11) {
      return `+234${cleaned.slice(1)}`;
    }
    return cleaned;
  };

  const mapWealthPreference = (pref?: string) => {
    if (!pref) return undefined;
    if (pref.includes("Impact") || pref === "IMPACT_WEALTH") return "IMPACT_WEALTH";
    if (pref.includes("Interest") || pref === "INTEREST_WEALTH") return "INTEREST_WEALTH";
    if (pref.includes("Mixed") || pref === "MIXED_WEALTH") return "MIXED_WEALTH";
    return pref;
  };

  const onSubmit = async (data: RegisterFormData) => {
    setGeneralError("");
    try {
      const formattedPhone = formatPhone(data.phone);
      const mappedWealth = mapWealthPreference(data.wealthPreference);

      const payload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        ...(formattedPhone ? { phone: formattedPhone } : {}),
        ...(mappedWealth ? { wealthPreference: mappedWealth } : {}),
        ...(referralCode.trim() ? { referralCode: referralCode.trim() } : {}),
      };

      await registerMutation(payload).unwrap();

      router.push({
        pathname: "/(auth)/otp",
        params: { email: data.email, context: "signup" },
      } as any);
    } catch (err: any) {
      const msg = getApiErrorMessage(err, "Signup failed. Please try again.");
      if (msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("email")) {
        const emailMsg = "This email is already registered. Please log in instead.";
        setError("email", { type: "server", message: emailMsg });
        setGeneralError(emailMsg);
      } else {
        setGeneralError(msg);
      }
    }
  };

  const inputWrap = (hasError: boolean) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: hasError ? AUTH_COLORS.ERROR : AUTH_COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: AUTH_COLORS.MUTED,
  });

  return (
    <AuthLayout showBackButton scrollPaddingBottom={36}>
      <AuthHeader
        imageSource={require("../../assets/images/logo1.png")}
        title="Sign Up"
        subtitle="Join other purposeful wealth builders"
        marginTop={24}
      />

      <AuthErrorBanner error={generalError} />

      <AuthField
        control={control}
        name="firstName"
        label="First Name"
        placeholder="First Name"
        autoCapitalize="words"
        onValueChange={() => setGeneralError("")}
        animationDelay={250}
      />

      <AuthField
        control={control}
        name="lastName"
        label="Last Name"
        placeholder="Last Name"
        autoCapitalize="words"
        onValueChange={() => setGeneralError("")}
        animationDelay={320}
      />

      <AuthField
        control={control}
        name="phone"
        label="Phone Number"
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        onValueChange={() => setGeneralError("")}
        animationDelay={380}
      />

      <AuthField
        control={control}
        name="email"
        label="Email Address"
        placeholder="e.g user@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={(hasError) => (
          <Mail size={18} color={hasError ? AUTH_COLORS.ERROR : "#9CA3AF"} style={{ marginRight: 8 }} />
        )}
        onValueChange={() => setGeneralError("")}
        animationDelay={430}
      />

      {/* Wealth Preference Dropdown */}
      <Animated.View entering={FadeInDown.duration(600).delay(480)}>
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: AUTH_COLORS.DARK, fontWeight: "500", fontSize: 13, marginBottom: 8 }}>
            Wealth Preference
          </Text>
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            style={[inputWrap(!!errors.wealthPreference), { justifyContent: "space-between" }]}
          >
            <Text style={{ color: wealthPreference ? AUTH_COLORS.DARK : "#9CA3AF", fontSize: 15, flex: 1 }}>
              {wealthPreference || "Select Wealth Preference"}
            </Text>
            {showDropdown ? <ChevronUp size={20} color="#9CA3AF" /> : <ChevronDown size={20} color="#9CA3AF" />}
          </TouchableOpacity>
          {showDropdown && (
            <View
              style={{
                borderWidth: 1,
                borderColor: AUTH_COLORS.BORDER,
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
              {WEALTH_PREFERENCES.map((pref) => (
                <TouchableOpacity
                  key={pref}
                  onPress={() => {
                    setValue("wealthPreference", pref, { shouldValidate: true });
                    setShowDropdown(false);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <Text style={{ color: AUTH_COLORS.DARK, fontSize: 15 }}>{pref}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.wealthPreference && (
            <Text style={{ color: AUTH_COLORS.ERROR, fontSize: 12, marginTop: 4 }}>
              {errors.wealthPreference.message}
            </Text>
          )}
        </View>
      </Animated.View>

      <AuthPasswordField
        control={control}
        name="password"
        label="Password"
        placeholder="Password"
        onValueChange={() => {
          trigger("confirmPassword");
          setGeneralError("");
        }}
        animationDelay={530}
      />

      <AuthPasswordField
        control={control}
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm Password"
        onValueChange={() => setGeneralError("")}
        animationDelay={570}
      />

      <Animated.View entering={FadeInDown.duration(600).delay(610)}>
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: AUTH_COLORS.DARK, fontWeight: "500", fontSize: 13, marginBottom: 8 }}>
            Referral Code (Optional)
          </Text>
          <View style={inputWrap(false)}>
            <TextInput
              placeholder="Referral Code"
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, fontSize: 15, color: AUTH_COLORS.DARK }}
              autoCapitalize="characters"
              value={referralCode}
              onChangeText={setReferralCode}
            />
          </View>
        </View>
      </Animated.View>

      {/* T&C Checkbox */}
      <Animated.View entering={FadeInDown.duration(600).delay(650)}>
        <TouchableOpacity
          onPress={() => setValue("agreeToTerms", !agreeToTerms, { shouldValidate: true })}
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: errors.agreeToTerms ? 6 : 24,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: errors.agreeToTerms ? AUTH_COLORS.ERROR : agreeToTerms ? AUTH_COLORS.PRIMARY : AUTH_COLORS.BORDER,
              backgroundColor: agreeToTerms ? AUTH_COLORS.PRIMARY : "#fff",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              marginTop: 2,
            }}
          >
            {agreeToTerms && <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>✓</Text>}
          </View>
          <Text style={{ color: AUTH_COLORS.SECONDARY, fontSize: 13, flex: 1, lineHeight: 20 }}>
            I agree with the <Text style={{ color: AUTH_COLORS.PRIMARY, fontWeight: "600" }}>Terms and Conditions</Text> and{" "}
            <Text style={{ color: AUTH_COLORS.PRIMARY, fontWeight: "600" }}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        {errors.agreeToTerms && (
          <Text style={{ color: AUTH_COLORS.ERROR, fontSize: 12, marginBottom: 16 }}>
            {errors.agreeToTerms.message}
          </Text>
        )}
      </Animated.View>

      <AuthErrorBanner error={generalError} />

      <AuthSubmitButton
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting}
        disabled={!isValid}
        label="Register"
        loadingLabel="Creating Account..."
        animationDelay={700}
        marginBottom={16}
      />

      <SocialAuthSection
        promptText="Already have an account?"
        linkHref="/(auth)/login"
        linkText="Login an account"
        animationDelay={750}
      />
    </AuthLayout>
  );
}
