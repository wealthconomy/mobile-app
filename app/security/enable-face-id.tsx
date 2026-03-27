import Header from "@/src/components/common/Header";
import { useState } from "react";
import { StatusBar, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EnableFaceIDScreen() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Enable Face ID" />

      <View className="flex-1 px-5 pt-8">
        <Text className="text-[18px] font-extrabold text-[#323232] mb-6">
          Enable Face ID
        </Text>

        <View className="flex-row items-center justify-between py-4 border-b border-[#F3F4F6]">
          <Text className="text-[15px] font-medium text-[#6B7280]">
            Face ID
          </Text>
          <Switch
            trackColor={{ false: "#E5E7EB", true: "#155D5F" }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E7EB"
            onValueChange={setIsEnabled}
            value={isEnabled}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
