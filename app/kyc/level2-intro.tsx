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
import {
  idDocStatus,
  faceDocStatus,
  idRejectionText,
  faceRejectionText,
  isLevel2Verified as checkIsLevel2Verified,
  isLevel2Rejected as checkIsLevel2Rejected,
  isLevel2Pending as checkIsLevel2Pending,
  hasLevel2Uploads,
} from "@/src/features/kyc/utils/kycState";

const THEME_TEAL = "#155D5F";

export default function KYCLevel2Intro() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: kycDocsResponse } = useGetKycDocumentsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: kycStatusResponse } = useGetKycStatusQuery(undefined, { refetchOnMountOrArgChange: true });

  const kycDocsPayload: any = kycDocsResponse?.data;
  const kycDocs: any = kycDocsPayload?.data || kycDocsPayload;

  const currentLevel = kycStatusResponse?.data?.currentLevel ?? user?.kycLevel ?? 1;
  const kycStatus = kycStatusResponse?.data?.status ?? user?.kycStatus;

  const isIdRejected = idDocStatus(kycDocs) === "REJECTED";
  const isFaceRejected = faceDocStatus(kycDocs) === "REJECTED";
  const isLevel2Rejected = checkIsLevel2Rejected(kycDocs, user);
  const isLevel2Complete = checkIsLevel2Verified(kycDocs, user);

  // Extract specific rejection reasons
  const idReason = isIdRejected ? idRejectionText(kycDocs) : null;
  const faceReason = isFaceRejected ? faceRejectionText(kycDocs) : null;
  const generalReason =
    idReason ||
    faceReason ||
    kycDocs?.kycRejectionReason ||
    kycDocs?.rejectionReason ||
    kycStatusResponse?.data?.kycRejectionReason ||
    (kycStatusResponse?.data as any)?.reason ||
    user?.kycRejectionReason ||
    user?.rejectionReason ||
    (user as any)?.reason;

  const specificRejectionReason =
    isIdRejected && isFaceRejected && idReason && faceReason && idReason !== faceReason
      ? `ID: ${idReason} | Face: ${faceReason}`
      : idReason || faceReason || generalReason;

  const rejectionDetail =
    isIdRejected && isFaceRejected
      ? "ID Document & Face Selfie were both rejected"
      : isIdRejected
      ? "Government ID was rejected"
      : isFaceRejected
      ? "Live Face Selfie was rejected"
      : "Level 2 Verification was rejected";

  const hasIdUpload = Boolean(kycDocs?.idImageUrl || user?.idImageUrl);
  const hasFaceUpload = Boolean(
    kycDocs?.faceImageUrl ||
    kycDocs?.selfieUrl ||
    user?.faceImageUrl ||
    user?.imageUrl ||
    kycDocs?.faceVerified
  );
  const hasAllLevel2Data = hasLevel2Uploads(kycDocs, user);

  // It is ONLY truly in review if the user has actually uploaded BOTH required documents!
  const isLevel2Pending = checkIsLevel2Pending(kycDocs, user);

  const isLevel2Incomplete = !isLevel2Complete && !isLevel2Rejected && !hasAllLevel2Data;

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
                Government ID (NIN, Driver's License, or International Passport)
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
                    Your ID and live face selfie have been submitted and are currently being reviewed by compliance.
                  </Text>
                </View>
              </View>
            ) : isLevel2Rejected ? (
              <View className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-start">
                <Ionicons name="alert-circle" size={24} color="#DC2626" style={{ marginTop: 2 }} />
                <View className="flex-1 ml-3">
                  <Text className="text-red-900 font-bold text-[14px]">
                    {rejectionDetail} ⚠️
                  </Text>
                  <Text className="text-red-800 text-[13px] mt-1 leading-[18px]">
                    {specificRejectionReason
                      ? `Reason: "${specificRejectionReason}". Please re-take with clearer framing and re-submit.`
                      : "One or more of your identity credentials were rejected. Please review and re-submit your ID and face selfie."}
                  </Text>
                </View>
              </View>
            ) : isLevel2Incomplete && (kycStatus === "PENDING" || kycStatus === "pending" || hasIdUpload || hasFaceUpload) ? (
              <View className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex-row items-center">
                <Ionicons name="information-circle" size={24} color="#2563EB" />
                <View className="flex-1 ml-3">
                  <Text className="text-blue-900 font-bold text-[14px]">
                    Incomplete Verification
                  </Text>
                  <Text className="text-blue-800 text-[12px] mt-0.5 leading-[17px]">
                    {!hasIdUpload && !hasFaceUpload
                      ? "Government ID and live face scan are required to verify your identity. Tap below to upload both."
                      : !hasIdUpload
                      ? "Government ID photo is missing. Tap below to capture and submit your ID."
                      : "Live face scan is missing. Tap below to complete your face scan."}
                  </Text>
                </View>
              </View>
            ) : null}

            <ThemedButton
              title={
                isLevel2Complete
                  ? "Proceed to Level 3 Address"
                  : isLevel2Rejected
                  ? "Re-submit Level 2 Verification"
                  : isLevel2Pending
                  ? "Re-take / Re-submit Verification"
                  : isLevel2Incomplete && (kycStatus === "PENDING" || kycStatus === "pending")
                  ? "Continue & Upload Required Documents"
                  : "Start Verification"
              }
              onPress={() => {
                if (isLevel2Complete) {
                  router.replace("/kyc/level3-intro");
                  return;
                }
                router.push("/kyc/level2");
              }}
              style={{
                backgroundColor: isLevel2Rejected ? "#DC2626" : THEME_TEAL,
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
