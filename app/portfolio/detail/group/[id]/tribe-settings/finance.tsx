import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { RootState } from "@/src/store";
import { WealthGroup } from "@/src/store/slices/wealthGroupSlice";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function FinanceSettingsScreen() {
  const { id } = useLocalSearchParams();
  const groups = useSelector((state: RootState) => state.wealthGroup.groups);

  const group = useMemo(() => {
    return groups.find((g: WealthGroup) => g.id === id) || ({} as WealthGroup);
  }, [id, groups]);

  const [amount, setAmount] = useState(
    group.amount ? `₦${group.amount.toLocaleString()}` : "₦300,500,000.00",
  );
  const [frequency, setFrequency] = useState(group.frequency || "Weekly");
  const [isOpen, setIsOpen] = useState(false);

  const formatAmount = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric) return "₦";
    const formatted = parseInt(numeric).toLocaleString();
    return `₦${formatted}`;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Finance" onBack={() => router.back()} />

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 py-6">
            <Text className="text-[12px] font-medium text-[#155D5F] mb-6">
              Wealth earn ₦4,697.69/weeks
            </Text>

            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Target Amount(₦)
              </Text>
              <TextInput
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 text-[#1A1A1A] text-base font-medium"
                value={amount}
                onChangeText={(t) => setAmount(formatAmount(t))}
                keyboardType="numeric"
                placeholder="₦0.00"
              />
            </View>

            <View className="mb-8">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Contribution Frequency
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(!isOpen)}
                activeOpacity={1}
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] text-base">{frequency}</Text>
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#1A1A1A"
                />
              </TouchableOpacity>
              {isOpen && (
                <View className="bg-white rounded-2xl mt-2 border border-[#F1F5F9] overflow-hidden shadow-sm">
                  {["Daily", "Weekly", "Monthly"].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => {
                        setFrequency(opt);
                        setIsOpen(false);
                      }}
                      className="px-5 py-5 border-b border-[#F8FAFC] flex-row items-center justify-between"
                    >
                      <Text
                        className={`text-base ${
                          frequency === opt
                            ? "text-[#155D5F] font-bold"
                            : "text-[#64748B]"
                        }`}
                      >
                        {opt}
                      </Text>
                      {frequency === opt && (
                        <Check size={20} color="#155D5F" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <ThemedButton
              title="Save"
              onPress={() => router.back()}
              style={{
                backgroundColor: "#155D5F",
                borderRadius: 16,
                height: 64,
                marginTop: 20,
              }}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
