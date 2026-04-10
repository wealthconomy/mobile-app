import Header from "@/src/components/common/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useState } from "react";

export default function SecurityScreen() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = () => {
    // Simulate deletion and navigate to login
    setShowDeleteModal(false);
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Security Settings" />

      <ScrollView
        className="flex-1 px-5 pt-8"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View
          className="bg-white rounded-[20px] justify-center"
          style={{ width: 367, height: 456, alignSelf: "center" }}
        >
          <View className="gap-y-[10px]">
            <MenuItem
              title="Add BVN"
              icon={
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={24}
                  color="#155D5F"
                />
              }
              onPress={() => router.push("/profile/security/add-bvn")}
            />
            <MenuItem
              title="Add NIN"
              icon={<Ionicons name="finger-print" size={24} color="#155D5F" />}
              onPress={() => router.push("/profile/security/add-nin")}
            />
            <MenuItem
              title="Verify Address"
              icon={
                <Ionicons name="location-outline" size={24} color="#155D5F" />
              }
              onPress={() => router.push("/profile/security/verify-address")}
            />
            <MenuItem
              title="Change Password"
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color="#155D5F"
                />
              }
              onPress={() => router.push("/profile/security/change-password")}
            />
            <MenuItem
              title="Change PIN"
              icon={
                <Ionicons name="keypad-outline" size={24} color="#155D5F" />
              }
              onPress={() => router.push("/profile/security/change-pin")}
            />
            <MenuItem
              title="Enable Face ID"
              icon={
                <MaterialCommunityIcons
                  name="face-recognition"
                  size={24}
                  color="#155D5F"
                />
              }
              onPress={() => router.push("/profile/security/enable-face-id")}
            />
            <MenuItem
              title="Delete your Account"
              titleColor="#CA1212"
              icon={
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={24}
                  color="#CA1212"
                />
              }
              onPress={() => setShowDeleteModal(true)}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-[24px] p-6 w-full max-w-[340px] items-center">
            <View className="w-16 h-16 bg-red-50 rounded-full justify-center items-center mb-4">
              <MaterialCommunityIcons
                name="alert-outline"
                size={32}
                color="#CA1212"
              />
            </View>
            <Text className="text-[20px] font-bold text-[#323232] text-center mb-2">
              Delete Account
            </Text>
            <Text className="text-[15px] text-[#666] text-center mb-8 leading-5">
              Are you sure you want to delete your account? This action is
              irreversible and all your data will be permanently removed.
            </Text>

            <View className="w-full gap-y-3">
              <TouchableOpacity
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
                className="bg-[#CA1212] py-4 rounded-xl items-center w-full"
              >
                <Text className="text-white font-bold text-[16px]">
                  Yes, Delete Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.7}
                className="bg-[#F3F4F6] py-4 rounded-xl items-center w-full"
              >
                <Text className="text-[#323232] font-semibold text-[16px]">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const MenuItem = ({ title, icon, onPress, titleColor }: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center justify-between bg-[#F8F8F8] px-[10px] rounded-[10px]"
    style={{ width: 367, height: 55, paddingVertical: 15 }}
  >
    <View className="flex-row items-center">
      <View className="mr-3">{icon}</View>
      <Text
        className="text-[15px] font-bold"
        style={{ color: titleColor || "#323232" }}
      >
        {title}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);
