import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME_TEAL = "#155D5F";

export default function KYCLevel2Intro() {
  const router = useRouter();

  const benefits = [
    {
      title: "Unlock Withdrawals",
      description: "Enable withdrawals up to ₦1,000,000 daily.",
      icon: <Zap size={20} color={THEME_TEAL} />,
    },
    {
      title: "Premium Investing",
      description: "Access specialized investment goals and portfolios.",
      icon: <Zap size={20} color={THEME_TEAL} />,
    },
    {
      title: "Enhanced Security",
      description: "Protect your account with verified identity status.",
      icon: <ShieldCheck size={20} color={THEME_TEAL} />,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="Identity Verification" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-6 py-8">
          <Animated.View
            entering={FadeInUp.duration(600).delay(100)}
            className="items-center mb-10"
          >
            <View className="w-24 h-24 bg-[#F2FFFF] rounded-full items-center justify-center mb-6">
              <Ionicons name="id-card" size={48} color={THEME_TEAL} />
            </View>
            <Text className="text-[28px] font-bold text-[#1A1A1A] text-center mb-2">
              Verify Identity
            </Text>
            <Text className="text-[#64748B] text-center text-[15px] leading-[22px] px-4 font-medium">
              Complete Level 2 verification to expand your wealth management
              capabilities.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(300)}
            className="mb-10"
          >
            <Text className="text-[#1A1A1A] font-bold text-[18px] mb-6">
              What you'll unlock
            </Text>
            {benefits.map((benefit, index) => (
              <View
                key={index}
                className="flex-row items-start mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-100"
              >
                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4 shadow-sm">
                  {benefit.icon}
                </View>
                <View className="flex-1">
                  <Text className="text-[#1A1A1A] font-semibold text-[15px] mb-1">
                    {benefit.title}
                  </Text>
                  <Text className="text-[#64748B] text-[13px] leading-[18px]">
                    {benefit.description}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(500)}
            className="bg-[#155D5F08] p-6 rounded-[24px] mb-10"
          >
            <Text className="text-[#155D5F] font-bold text-[15px] mb-4">
              Requirements
            </Text>
            <View className="flex-row items-center mb-3">
              <CheckCircle2 size={18} color={THEME_TEAL} />
              <Text className="text-[#1A1A1A] ml-3 font-semibold text-[14px]">
                Government Issued ID Card
              </Text>
            </View>
            <View className="flex-row items-center">
              <CheckCircle2 size={18} color={THEME_TEAL} />
              <Text className="text-[#1A1A1A] ml-3 font-semibold text-[14px]">
                Live Face Capture (Selfie)
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(700)}
            className="mb-8"
          >
            <ThemedButton
              title="Start Verification"
              onPress={() => router.push("/kyc/level2")}
              style={{
                backgroundColor: THEME_TEAL,
                height: 60,
                borderRadius: 20,
              }}
            />
            <Text className="text-[#64748B] text-[12px] text-center mt-5 font-medium">
              Verification usually takes less than 24 hours.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
