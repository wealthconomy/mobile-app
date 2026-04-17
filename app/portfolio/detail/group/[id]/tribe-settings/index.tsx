import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../../../../src/components/common/Header";

const SETTING_ITEMS = [
  {
    id: "general",
    title: "General",
    icon: "people-outline",
    route: "general",
  },
  {
    id: "finance",
    title: "Finance",
    icon: "layers-outline",
    route: "finance",
  },
  {
    id: "membership",
    title: "Membership & Roles",
    icon: "people-circle-outline",
    route: "membership",
  },
  {
    id: "risk",
    title: "Risk & Discipline",
    icon: "warning-outline",
    route: "risk",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: "notifications-outline",
    route: "notifications",
  },
];

export default function TribeSettingsHubScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Tribe Settings" onBack={() => router.back()} />

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 py-6">
            <View className="space-y-4">
              {SETTING_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    router.push(
                      `/portfolio/detail/group/${id}/tribe-settings/${item.route}` as any,
                    )
                  }
                  className="flex-row items-center justify-between p-4 bg-white rounded-2xl mb-4 border border-[#F1F5F9]"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-[#F0F9F9]">
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color="#155D5F"
                      />
                    </View>
                    <Text className="text-[16px] font-semibold text-[#1A1A1A]">
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="px-5 pb-10">
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/portfolio/detail/group/${id}/tribe-settings/exit` as any,
              )
            }
            className="w-full h-16 bg-white border border-[#E2E8F0] rounded-3xl items-center justify-center"
          >
            <Text className="text-[#EF4444] font-bold text-base">
              Exit Group
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
