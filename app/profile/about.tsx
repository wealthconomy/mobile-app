import Header from "@/src/components/common/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#155D5F";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.wealthconomy.app";
const APP_STORE_URL = "https://apps.apple.com/app/id6740000000";

export default function AboutScreen() {
  const handleVersionCheck = async () => {
    const targetUrl = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        Alert.alert(
          "Check for Updates",
          "You are on the latest version of Wealthconomy (v1.0.0).",
        );
      }
    } catch {
      Alert.alert(
        "Check for Updates",
        "You are on the latest version of Wealthconomy (v1.0.0).",
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="About Wealthconomy" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
      >
        {/* Branding & Version Banner */}
        <View className="items-center my-6">
          <View className="w-24 h-24 bg-[#EEF7F8] rounded-2xl items-center justify-center mb-4">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 64, height: 64 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-[#1A1A1A] font-extrabold text-[22px] mb-1">
            Wealthconomy
          </Text>
          <View className="bg-[#E6F4F4] px-3 py-1 rounded-full mb-2">
            <Text className="text-[#155D5F] font-bold text-[12px]">
              Version 1.0.0 (Build 100)
            </Text>
          </View>
          <Text className="text-[#6B7280] text-[13px] text-center px-6 leading-[18px]">
            Empowering your financial growth through disciplined savings,
            structured investments, and community wealth building.
          </Text>
        </View>

        <View className="h-[1px] bg-gray-100 my-4" />

        {/* Legal & App Links */}
        <Text className="text-[#6B7280] font-extrabold text-[12px] uppercase tracking-wider mb-3 px-1">
          Legal & App Information
        </Text>

        <View className="bg-[#F8F9FA] rounded-[20px] p-2 border border-gray-100 mb-6">
          <AboutMenuItem
            icon={
              <MaterialCommunityIcons
                name="file-document-outline"
                size={22}
                color={TEAL}
              />
            }
            title="Terms & Conditions"
            subtitle="User agreement, rules, & service terms"
            onPress={() => router.push("/profile/terms" as any)}
          />

          <View className="h-[1px] bg-gray-200/50 mx-4" />

          <AboutMenuItem
            icon={
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={22}
                color={TEAL}
              />
            }
            title="Privacy Policy"
            subtitle="Security standards, data protection & privacy"
            onPress={() => router.push("/profile/privacy" as any)}
          />

          <View className="h-[1px] bg-gray-200/50 mx-4" />

          <AboutMenuItem
            icon={
              <Ionicons name="arrow-up-circle-outline" size={22} color={TEAL} />
            }
            title="Version Upgrade / Check Updates"
            subtitle="Redirect to Play Store / App Store for latest build"
            onPress={handleVersionCheck}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AboutMenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center p-4 rounded-2xl active:bg-gray-100"
    >
      <View className="w-10 h-10 bg-[#E6F4F4] rounded-xl items-center justify-center mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[#1A1A1A] font-bold text-[15px] mb-0.5">
          {title}
        </Text>
        <Text className="text-[#6B7280] text-[12px] font-medium leading-[16px]">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
