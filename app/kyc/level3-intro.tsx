import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle2, Globe, TrendingUp, Trophy } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useGetKycDocumentsQuery, useGetKycStatusQuery } from "@/src/store/api/kycApi";

const THEME_TEAL = "#155D5F";

export default function KYCLevel3Intro() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: kycData } = useGetKycStatusQuery();
  const { data: kycDocsResponse } = useGetKycDocumentsQuery();

  const kycDocsPayload: any = kycDocsResponse?.data;
  const kycDocs: any = kycDocsPayload?.data || kycDocsPayload;

  const currentLevel = kycData?.data?.currentLevel ?? user?.kycLevel ?? 1;
  const kycStatus = kycData?.data?.status ?? user?.kycStatus;

  // Level 2 is verified if currentLevel >= 2 OR if NIN & Face are approved/verified
  const isLevel2Verified =
    currentLevel >= 2 ||
    (kycDocs?.ninStatus === "Approved" && kycDocs?.faceStatus === "Approved") ||
    (kycDocs?.faceVerified && (kycDocs?.ninProviderVerified || Boolean(kycDocs?.idNumber)));

  const isLevel2Pending = !isLevel2Verified && (kycStatus === "PENDING" || kycStatus === "pending");

  const isLevel3Rejected =
    isLevel2Verified &&
    (kycDocs?.passportStatus === "Rejected" ||
      kycDocs?.utilityStatus === "Rejected" ||
      kycStatus === "REJECTED" ||
      kycStatus === "rejected");

  const rejectionReason =
    (kycDocs?.passportStatus === "Rejected" && kycDocs?.passportRejectionReason) ||
    (kycDocs?.utilityStatus === "Rejected" && kycDocs?.utilityRejectionReason) ||
    kycData?.data?.kycRejectionReason ||
    user?.kycRejectionReason ||
    "";


  const benefits = [
    {
      title: "Unlimited Limits",
      description:
        "Remove all transaction and withdrawal caps for complete freedom.",
      icon: <TrendingUp size={20} color={THEME_TEAL} />,
    },
    {
      title: "Global Portfolios",
      description: "Unlock access to USD investments and international stocks.",
      icon: <Globe size={20} color={THEME_TEAL} />,
    },
    {
      title: "Wealth Advisory",
      description:
        "Get a dedicated wealth manager for personalized financial growth.",
      icon: <Trophy size={20} color={THEME_TEAL} />,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="Address Verification" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-6 py-8">
          <Animated.View
            entering={FadeInUp.duration(600).delay(100)}
            className="items-center mb-10"
          >
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: isLevel2Verified ? "#F2FFFF" : "#F8FAFC" }}
            >
              <Ionicons
                name={isLevel2Verified ? "location" : "lock-closed"}
                size={48}
                color={isLevel2Verified ? THEME_TEAL : "#94A3B8"}
              />
            </View>
            <Text className="text-[28px] font-semibold text-[#1A1A1A] text-center mb-2">
              {isLevel2Verified ? "Full Verification" : "Level 3 Address (Locked)"}
            </Text>
            <Text className="text-[#64748B] text-center text-[15px] leading-[22px] px-4 font-medium">
              {isLevel2Verified
                ? "Achieve Level 3 status by verifying your residential address for unrestricted wealth flow."
                : isLevel2Pending
                ? "Your Level 2 Identity Verification is currently under review. Address verification will be unlocked as soon as compliance approves Level 2."
                : "Complete and get verified for Level 2 Identity Verification before unlocking Level 3 address verification."}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(300)}
            className="mb-10"
          >
            <Text className="text-[#1A1A1A] font-semibold text-[18px] mb-6">
              Premium Privileges
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
                Residential Address Details
              </Text>
            </View>
            <View className="flex-row items-center">
              <CheckCircle2 size={18} color={THEME_TEAL} />
              <Text className="text-[#1A1A1A] ml-3 font-medium text-[14px]">
                Proof of Residency (Utility Bill, etc.)
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(700)}
            className="mb-8"
          >
            {isLevel3Rejected && (
              <View className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-start">
                <Ionicons name="alert-circle" size={24} color="#DC2626" style={{ marginTop: 2 }} />
                <View className="flex-1 ml-3">
                  <Text className="text-red-900 font-bold text-[14px]">
                    Document Re-upload Required
                  </Text>
                  <Text className="text-red-800 text-[12px] mt-0.5 leading-[17px]">
                    {rejectionReason
                      ? `Reason: "${rejectionReason}". Please upload a clearer copy.`
                      : "One or more of your address documents were rejected. Please review and re-upload to complete Level 3 verification."}
                  </Text>
                </View>
              </View>
            )}

            {!isLevel2Verified && (
              <View className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-row items-center">
                <Ionicons name="alert-circle" size={24} color="#D97706" />
                <View className="flex-1 ml-3">
                  <Text className="text-amber-900 font-bold text-[14px]">
                    {isLevel2Pending ? "Level 2 Verification Pending" : "Level 2 Verification Required"}
                  </Text>
                  <Text className="text-amber-800 text-[12px] mt-0.5 leading-[17px]">
                    {isLevel2Pending
                      ? "Your identity documents are currently under review. Address verification unlocks automatically once verified."
                      : "You must complete BVN, ID card, and face verification before proceeding to Level 3."}
                  </Text>
                </View>
              </View>
            )}

            <ThemedButton
              title={
                isLevel3Rejected
                  ? "Review & Re-upload Documents"
                  : isLevel2Verified
                  ? "Continue to Address Form"
                  : isLevel2Pending
                  ? "View Level 2 Status"
                  : "Complete Level 2 First"
              }
              onPress={() => {
                if (!isLevel2Verified) {
                  router.replace("/kyc/level2-intro");
                  return;
                }
                router.push("/kyc/level3");
              }}
              style={{
                backgroundColor: THEME_TEAL,
                height: 60,
                borderRadius: 20,
              }}
            />
            <Text className="text-[#64748B] text-[12px] text-center mt-5 font-medium">
              {isLevel2Verified
                ? "Start building your global fortune today."
                : "Higher KYC tiers grant unlimited transaction caps."}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

