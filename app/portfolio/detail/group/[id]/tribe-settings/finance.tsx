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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY"];

export default function FinanceSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: group, isLoading } = useGetGroupDetailsQuery(id as string, {
    skip: !id,
  });
  const [updateSettings, { isLoading: isSaving }] = useUpdateGroupSettingsMutation();

  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (group) {
      const targetNaira = (parseFloat(group.targetAmount?.toString() || "0") / 100);
      setAmount(targetNaira > 0 ? targetNaira.toLocaleString() : "1,000,000");
      setFrequency(group.frequency || "MONTHLY");
    }
  }, [group]);

  const handleSave = async () => {
    const numeric = parseFloat(amount.replace(/,/g, ""));
    if (!numeric || numeric <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid target amount.");
      return;
    }

    try {
      const targetAmountKobo = Math.round(numeric * 100);
      await updateSettings({
        id: id as string,
        body: {
          targetAmount: targetAmountKobo,
          frequency: frequency as any,
        },
      }).unwrap();

      Alert.alert("Settings Saved", "Finance settings updated successfully.");
      router.back();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update finance settings.";
      Alert.alert("Update Failed", msg);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Finance" onBack={() => router.back()} />
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
      <Header title="Finance" onBack={() => router.back()} />

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 py-6">
            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Target Amount (₦)
              </Text>
              <TextInput
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 text-[#1A1A1A] text-base font-medium"
                value={amount}
                keyboardType="numeric"
                onChangeText={(v) => {
                  const num = v.replace(/\D/g, "");
                  setAmount(num ? parseInt(num).toLocaleString() : "");
                }}
              />
            </View>

            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Savings Frequency
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(!isOpen)}
                activeOpacity={1}
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] text-base capitalize">
                  {frequency.toLowerCase()}
                </Text>
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#1A1A1A"
                />
              </TouchableOpacity>

              {isOpen && (
                <View className="bg-white rounded-2xl mt-2 border border-[#F1F5F9] overflow-hidden shadow-sm">
                  {FREQUENCIES.map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => {
                        setFrequency(freq);
                        setIsOpen(false);
                      }}
                      className="px-5 py-4 border-b border-[#F8FAFC] flex-row items-center justify-between"
                    >
                      <Text
                        className={`text-base capitalize ${
                          frequency === freq
                            ? "text-[#155D5F] font-bold"
                            : "text-[#64748B]"
                        }`}
                      >
                        {freq.toLowerCase()}
                      </Text>
                      {frequency === freq && (
                        <Check size={18} color="#155D5F" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View className="px-5 pb-10">
          <ThemedButton
            title={isSaving ? "Saving..." : "Save"}
            onPress={handleSave}
            disabled={isSaving}
            style={{ backgroundColor: "#155D5F", borderRadius: 16, height: 60 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
