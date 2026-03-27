import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { FileText, MailCheck, Wallet } from "lucide-react-native";
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

export default function InviteScreen() {
  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Join me on Wealthconomy and get ₦5,000! Use my referral link: https://wealthconomy.com/invite/REF123",
      });
    } catch (error: any) {
      alert(error.message);
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
          source={require("../assets/images/success.png")}
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
                source={require("../assets/images/invite1.png")}
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
                  source={require("../assets/images/invite2.png")}
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
          <View className="flex-row items-start justify-between mb-16 px-2 relative">
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
              text="You'll get ₦5,000 credited to your wallets!"
            />
          </View>

          {/* Invite Button with Native Sharing */}
          <TouchableOpacity
            onPress={onShare}
            className="bg-[#155D5F] h-16 rounded-2xl flex-row items-center justify-center gap-x-3 active:opacity-90"
          >
            <Ionicons name="share-outline" size={24} color="white" />
            <Text className="text-white text-lg font-bold">Invite friend</Text>
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
