import Header from "@/src/components/common/Header";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import {
  useGetMyProfileQuery,
  useToggleBiometricsMutation,
} from "@/src/store/api/userApi";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

const PRIMARY = "#155D5F";
const BRAND_TEAL = "#008185";
const DARK = "#1A1A1A";

export default function EnableFaceIDScreen() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: profileData } = useGetMyProfileQuery();
  const [toggleBiometrics, { isLoading: isTogglingBio }] = useToggleBiometricsMutation();

  const currentBiometricsEnabled = Boolean(
    profileData?.data?.biometricsEnabled ?? authUser?.biometricsEnabled ?? false
  );
  const [isBioEnabled, setIsBioEnabled] = useState(currentBiometricsEnabled);

  useEffect(() => {
    setIsBioEnabled(currentBiometricsEnabled);
  }, [currentBiometricsEnabled]);

  const handleBioToggle = async (value: boolean) => {
    setIsBioEnabled(value);
    try {
      await toggleBiometrics({ biometricsEnabled: value }).unwrap();
      Alert.alert(
        "Biometrics Updated",
        value
          ? "Biometric authentication enabled successfully!"
          : "Biometric authentication disabled."
      );
    } catch (err: any) {
      setIsBioEnabled(!value);
      Alert.alert(
        "Error",
        err?.data?.message || "Could not update biometric setting. Please try again."
      );
    }
  };

  const bioFeatures = [
    {
      icon: "lightning-bolt-outline" as const,
      title: "Instant App Unlock",
      description: "Quickly unlock Wealthconomy with your face or fingerprint without entering your 6-digit passcode every time.",
    },
    {
      icon: "shield-check-outline" as const,
      title: "Device-Level Security",
      description: "Your biometric credentials stay encrypted inside your device's Secure Enclave and are never sent to our servers.",
    },
    {
      icon: "key-outline" as const,
      title: "Always Protected",
      description: "Your 6-digit passcode remains active as a trusted backup anytime biometrics is unavailable.",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Face ID & Biometrics" />

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Biometric Emblem */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.heroSection}
        >
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <MaterialCommunityIcons
                name="fingerprint"
                size={44}
                color={PRIMARY}
              />
            </View>
          </View>
          <Text style={styles.heroTitle}>Biometric Authentication</Text>
          <Text style={styles.heroSubtitle}>
            Fast, seamless, and secure access using your device's biometric sensors.
          </Text>
        </Animated.View>

        {/* Toggle Card */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={styles.toggleCard}
        >
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={styles.toggleTitle}>Enable Biometrics</Text>
            <Text style={styles.toggleDesc}>
              Use Face ID / Touch ID / Fingerprint on this device
            </Text>
          </View>

          {isTogglingBio ? (
            <ActivityIndicator size="small" color={PRIMARY} />
          ) : (
            <Switch
              value={isBioEnabled}
              onValueChange={handleBioToggle}
              trackColor={{ false: "#E5E7EB", true: PRIMARY }}
              thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
              ios_backgroundColor="#E5E7EB"
            />
          )}
        </Animated.View>

        {/* Feature Highlights */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.featuresSection}
        >
          <Text style={styles.featuresHeading}>How it works</Text>

          <View style={{ gap: 14 }}>
            {bioFeatures.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={PRIMARY}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>{item.title}</Text>
                  <Text style={styles.featureItemDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Security Notice */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(300)}
          style={styles.noticeCard}
        >
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.noticeText}>
            To configure or reset biometrics at the system level, open your device's Settings app.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  outerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${PRIMARY}12`,
    borderWidth: 1.5,
    borderColor: `${PRIMARY}25`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
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
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: DARK,
    marginBottom: 6,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  toggleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 12.5,
    color: "#6B7280",
    lineHeight: 18,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: DARK,
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  featureIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E6F4F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
    marginBottom: 3,
  },
  featureItemDesc: {
    fontSize: 12.5,
    color: "#6B7280",
    lineHeight: 18,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
  },
});
