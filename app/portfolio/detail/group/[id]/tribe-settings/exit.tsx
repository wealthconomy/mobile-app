import Header from "@/src/components/common/Header";
import { useExitGroupMutation } from "@/src/store/api/groupApi";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExitGroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reason, setReason] = useState("");
  const [exitGroup, { isLoading: isExiting }] = useExitGroupMutation();

  const handleExit = () => {
    Alert.alert(
      "Confirm Exit",
      "Are you sure you want to exit this tribe? Any active penalties per tribe rules will be applied.",
      [
        { text: "Stay with Group", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: async () => {
            try {
              await exitGroup(id as string).unwrap();
              Alert.alert("Exited Tribe", "You have successfully exited this group.");
              router.replace("/(tabs)/portfolios/wealth-group" as any);
            } catch (err: any) {
              const msg = err?.data?.message || err?.message || "Failed to exit group.";
              Alert.alert("Exit Failed", msg);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Exit Group" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-6">
          <View className="items-center mb-8">
            <Text className="text-[26px] font-bold text-[#1A1A1A] mb-2 text-center">
              Exiting Group?
            </Text>
            <Text className="text-[14px] text-[#64748B] text-center px-4">
              Leaving a group affects your tribe standing and payout schedule.
            </Text>
          </View>

          <View className="w-full mb-8">
            <Text className="text-[16px] font-bold text-[#1A1A1A] mb-4">
              Before you go:
            </Text>

            <View className="mb-4">
              <Text className="text-[14px] leading-[22px] text-[#1A1A1A]">
                <Text className="font-bold">The Team:</Text> Your exit might delay the payout cycle for other members.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-[14px] leading-[22px] text-[#1A1A1A]">
                <Text className="font-bold">The Funds:</Text> Your settled contributions will be credited back to your main wallet.
              </Text>
            </View>
          </View>

          <View className="w-full mb-8">
            <Text className="text-[14px] text-[#64748B] font-medium mb-3">
              Reason for leaving (Optional)
            </Text>
            <TextInput
              className="bg-[#F6F6F6] rounded-2xl p-4 text-[#1A1A1A] min-h-[120px]"
              multiline
              textAlignVertical="top"
              placeholder="Tell the admin why you are leaving..."
              value={reason}
              onChangeText={setReason}
            />
          </View>

          <View className="w-full pb-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-full h-14 bg-white border border-[#E2E8F0] rounded-2xl items-center justify-center mb-4"
            >
              <Text className="text-[#64748B] font-bold text-base">
                Stay with Group
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExit}
              disabled={isExiting}
              className="w-full h-14 bg-[#FFE4E4] rounded-2xl items-center justify-center"
            >
              {isExiting ? (
                <ActivityIndicator color="#FF5A5A" />
              ) : (
                <Text className="text-[#FF5A5A] font-bold text-base">
                  Exit Group
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
