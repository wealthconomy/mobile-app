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
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { useDispatch } from "react-redux";
import { authApi } from "../../api/auth";
import { setCredentials, setLoading } from "../../src/store/slices/authSlice";

const PRIMARY = "#155D5F";
const DARK = "#323232";
const SECONDARY = "#6B7280";
const BORDER = "#E5E5E5";
const MUTED = "#F7F7F7";
const ERROR = "#DC2626";

const googleSvg = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.987" fill-rule="evenodd" clip-rule="evenodd" d="M8.11015 1.19334C8.92578 1.10222 9.4084 1.10222 10.2848 1.19334C11.8361 1.42295 13.2741 2.14001 14.391 3.24084C13.6363 3.95425 12.8915 4.67807 12.1568 5.41209C10.7498 4.21959 9.17928 3.94434 7.44528 4.58634C6.17328 5.17134 5.28753 6.11934 4.78803 7.43034C3.97177 6.82265 3.16615 6.20081 2.37153 5.56509C2.31631 5.53603 2.25323 5.52538 2.19153 5.53472C3.45378 3.10097 5.42628 1.65347 8.10903 1.19222" fill="#F44336"/>
<path opacity="0.997" fill-rule="evenodd" clip-rule="evenodd" d="M2.18929 5.53484C2.25304 5.52509 2.31341 5.53521 2.37041 5.56521C3.16504 6.20093 3.97066 6.82277 4.78691 7.43046C4.65847 7.94128 4.5775 8.46287 4.54504 8.98859C4.57279 9.49709 4.65341 9.99621 4.78691 10.486L2.25004 12.5053C1.14529 10.1968 1.12504 7.87334 2.18929 5.53484Z" fill="#FFC107"/>
<path opacity="0.999" fill-rule="evenodd" clip-rule="evenodd" d="M14.2707 14.9535C13.4808 14.2569 12.6538 13.6034 11.7935 12.996C12.656 12.387 13.1795 11.5515 13.364 10.4895H9.13733V7.5544C11.5748 7.53415 14.0112 7.55477 16.4465 7.61627C16.9085 10.125 16.3748 12.387 14.8456 14.4023C14.6637 14.5956 14.4711 14.7796 14.2707 14.9535Z" fill="#448AFF"/>
<path opacity="0.993" fill-rule="evenodd" clip-rule="evenodd" d="M4.78688 10.4844C5.70938 12.7771 7.40063 13.8474 9.86063 13.6951C10.5512 13.6152 11.2133 13.3739 11.7934 12.9909C12.6544 13.5999 13.4801 14.2524 14.2706 14.9484C13.0181 16.0739 11.4211 16.7417 9.74025 16.8429C9.35836 16.8734 8.97464 16.8734 8.59275 16.8429C5.72925 16.5054 3.615 15.0586 2.25 12.5026L4.78688 10.4844Z" fill="#43A047"/>
</svg>`;

const appleSvg = `<svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.6371 17.28C11.6571 18.23 10.5871 18.08 9.55708 17.63C8.46708 17.17 7.46708 17.15 6.31708 17.63C4.87708 18.25 4.11708 18.07 3.25708 17.28C-1.62292 12.25 -0.902922 4.59 4.63708 4.31C5.98708 4.38 6.92708 5.05 7.71708 5.11C8.89708 4.87 10.0271 4.18 11.2871 4.27C12.7971 4.39 13.9371 4.99 14.6871 6.07C11.5671 7.94 12.3071 12.05 15.1671 13.2C14.5971 14.7 13.8571 16.19 12.6271 17.29L12.6371 17.28ZM7.61708 4.25C7.46708 2.02 9.27708 0.18 11.3571 0C11.6471 2.58 9.01708 4.5 7.61708 4.25Z" fill="black"/>
</svg>`;

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
      dispatch(setLoading(true));
      const response = await authApi.login(email, password);
      dispatch(setCredentials(response));
      router.replace("/(tabs)");
    } catch (err: any) {
      // API will return specific errors; mock shows generic fallback
      const msg = err?.message ?? "";
      if (msg.toLowerCase().includes("password")) {
        setPasswordError("Incorrect password. Please try again.");
      } else if (
        msg.toLowerCase().includes("email") ||
        msg.toLowerCase().includes("user")
      ) {
        setEmailError("No account found with this email.");
      } else {
        setGeneralError("Incorrect email or password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
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
          <View
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
              To sign in to your account in the application,{"\n"}enter your
              email and your password
            </Text>
          </View>

          {/* General Error Banner */}
          {generalError ? (
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
              <Text style={{ color: ERROR, fontSize: 13 }}>{generalError}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={{ marginBottom: 14 }}>
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
          </View>

          {/* Password */}
          <View style={{ marginBottom: 10 }}>
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
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={{ marginBottom: 24, alignSelf: "flex-start" }}
            onPress={() => router.push("/(auth)/forgot-password" as any)}
          >
            <Text style={{ color: PRIMARY, fontWeight: "500", fontSize: 13 }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 20,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
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

          {/* Apple Sign In */}
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: BORDER,
              borderRadius: 12,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <SvgXml xml={appleSvg} width={16} height={18} />
            <Text style={{ color: DARK, fontWeight: "500", fontSize: 15 }}>
              Sign In with Apple
            </Text>
          </TouchableOpacity>

          {/* Google Sign In */}
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: BORDER,
              borderRadius: 12,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <SvgXml xml={googleSvg} width={18} height={18} />
            <Text style={{ color: DARK, fontWeight: "500", fontSize: 15 }}>
              Sign In with Google
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
