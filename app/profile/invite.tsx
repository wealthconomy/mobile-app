import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { FileText, MailCheck, Wallet } from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useGetMyProfileQuery } from "@/src/store/api/userApi";
import { useGetMyReferralSummaryQuery } from "@/src/store/api/referralApi";
import { router } from "expo-router";

export default function InviteScreen() {
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const { data: profileResponse } = useGetMyProfileQuery();
  const activeUser = profileResponse?.data || authUser;

  const { data: summaryResp } = useGetMyReferralSummaryQuery(undefined, { refetchOnMountOrArgChange: true });
  const summary = summaryResp?.data as any;

  const referralCode =
    activeUser?.referralCode ||
    activeUser?.id?.slice(0, 8)?.toUpperCase() ||
    "—";

  const onShare = async () => {
    try {
      const referralLink = `https://wealthconomy.org/invite/${referralCode}`;
      await Share.share({
        message: `Join me on Wealthconomy and get rewards! Use my referral link: ${referralLink}`,
      });
    } catch (error: any) {
      // ignore cancelled share
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Invite a friend" />

      {/* Decorative Background Shapes */}
      <View
        className="absolute"
        style={{
          width: 374,
          height: 419,
          top: 29,
          left: 14,
          opacity: 0.15,
          zIndex: -1,
        }}
      >
        <Image
          source={require("../../assets/images/success.png")}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-5">
          {/* Illustration Section */}
          <View className="items-center mt-10 mb-12 h-[260px] justify-center relative">
            <View
              className="absolute"
              style={{
                width: 500,
                height: 150,
                top: -30,
                left: -60, // Adjusted to center visually
              }}
            >
              <Image
                source={require("../../assets/images/invite1.png")}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>

            <View className="items-center z-10 px-10 pt-6">
              <Text className="text-[28px] font-extrabold text-[#323232] text-center leading-[34px] mt--50">
                Invite{"\n"}Friends to{"\n"}Earn Rewards
              </Text>

              <View className="mt-4 relative items-center justify-center">
                <Image
                  source={require("../../assets/images/invite2.png")}
                  style={{ width: 270, height: 120 }}
                  resizeMode="contain"
                />
                <View className="absolute z-20 pb-5">
                  <Text className="text-[36px] font-extrabold text-[#155D5F]">
                    ₦5,000
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Steps Row with Dashed Connectors */}
          <View className="flex-row items-start justify-between mb-10 px-2 relative">
            {/* Dashed Line Background Overlay */}
            <View className="absolute top-7 left-14 right-14 border-t border-dashed border-[#2FB0B5] opacity-30" />

            <StepIcon
              Icon={MailCheck}
              text="Share your unique link with friend."
            />
            <StepIcon
              Icon={FileText}
              text="They sign up and complete their first transaction."
            />
            <StepIcon
              Icon={Wallet}
              text="You'll get rewards credited to your wallet!"
            />
          </View>

          {/* Referral Code Pill */}
          <View
            style={{
              backgroundColor: "#EEF7F8",
              borderRadius: 14,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#C8E6E8",
            }}
          >
            <View>
              <Text style={{ fontSize: 10, color: "#6B7280", fontWeight: "500", marginBottom: 2 }}>
                Your Referral Code
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#155D5F", letterSpacing: 2 }}>
                {referralCode}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onShare}
              style={{
                backgroundColor: "#155D5F",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons name="copy-outline" size={14} color="white" />
              <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>Copy & Share</Text>
            </TouchableOpacity>
          </View>

          {/* Live Summary Strip */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#F9FAFB",
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#F3F4F6",
              gap: 0,
            }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#155D5F" }}>
                {summary?.totalReferrals ?? "—"}
              </Text>
              <Text style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>Friends Invited</Text>
            </View>
            <View style={{ width: 1, backgroundColor: "#E5E7EB" }} />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#D48E00" }}>
                {summary?.totalEarnedKobo
                  ? `₦${(parseFloat(summary.totalEarnedKobo) / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`
                  : "₦0"}
              </Text>
              <Text style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>Total Earned</Text>
            </View>
          </View>

          {/* Invite Button */}
          <TouchableOpacity
            onPress={onShare}
            className="bg-[#155D5F] h-16 rounded-2xl flex-row items-center justify-center gap-x-3 active:opacity-90"
            style={{ marginBottom: 12 }}
          >
            <Ionicons name="share-outline" size={24} color="white" />
            <Text className="text-white text-lg font-bold">Invite Friend</Text>
          </TouchableOpacity>

          {/* My Referrals Button */}
          <TouchableOpacity
            onPress={() => router.push("/profile/my-referrals" as any)}
            style={{
              height: 56,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderWidth: 1.5,
              borderColor: "#155D5F",
              backgroundColor: "transparent",
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={20} color="#155D5F" />
            <Text style={{ color: "#155D5F", fontWeight: "700", fontSize: 15 }}>
              Check My Referrals
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StepIcon = ({ Icon, text }: { Icon: any; text: string }) => (
  <View className="items-center w-[30%]">
    <View
      className="w-14 h-14 bg-[#EEF7F8] rounded-full items-center justify-center mb-4 border border-[#E5F3F4]"
      style={{ padding: 5 }}
    >
      <Icon size={24} color="#155D5F" strokeWidth={2.5} />
    </View>
    <Text className="text-[10.5px] text-[#6B7280] text-center leading-[15px] font-medium">
      {text}
    </Text>
  </View>
);
