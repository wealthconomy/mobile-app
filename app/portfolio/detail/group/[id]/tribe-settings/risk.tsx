import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PENALTY_OPTIONS = [
  "Grace period (24hours).",
  "Immediate penalty",
  "No penalty",
];
const EXIT_OPTIONS = [
  "Loss of interest",
  "Loss of interest + 5% fee",
  "Fixed fee (₦1,000)",
];

export default function RiskSettingsScreen() {
  const { id } = useLocalSearchParams();

  const [penalty, setPenalty] = useState(PENALTY_OPTIONS[0]);
  const [earlyExit, setEarlyExit] = useState(EXIT_OPTIONS[0]);
  const [exitRule, setExitRule] = useState(false);
  const [emergencyWithdrawal, setEmergencyWithdrawal] = useState(false);

  const [isPenaltyOpen, setIsPenaltyOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Risk & Discipline" onBack={() => router.back()} />

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 py-6">
            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Penalty Settings
              </Text>
              <TouchableOpacity
                onPress={() => setIsPenaltyOpen(!isPenaltyOpen)}
                activeOpacity={1}
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] text-base">{penalty}</Text>
                <Ionicons
                  name={isPenaltyOpen ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#1A1A1A"
                />
              </TouchableOpacity>
              {isPenaltyOpen && (
                <View className="bg-white rounded-2xl mt-2 border border-[#F1F5F9] overflow-hidden shadow-sm">
                  {PENALTY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => {
                        setPenalty(opt);
                        setIsPenaltyOpen(false);
                      }}
                      className="px-5 py-5 border-b border-[#F8FAFC] flex-row items-center justify-between"
                    >
                      <Text
                        className={`text-base ${
                          penalty === opt
                            ? "text-[#155D5F] font-bold"
                            : "text-[#64748B]"
                        }`}
                      >
                        {opt}
                      </Text>
                      {penalty === opt && (
                        <Check size={20} color="#155D5F" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text className="text-[10px] text-[#64748B] mt-2">
                Note: This is for late contribution
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Blacklist
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname:
                      "/portfolio/detail/group/[id]/tribe-settings/blacklist",
                    params: { id },
                  })
                }
                activeOpacity={1}
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] text-base">4 members</Text>
                <Ionicons name="people-outline" size={24} color="#1A1A1A" />
              </TouchableOpacity>
              <Text className="text-[10px] text-[#64748B] mt-2">
                Note: members who have been restricted due to non-compliance.
              </Text>
            </View>

            <View className="mb-8">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Early Exit
              </Text>
              <TouchableOpacity
                onPress={() => setIsExitOpen(!isExitOpen)}
                activeOpacity={1}
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] text-base">{earlyExit}</Text>
                <Ionicons
                  name={isExitOpen ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#1A1A1A"
                />
              </TouchableOpacity>
              {isExitOpen && (
                <View className="bg-white rounded-2xl mt-2 border border-[#F1F5F9] overflow-hidden shadow-sm">
                  {EXIT_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => {
                        setEarlyExit(opt);
                        setIsExitOpen(false);
                      }}
                      className="px-5 py-5 border-b border-[#F8FAFC] flex-row items-center justify-between"
                    >
                      <Text
                        className={`text-base ${
                          earlyExit === opt
                            ? "text-[#155D5F] font-bold"
                            : "text-[#64748B]"
                        }`}
                      >
                        {opt}
                      </Text>
                      {earlyExit === opt && (
                        <Check size={20} color="#155D5F" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1 mr-4">
                <Text className="text-[14px] font-medium text-[#1A1A1A]">
                  Exit Rule
                </Text>
                <Text className="text-[10px] text-[#64748B] mt-1">
                  Users must agree to the "Lock-in Period" (Funds cannot be
                  withdrawn until the end of the cycle).
                </Text>
              </View>
              <Switch
                value={exitRule}
                onValueChange={setExitRule}
                trackColor={{ false: "#E2E8F0", true: "#155D5F" }}
                thumbColor="#FFF"
              />
            </View>

            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-1 mr-4">
                <Text className="text-[14px] font-medium text-[#1A1A1A]">
                  Emergency Withdrawal
                </Text>
                <Text className="text-[10px] text-[#64748B] mt-1">
                  For members to request funds before the goal date.
                </Text>
              </View>
              <Switch
                value={emergencyWithdrawal}
                onValueChange={setEmergencyWithdrawal}
                trackColor={{ false: "#E2E8F0", true: "#155D5F" }}
                thumbColor="#FFF"
              />
            </View>

            <ThemedButton
              title="Save"
              onPress={() => router.back()}
              style={{
                backgroundColor: "#155D5F",
                borderRadius: 16,
                height: 64,
                marginTop: 10,
              }}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
