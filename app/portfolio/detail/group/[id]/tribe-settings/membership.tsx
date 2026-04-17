import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { RootState } from "@/src/store";
import { WealthGroup } from "@/src/store/slices/wealthGroupSlice";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
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

export default function MembershipRolesScreen() {
  const { id } = useLocalSearchParams();
  const groups = useSelector((state: RootState) => state.wealthGroup.groups);

  const group = useMemo(() => {
    return groups.find((g: WealthGroup) => g.id === id) || ({} as WealthGroup);
  }, [id, groups]);

  const [limit, setLimit] = useState(
    group.memberLimit?.toString() || "60 members",
  );
  const [adminsCount, setAdminsCount] = useState(4); // Placeholder for admin count

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Membership & Roles" onBack={() => router.back()} />

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 py-6">
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[14px] font-medium text-[#155D5F]">
                  Members Limit
                </Text>
                <Text className="text-[10px] text-[#64748B]">200 maximum</Text>
              </View>
              <TextInput
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 text-[#1A1A1A] text-base font-medium"
                value={limit}
                onChangeText={setLimit}
                placeholder="e.g. 100 members"
              />
              <Text className="text-[10px] text-[#64748B] mt-2">
                55 Members
              </Text>
            </View>

            <View className="mb-8">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Role Management
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname:
                      "/portfolio/detail/group/[id]/tribe-settings/members-list",
                    params: { id },
                  })
                }
                activeOpacity={1}
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] text-base">
                  {adminsCount} admins
                </Text>
                <Ionicons name="people-outline" size={24} color="#1A1A1A" />
              </TouchableOpacity>
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
