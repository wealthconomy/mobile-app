import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react-native";
import { Alert, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useGetKycDocumentsQuery, useGetKycStatusQuery } from "@/src/store/api/kycApi";

const THEME_TEAL = "#155D5F";

export default function KYCLevel2Intro() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: kycDocsResponse } = useGetKycDocumentsQuery();
  const { data: kycStatusResponse } = useGetKycStatusQuery();

  const kycDocsPayload: any = kycDocsResponse?.data;
  const kycDocs: any = kycDocsPayload?.data || kycDocsPayload;

  const currentLevel = kycStatusResponse?.data?.currentLevel ?? user?.kycLevel ?? 1;
  const kycStatus = kycStatusResponse?.data?.status ?? user?.kycStatus;

  const isLevel2Complete =
    currentLevel >= 2 ||
    (kycDocs?.ninStatus === "Approved" && kycDocs?.faceStatus === "Approved") ||
    (kycDocs?.faceVerified && (kycDocs?.ninProviderVerified || Boolean(kycDocs?.idNumber)));

  const isLevel2Rejected =
    !isLevel2Complete &&
    (kycDocs?.ninStatus === "Rejected" ||
      kycDocs?.faceStatus === "Rejected" ||
      kycStatus === "REJECTED" ||
      kycStatus === "rejected");

  const isLevel2Pending =
    !isLevel2Complete &&
    !isLevel2Rejected &&
    (kycStatus === "PENDING" ||
      kycStatus === "pending" ||
      Boolean(kycDocs?.faceImageUrl || kycDocs?.idImageUrl));

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
            <Text className="text-[28px] font-semibold text-[#1A1A1A] text-center mb-2">
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
            <Text className="text-[#1A1A1A] font-semibold text-[18px] mb-6">
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
                  <Text className="text-[#1A1A1A] font-medium text-[15px] mb-1">
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
            <Text className="text-[#155D5F] font-semibold text-[15px] mb-4">
              Requirements
            </Text>
            <View className="flex-row items-center mb-3">
              <CheckCircle2 size={18} color={THEME_TEAL} />
              <Text className="text-[#1A1A1A] ml-3 font-medium text-[14px]">
                Government Issued ID Card
              </Text>
            </View>
            <View className="flex-row items-center">
              <CheckCircle2 size={18} color={THEME_TEAL} />
              <Text className="text-[#1A1A1A] ml-3 font-medium text-[14px]">
                Live Face Capture (Selfie)
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(700)}
            className="mb-8"
          >
            {isLevel2Complete ? (
              <View className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#15803D" />
                <View className="flex-1 ml-3">
                  <Text className="text-emerald-900 font-bold text-[14px]">
                    Level 2 Verified ✅
                  </Text>
                  <Text className="text-emerald-800 text-[12px] mt-0.5 leading-[17px]">
                    Your identity has been verified. You can now proceed to Level 3 Address Verification.
                  </Text>
                </View>
              </View>
            ) : isLevel2Pending ? (
              <View className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-row items-center">
                <Ionicons name="time" size={24} color="#D97706" />
                <View className="flex-1 ml-3">
                  <Text className="text-amber-900 font-bold text-[14px]">
                    Verification In Review ⏳
                  </Text>
                  <Text className="text-amber-800 text-[12px] mt-0.5 leading-[17px]">
                    Your documents have been submitted and are currently being reviewed by compliance. You will be notified once verified.
                  </Text>
                </View>
              </View>
            ) : isLevel2Rejected ? (
              <View className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-center">
                <Ionicons name="alert-circle" size={24} color="#DC2626" />
                <View className="flex-1 ml-3">
                  <Text className="text-red-900 font-bold text-[14px]">
                    Action Required ⚠️
                  </Text>
                  <Text className="text-red-800 text-[12px] mt-0.5 leading-[17px]">
                    One or more of your identity credentials were rejected. Please review and re-submit.
                  </Text>
                </View>
              </View>
            ) : null}

            <ThemedButton
              title={
                isLevel2Complete
                  ? "Proceed to Level 3 Address"
                  : isLevel2Pending
                  ? "Verification Under Review"
                  : isLevel2Rejected
                  ? "Re-submit Verification"
                  : "Start Verification"
              }
              onPress={() => {
                if (isLevel2Complete) {
                  router.replace("/kyc/level3-intro");
                  return;
                }
                if (isLevel2Pending) {
                  Alert.alert(
                    "Verification In Review ⏳",
                    "Your identity documents are currently under review by compliance. You cannot re-submit while review is in progress."
                  );
                  return;
                }
                router.push("/kyc/level2");
              }}
              style={{
                backgroundColor: isLevel2Pending ? "#94A3B8" : THEME_TEAL,
                height: 60,
                borderRadius: 20,
              }}
            />
            <Text className="text-[#64748B] text-[12px] text-center mt-5 font-medium">
              {isLevel2Complete
                ? "Identity verified. Upgrade to Level 3 for unlimited limits."
                : isLevel2Pending
                ? "Verification usually takes less than 24 hours."
                : "Verification usually takes less than 24 hours."}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
