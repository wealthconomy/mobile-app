import Header from "@/src/components/common/Header";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StatusBar, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useGetMyProfileQuery, useToggleBiometricsMutation } from "@/src/store/api/userApi";

export default function EnableFaceIDScreen() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: profileData } = useGetMyProfileQuery();
  const [toggleBiometrics, { isLoading }] = useToggleBiometricsMutation();

  const currentBiometricsEnabled = Boolean(
    profileData?.data?.biometricsEnabled ?? authUser?.biometricsEnabled ?? false
  );

  const [isEnabled, setIsEnabled] = useState(currentBiometricsEnabled);

  useEffect(() => {
    setIsEnabled(currentBiometricsEnabled);
  }, [currentBiometricsEnabled]);

  const handleValueChange = async (value: boolean) => {
    setIsEnabled(value);
    try {
      await toggleBiometrics({ biometricsEnabled: value }).unwrap();
      Alert.alert(
        "Success",
        value
          ? "Biometric authentication enabled successfully!"
          : "Biometric authentication disabled."
      );
    } catch (err: any) {
      setIsEnabled(!value);
      Alert.alert("Error", err?.data?.message || "Could not update biometric setting");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Enable Biometrics" />

      <View className="flex-1 px-5 pt-8">
        <Text className="text-[18px] font-extrabold text-[#323232] mb-2">
          Biometric Security
        </Text>
        <Text className="text-[14px] text-[#6B7280] mb-6">
          Use Face ID or Fingerprint for quick and secure account access.
        </Text>

        <View className="flex-row items-center justify-between py-4 border-b border-[#F3F4F6]">
          <Text className="text-[15px] font-medium text-[#323232]">
            Biometric Login
          </Text>
          {isLoading ? (
            <ActivityIndicator color="#155D5F" size="small" />
          ) : (
            <Switch
              trackColor={{ false: "#E5E7EB", true: "#155D5F" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
              onValueChange={handleValueChange}
              value={isEnabled}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

