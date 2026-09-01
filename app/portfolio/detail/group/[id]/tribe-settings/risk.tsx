import Header from "@/src/components/common/Header";
import ThemedButton from "@/src/components/ThemedButton";
import {
  useGetGroupDetailsQuery,
  useUpdateGroupSettingsMutation,
} from "@/src/store/api/groupApi";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PENALTY_OPTIONS = [
  "Grace period (24 hours)",
  "Immediate 5% penalty",
  "No penalty",
];

export default function RiskSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: group, isLoading } = useGetGroupDetailsQuery(id as string, {
    skip: !id,
  });
  const [updateSettings, { isLoading: isSaving }] = useUpdateGroupSettingsMutation();

  const [penalty, setPenalty] = useState(PENALTY_OPTIONS[0]);
  const [allowEarlyExit, setAllowEarlyExit] = useState(false);
  const [allowEmergencyWithdrawal, setAllowEmergencyWithdrawal] = useState(false);
  const [isPenaltyOpen, setIsPenaltyOpen] = useState(false);

  useEffect(() => {
    if (group) {
      if (group.penaltySetting === "IMMEDIATE_5") {
        setPenalty(PENALTY_OPTIONS[1]);
      } else if (group.penaltySetting === "NONE") {
        setPenalty(PENALTY_OPTIONS[2]);
      } else {
        setPenalty(PENALTY_OPTIONS[0]);
      }
      setAllowEarlyExit(!!group.allowEarlyExit);
      setAllowEmergencyWithdrawal(!!group.allowEmergencyWithdrawal);
    }
  }, [group]);

  const handleSave = async () => {
    let penaltySetting: "IMMEDIATE_5" | "GRACE_24" | "NONE" = "GRACE_24";
    if (penalty.includes("Immediate")) penaltySetting = "IMMEDIATE_5";
    else if (penalty.includes("No")) penaltySetting = "NONE";

    try {
      await updateSettings({
        id: id as string,
        body: {
          penaltySetting,
          allowEarlyExit,
          allowEmergencyWithdrawal,
        },
      }).unwrap();

      Alert.alert("Settings Saved", "Risk & discipline rules updated successfully.");
      router.back();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update risk settings.";
      Alert.alert("Update Failed", msg);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Risk & Discipline" onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#155D5F" />
        </View>
      </SafeAreaView>
    );
  }

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
                      className="px-5 py-4 border-b border-[#F8FAFC] flex-row items-center justify-between"
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
                        <Check size={18} color="#155D5F" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View className="mb-6">
              <View className="flex-row justify-between items-center bg-[#F3F4F6] rounded-2xl p-5">
                <View className="flex-1 mr-4">
                  <Text className="text-[#1A1A1A] font-bold text-base mb-1">
                    Allow Early Exit
                  </Text>
                  <Text className="text-[#64748B] text-xs">
                    Allow members to leave before the tribe goal completes.
                  </Text>
                </View>
                <Switch
                  value={allowEarlyExit}
                  onValueChange={setAllowEarlyExit}
                  trackColor={{ false: "#D1D5DB", true: "#155D5F" }}
                  thumbColor="white"
                />
              </View>
            </View>

            <View className="mb-8">
              <View className="flex-row justify-between items-center bg-[#F3F4F6] rounded-2xl p-5">
                <View className="flex-1 mr-4">
                  <Text className="text-[#1A1A1A] font-bold text-base mb-1">
                    Emergency Withdrawal
                  </Text>
                  <Text className="text-[#64748B] text-xs">
                    Allow emergency access to savings in critical cases.
                  </Text>
                </View>
                <Switch
                  value={allowEmergencyWithdrawal}
                  onValueChange={setAllowEmergencyWithdrawal}
                  trackColor={{ false: "#D1D5DB", true: "#155D5F" }}
                  thumbColor="white"
                />
              </View>
            </View>

            <ThemedButton
              title={isSaving ? "Saving..." : "Save"}
              onPress={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: "#155D5F",
                borderRadius: 16,
                height: 60,
                marginTop: 10,
              }}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
