import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NUDGE_OPTIONS = [
  "1 day before",
  "2 days before",
  "3 week before",
  "4 day before",
  "5 days before",
  "Immediately",
];

export default function NotificationSettingsScreen() {
  const { id } = useLocalSearchParams();

  const [nudgeFrequency, setNudgeFrequency] = useState(NUDGE_OPTIONS[0]);
  const [reminderInterval, setReminderInterval] = useState(
    "3 hours reminder interval",
  );
  const [isNudgeOpen, setIsNudgeOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Notifications" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-6">
          <View className="mb-6">
            <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
              Nudge Frequency
            </Text>
            <TouchableOpacity
              onPress={() => setIsNudgeOpen(!isNudgeOpen)}
              activeOpacity={1}
              className="bg-[#F3F4F6] rounded-2xl h-16 px-5 flex-row items-center justify-between"
            >
              <Text className="text-[#94A3B8] text-base">{nudgeFrequency}</Text>
              <Ionicons
                name={isNudgeOpen ? "chevron-up" : "chevron-down"}
                size={24}
                color="#1A1A1A"
              />
            </TouchableOpacity>
            {isNudgeOpen && (
              <View className="bg-white rounded-2xl mt-2 border border-[#F1F5F9] overflow-hidden shadow-sm">
                {NUDGE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => {
                      setNudgeFrequency(opt);
                      setIsNudgeOpen(false);
                    }}
                    className="px-5 py-5 border-b border-[#F8FAFC] flex-row items-center justify-between"
                  >
                    <Text
                      className={`text-base ${
                        nudgeFrequency === opt
                          ? "text-[#155D5F] font-bold"
                          : "text-[#64748B]"
                      }`}
                    >
                      {opt}
                    </Text>
                    {nudgeFrequency === opt && (
                      <Check size={20} color="#155D5F" strokeWidth={3} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text className="text-[10px] text-[#64748B] mt-2">
              Remind your members ahead
            </Text>
          </View>

          <View className="mb-10">
            <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
              Automatic Reminder Frequency
            </Text>
            <TextInput
              className="bg-[#F3F4F6] rounded-2xl h-16 px-5 text-[#1A1A1A] text-base"
              value={reminderInterval}
              onChangeText={setReminderInterval}
              placeholder="3 hours reminder interval"
              placeholderTextColor="#94A3B8"
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
    </SafeAreaView>
  );
}
