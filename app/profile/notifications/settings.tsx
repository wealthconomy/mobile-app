import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    mute: false,
    wiseUp: false,
    ads: false,
  });

  const toggleSwitch = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Custom Left-Aligned Header */}
      <View className="px-4 h-14 justify-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <Ionicons name="chevron-back" size={32} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="px-5 mb-10 mt-2">
        <Text className="text-[28px] font-extrabold text-[#323232] tracking-tight">
          Notification
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="gap-y-6">
          <SettingItem
            label="Mute Notifications"
            value={settings.mute}
            onToggle={() => toggleSwitch("mute")}
          />
          <SettingItem
            label="Wise Up Notifications"
            value={settings.wiseUp}
            onToggle={() => toggleSwitch("wiseUp")}
          />
          <SettingItem
            label="Ads Notifications"
            value={settings.ads}
            onToggle={() => toggleSwitch("ads")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingItem = ({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) => (
  <View className="flex-row items-center justify-between py-2">
    <Text className="text-[15px] font-medium text-[#6B7280]">{label}</Text>
    <Switch
      trackColor={{ false: "#E5E7EB", true: "#155D5F" }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#E5E7EB"
      onValueChange={onToggle}
      value={value}
      style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
    />
  </View>
);
