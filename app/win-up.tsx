import Header from "@/src/components/common/Header";
import { RecentActivityList } from "@/src/features/home/components/RecentActivityList";
import { SubWealthCard } from "@/src/features/home/components/SubWealthCard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WinUpScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />
      <Header title="Win Up" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
      >
        {/* Total Savings Card */}
        <View className="mb-10">
          <SubWealthCard description="Build a discipline of savings tailored to your goals and income." />
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-8 space-x-4 gap-5">
          <TouchableOpacity
            className="flex-1 bg-[#30999C] rounded-2xl p-5 items-center justify-center border border-[#155D5F]/20"
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/deposit",
                params: { plan: "WealthFlex" },
              })
            }
          >
            <View className="items-center justify-center mb-3">
              <Ionicons name="add" size={24} color="white" />
            </View>
            <Text className="text-[#fefefe] font-bold text-sm">
              Deposit funds
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-[#30999C] rounded-2xl p-5 items-center justify-center border border-[#155D5F]/20"
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/withdraw",
                params: { plan: "WealthFlex" },
              })
            }
          >
            <View className="items-center justify-center mb-3">
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={24}
                color="white"
              />
            </View>
            <Text className="text-[#feffff] font-bold text-sm">
              Withdraw funds
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View>
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-[#1A1A1A] font-extrabold text-[16px] tracking-tight">
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/transactions" as any)}
            >
              <Text className="text-[#155D5F] text-[13px] font-bold">
                View all
              </Text>
            </TouchableOpacity>
          </View>
          <RecentActivityList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
