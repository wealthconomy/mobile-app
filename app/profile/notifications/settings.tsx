import Header from "@/src/components/common/Header";
import { useState } from "react";
import { ScrollView, StatusBar, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettingsScreen() {
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
      <Header title="Notification" />

      {/* Settings Options */}
      <ScrollView
        className="flex-1 px-5 mt-5"
        showsVerticalScrollIndicator={false}
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
    <Text className="text-[16px] font-medium text-[#4B5563]">{label}</Text>
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
