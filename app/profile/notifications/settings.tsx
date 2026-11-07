import Header from "@/src/components/common/Header";
import {
  useGetMyProfileQuery,
  useUpdateNotificationSettingsMutation,
} from "@/src/store/api/userApi";
import { getStoredFcmToken, getFcmToken } from "@/src/services/pushNotificationService";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettingsScreen() {
  const { data: response, isLoading } = useGetMyProfileQuery();
  const [updateSettings] = useUpdateNotificationSettingsMutation();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
  });

  useEffect(() => {
    // Fetch device token for display
    getStoredFcmToken().then((token) => {
      if (token) {
        setFcmToken(token);
      } else {
        getFcmToken().then((fresh) => setFcmToken(fresh));
      }
    });
  }, []);

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

  const handleCopyToken = async () => {
    if (fcmToken) {
      await Clipboard.setStringAsync(fcmToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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
          contentContainerStyle={{ paddingBottom: 40 }}
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

          {/* FCM Token Section for Direct Testing */}
          <View className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <Text className="text-[12px] font-bold text-gray-700 tracking-wider uppercase">
              Your Device FCM Token
            </Text>
            <Text className="text-[11px] text-gray-500 mt-1">
              Use this token in Firebase Console to send test notifications directly to this device.
            </Text>
            <View className="mt-3 p-2.5 bg-white rounded-xl border border-gray-200">
              <Text
                className="text-[11px] text-gray-600 font-mono"
                numberOfLines={3}
                selectable
              >
                {fcmToken || "Retrieving token..."}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyToken}
              disabled={!fcmToken}
              activeOpacity={0.8}
              className={`mt-3 py-2.5 px-4 rounded-xl items-center ${
                copied ? "bg-emerald-600" : "bg-[#155D5F]"
              }`}
            >
              <Text className="text-white text-[13px] font-semibold">
                {copied ? "✓ Copied to Clipboard!" : "Copy FCM Token"}
              </Text>
            </TouchableOpacity>
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
