import Header from "@/src/components/common/Header";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExitGroupScreen() {
  const { id } = useLocalSearchParams();
  const [reason, setReason] = useState("");

  const PENALTY_AMOUNT = "XXXX";

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Exit Group" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-6">
          <View className="items-center mb-10">
            <Text className="text-[28px] font-bold text-[#1A1A1A] mb-3 text-center">
              Exiting Group?
            </Text>
            <Text className="text-[14px] text-[#64748B] text-center px-4">
              Leaving a group affects your community standing.
            </Text>
          </View>

          <View className="w-full mb-10">
            <Text className="text-[16px] font-bold text-[#1A1A1A] mb-6">
              Before you go:
            </Text>

            <View className="mb-5">
              <Text className="text-[14px] leading-[22px] text-[#1A1A1A]">
                <Text className="font-bold">The Team:</Text> Your exit might
                delay the payout for other members.
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-[14px] leading-[22px] text-[#1A1A1A]">
                <Text className="font-bold">The Cost:</Text> An exit penalty of
                ₦{PENALTY_AMOUNT} applies as per group rules.
              </Text>
            </View>

            <View className="mb-8">
              <Text className="text-[14px] leading-[22px] text-[#1A1A1A]">
                <Text className="font-bold">The Funds:</Text> Your contributions
                will be moved to your wallet after the current cycle ends (or as
                per admin approval).
              </Text>
            </View>
          </View>

          <View className="w-full mb-10">
            <Text className="text-[14px] text-[#1A1A1A] mb-8">
              "Don't leave your team hanging! Why are you leaving?"
            </Text>

            <Text className="text-[14px] text-[#64748B] font-medium mb-3">
              Reason for leaving
            </Text>
            <TextInput
              className="bg-[#F6F6F6] rounded-2xl p-4 text-[#1A1A1A] min-h-[140px]"
              multiline
              textAlignVertical="top"
              placeholder=""
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
              onPress={() => {
                // Handle exit request
                router.back();
              }}
              className="w-full h-14 bg-[#FFE4E4] rounded-2xl items-center justify-center"
            >
              <Text className="text-[#FF5A5A] font-bold text-base">
                Request Exit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
