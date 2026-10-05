import { Link, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
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
import { useDispatch } from "react-redux";
import { setCredentials } from "../../src/store/slices/authSlice";
import { useLoginMutation } from "../../src/store/api/authApi";

const PRIMARY = "#155D5F";
const DARK = "#323232";
const SECONDARY = "#6B7280";
const BORDER = "#E5E5E5";
const MUTED = "#F7F7F7";
const ERROR = "#DC2626";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();
  const [loginMutation] = useLoginMutation();

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
  };

  const handleLogin = async () => {
    clearErrors();
    let valid = true;
    if (!email) {
      setEmailError("Email or mobile is required");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }
    if (!valid) return;

    try {
      setIsSubmitting(true);
      const res = await loginMutation({ email: email.trim(), password }).unwrap();
      const tokens = res.data;
      if (tokens?.accessToken) {
        dispatch(
          setCredentials({
            user: tokens.user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          })
        );
        router.replace("/(tabs)");
      } else {
        setGeneralError("Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "";
      const msgStr = Array.isArray(msg) ? msg.join(", ") : String(msg);
      if (msgStr.toLowerCase().includes("password")) {
        setPasswordError("Incorrect password. Please try again.");
      } else if (
        msgStr.toLowerCase().includes("email") ||
        msgStr.toLowerCase().includes("user") ||
        msgStr.toLowerCase().includes("found")
      ) {
        setEmailError("No account found with this email.");
      } else {
        setGeneralError(msgStr || "Incorrect email or password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBorder = (hasError: boolean) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: hasError ? ERROR : BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: MUTED,
    gap: 10,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(100)}
            style={{ alignItems: "center", marginTop: 40, marginBottom: 28 }}
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
              Log In
            </Text>
            <Text
              style={{
                color: SECONDARY,
                fontSize: 13,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Please Log in to Continue your Wealth{"\n"}Building Journey
            </Text>
          </Animated.View>

          {/* General Error Banner */}
          {generalError ? (
            <Animated.View
              entering={FadeInDown.duration(400)}
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
              <Text style={{ color: ERROR, fontSize: 13 }}>{generalError}</Text>
            </Animated.View>
          ) : null}

          {/* Email */}
          <Animated.View entering={FadeInDown.duration(600).delay(250)} style={{ marginBottom: 14 }}>
            <Text
              style={{
                color: DARK,
                fontWeight: "500",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              Email or Mobile
            </Text>
            <View style={inputBorder(!!emailError)}>
              <Mail size={18} color={emailError ? ERROR : "#9CA3AF"} />
              <TextInput
                placeholder="Email or Mobile"
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 15, color: DARK }}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setEmailError("");
                  setGeneralError("");
                }}
              />
            </View>
            {emailError ? (
              <Text style={{ color: ERROR, fontSize: 12, marginTop: 4 }}>
                {emailError}
              </Text>
            ) : null}
          </Animated.View>

          {/* Password */}
          <Animated.View entering={FadeInDown.duration(600).delay(350)} style={{ marginBottom: 10 }}>
            <Text
              style={{
                color: DARK,
                fontWeight: "500",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              Password
            </Text>
            <View style={inputBorder(!!passwordError)}>
              <Lock size={18} color={passwordError ? ERROR : "#9CA3AF"} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 15, color: DARK }}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setPasswordError("");
                  setGeneralError("");
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
            {passwordError ? (
              <Text style={{ color: ERROR, fontSize: 12, marginTop: 4 }}>
                {passwordError}
              </Text>
            ) : null}
          </Animated.View>

          {/* Forgot Password */}
          <Animated.View entering={FadeInDown.duration(600).delay(420)}>
            <TouchableOpacity
              style={{ marginBottom: 24, alignSelf: "flex-start" }}
              onPress={() => router.push("/(auth)/forgot-password" as any)}
            >
              <Text style={{ color: PRIMARY, fontWeight: "500", fontSize: 13 }}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Login Button */}
          <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          {(() => {
            const isFormValid = email.length > 0 && password.length > 0;
            return (
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isSubmitting || !isFormValid}
                style={{
                  backgroundColor: PRIMARY,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 20,
                  opacity: isSubmitting || !isFormValid ? 0.5 : 1,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                >
                  {isSubmitting ? "Logging in..." : "Log in"}
                </Text>
              </TouchableOpacity>
            );
          })()}
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeInDown.duration(600).delay(600)}>
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
              Don't have an account yet?
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
          </View>

          {/* Create Account */}
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: PRIMARY, fontWeight: "600", fontSize: 15 }}>
                Create an account
              </Text>
            </TouchableOpacity>
          </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
