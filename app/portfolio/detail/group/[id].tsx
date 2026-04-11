import Header from "@/src/components/common/Header";
import { RootState } from "@/src/store";
import { WealthGroup } from "@/src/store/slices/wealthGroupSlice";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Share2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const THEME = "#155D5F";
const THEME_BG = "#F2FFFF";

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id, member } = useLocalSearchParams();
  const groups = useSelector((state: RootState) => state.wealthGroup.groups);

  const group = useMemo(() => {
    return groups.find((g) => g.id === id) || groups[0];
  }, [id, groups]);

  const isMember = member === "true" || group.isMember || group.isAdmin;

  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestSentLocally, setRequestSentLocally] = useState(false);

  const handleJoin = () => {
    setIsJoinModalVisible(true);
  };

  const handleSendRequest = () => {
    setRequestSent(true);
    setRequestSentLocally(true);
    setTimeout(() => {
      setIsJoinModalVisible(false);
    }, 2000);
  };

  const handleInvite = async () => {
    try {
      const result = await Share.share({
        message: `Join my Wealth Tribe "${group.name}" on Wealthconomy! 🚀\n\nTarget: ₦${group.amount}\nFrequency: ${group.frequency}\n\nJoin here: wealthconomy://group/join/${group.id}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <Header title={group.name} onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-6 pb-12">
          <Text className="text-[20px] font-bold text-[#1A1A1A] mb-6">
            Group Details
          </Text>

          <View className="mb-8">
            <Image
              source={
                group.coverImage
                  ? { uri: group.coverImage }
                  : require("../../../../assets/images/group_recommended_1.png")
              }
              className="w-full h-48 rounded-2xl"
              resizeMode="cover"
            />
          </View>

          {/* Savings Card */}
          <View
            className="rounded-[20px] p-6 mb-8 relative overflow-hidden self-center"
            style={{
              width: 365,
              height: 140,
              backgroundColor: "white",
              borderWidth: 0.7,
              borderColor: "#D9D9D9",
            }}
          >
            <Image
              source={require("../../../../assets/images/group.png")}
              className="absolute"
              style={{
                width: 205.3,
                height: 205.3,
                left: 209.5,
                top: 30,
                opacity: 0.3,
                transform: [{ rotate: "-20.09deg" }],
              }}
              resizeMode="contain"
            />
            <Text className="text-[13px] font-bold mb-2">
              Total Group Savings
            </Text>
            <View className="flex-row items-baseline mb-2">
              <Text className="text-[#1A1A1A] text-[32px] font-bold">
                ₦{group.currentSavings}
              </Text>
            </View>
            <View className="flex-row items-center space-x-1">
              <Text className="text-[#64748B] text-[12px] font-bold">
                Group wealth grew to ₦{group.growthToday} today
              </Text>
              <Text className="text-[#4CAF50] text-[14px] font-bold">↑</Text>
            </View>
          </View>

          {/* Conditional (Above Stats) */}
          <View className="mb-8">
            <ProgressTracker group={group} />
            {!group.isAdmin && (
              <View className="h-[1px] bg-gray-100 w-full mb-6" />
            )}
            {isMember && <MemberActions group={group} />}
          </View>

          {/* Group Info Stats */}
          <View
            className="rounded-[20px] p-6 mb-8"
            style={{ backgroundColor: THEME_BG }}
          >
            <StatRow label="Group Name" value={group.name} />
            <StatRow label="Category" value={group.category} />
            <StatRow label="Started by" value={group.startDate} />
            <StatRow label="Ends by" value={group.endDate} />
            <StatRow
              label="Target 🎯"
              value={`₦${group.amount}`}
              valueColor={THEME}
            />
            <StatRow
              label="Wealth Group"
              value="Fixed Contribution Groups"
              valueColor={THEME}
            />
            <StatRow
              label="Daily Wealth Growth"
              value="₦4,697.69 ⬆️/week"
              valueColor={THEME}
            />
            <StatRow
              label="Individual Savings"
              value="₦290,697.69"
              valueColor={THEME}
            />
            <StatRow
              label="Each Wealth Growth"
              value="₦697.69 ⬆️/week"
              valueColor={THEME}
            />
            <StatRow
              label="Contribution Frequency"
              value={group.frequency}
              valueColor={THEME}
            />
            <StatRow
              label="Tribe Members"
              value={`${group.membersCount} members`}
              valueColor={THEME}
            />
          </View>

          {/* Conditional (Below Stats) */}
          {!isMember && (
            <TouchableOpacity
              onPress={handleJoin}
              disabled={requestSentLocally}
              className={`w-full h-14 rounded-2xl items-center justify-center mb-6 ${
                requestSentLocally
                  ? "bg-gray-100 border border-gray-200"
                  : "bg-[#155D5F]"
              }`}
            >
              <Text
                className={`font-bold text-base ${
                  requestSentLocally ? "text-gray-400" : "text-white"
                }`}
              >
                {requestSentLocally ? "Request Sent" : "Join Group"}
              </Text>
            </TouchableOpacity>
          )}

          {group.isAdmin && (
            <TouchableOpacity
              onPress={handleInvite}
              className="w-full h-14 bg-white border border-gray-200 rounded-2xl flex-row items-center justify-center space-x-2 mb-10"
            >
              <Share2 size={20} color="#64748B" />
              <Text className="text-[#64748B] font-bold">Invite Members</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Join Request Modal */}
      <Modal
        visible={isJoinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!requestSent) setIsJoinModalVisible(false);
        }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] px-5 pt-8 pb-12 items-center">
            <View className="w-12 h-1 bg-gray-200 rounded-full mb-8" />

            <View className="w-full items-center mb-6 relative">
              <Image
                source={require("../../../../assets/images/success.png")}
                className="w-full h-40 absolute"
                style={{ opacity: 0.5 }}
                resizeMode="contain"
              />
              <Image
                source={require("../../../../assets/images/sent.png")}
                className="w-32 h-32"
                resizeMode="contain"
              />
            </View>

            <Text className="text-[24px] font-bold text-center mb-4">
              {requestSent ? "Request Sent! 🎉" : "Join the Tribe! 🚀"}
            </Text>

            <Text className="text-center text-[#64748B] leading-[22px] mb-10 px-4">
              {requestSentLocally
                ? "Your request to join the group has been sent to the admin. You'll be notified once approved."
                : "You're about to request to join this wealth group. Make sure you're ready to commit to the goals!"}
            </Text>

            {!requestSent && (
              <TouchableOpacity
                onPress={handleSendRequest}
                className="w-full h-14 bg-[#155D5F] rounded-2xl items-center justify-center"
              >
                <Text className="text-white font-bold text-base">
                  Send Join Request
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ProgressTracker({ group }: { group: WealthGroup }) {
  return (
    <View className="mb-6 px-1">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-[18px]">➡️</Text>
        <Text className="text-[20px]">🏆</Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <View className="h-full bg-[#155D5F]" style={{ width: "20%" }} />
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-400 text-[12px] font-bold">20%</Text>
        <Text className="text-gray-400 text-[12px] font-bold">
          254 Weeks Left
        </Text>
      </View>
    </View>
  );
}

function MemberActions({ group }: { group: WealthGroup }) {
  return (
    <View className="mb-4">
      <TouchableOpacity className="w-full h-14 bg-[#155D5F] rounded-2xl items-center justify-center mb-3 flex-row space-x-2">
        <Ionicons name="add" size={24} color="white" />
        <Text className="text-white font-bold text-base">Deposit funds</Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled
        className="w-full h-14 bg-[#E2E8F0] rounded-2xl items-center justify-center flex-row space-x-2"
      >
        <Ionicons name="arrow-up-outline" size={20} color="#94A3B8" />
        <Text className="text-[#94A3B8] font-bold text-base">
          Withdraw funds
        </Text>
      </TouchableOpacity>
      <View className="h-[1px] bg-gray-100 w-full mt-6 mb-2" />
    </View>
  );
}

function StatRow({ label, value, valueColor = "#1A1A1A" }: any) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100/50">
      <Text className="text-[#64748B] text-[12px] font-medium">{label}</Text>
      <Text
        className="font-bold text-[12px] text-right"
        style={{ color: valueColor }}
      >
        {value}
      </Text>
    </View>
  );
}
