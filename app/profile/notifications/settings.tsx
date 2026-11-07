import Header from "@/src/components/common/Header";
import {
  useGetMyProfileQuery,
  useUpdateNotificationSettingsMutation,
} from "@/src/store/api/userApi";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettingsScreen() {
  const { data: response, isLoading } = useGetMyProfileQuery();
  const [updateSettings] = useUpdateNotificationSettingsMutation();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
  });

  useEffect(() => {
    if (response?.data) {
      setSettings({
        pushNotifications: response.data.pushNotifications ?? true,
        emailNotifications: response.data.emailNotifications ?? true,
        inAppNotifications: response.data.inAppNotifications ?? true,
      });
    }
  }, [response]);

  const toggleSwitch = async (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await updateSettings(updated).unwrap();
    } catch (err) {
      console.warn("Failed to update notification setting:", err);
      // Revert if failed
      setSettings(settings);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <Header title="Notification Settings" />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#155D5F" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 mt-5"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-y-6">
            <SettingItem
              label="Push Notifications"
              description="Receive alerts and updates directly on your device"
              value={settings.pushNotifications}
              onToggle={() => toggleSwitch("pushNotifications")}
            />
            <SettingItem
              label="In-App Notifications"
              description="Receive notices in the notifications inbox"
              value={settings.inAppNotifications}
              onToggle={() => toggleSwitch("inAppNotifications")}
            />
            <SettingItem
              label="Email Notifications"
              description="Receive email summaries of transactions and activities"
              value={settings.emailNotifications}
              onToggle={() => toggleSwitch("emailNotifications")}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const SettingItem = ({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
}) => (
  <View className="flex-row items-center justify-between py-2 border-b border-gray-100 pb-4">
    <View className="flex-1 pr-4">
      <Text className="text-[16px] font-medium text-[#111827]">{label}</Text>
      {description && (
        <Text className="text-[13px] text-[#6B7280] mt-0.5">{description}</Text>
      )}
    </View>
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
