import Header from "@/src/components/common/Header";
import { openStore } from "@/src/constants/appLinks";
import { useSoftAppUpdate } from "@/src/hooks/useSoftAppUpdate";
import { getVersionLabel } from "@/src/utils/appInfo";
import { formatDeadlineDate, isFutureDate } from "@/src/utils/appVersion";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#155D5F";

export default function AboutScreen() {
  const {
    isUpdateAvailable,
    latestAppVersion,
    updateDeadline,
    isLoading,
    isError,
  } = useSoftAppUpdate();

  const versionLabel = getVersionLabel();
  const showStatusLine = !isLoading && !isError;

  const isDeadlineInFuture = isFutureDate(updateDeadline);
  const formattedDeadline = isDeadlineInFuture
    ? formatDeadlineDate(updateDeadline)
    : null;

  const handleUpdatePress = () => {
    openStore();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="About Wealthconomy" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
      >
        {/* Branding & Version Banner */}
        <View className="items-center my-6">
          <View className="w-24 h-24 bg-[#EEF7F8] rounded-2xl items-center justify-center mb-4">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 64, height: 64 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-[#1A1A1A] font-extrabold text-[22px] mb-1">
            Wealthconomy
          </Text>
          <View className="bg-[#E6F4F4] px-3 py-1 rounded-full mb-2">
            <Text className="text-[#155D5F] font-bold text-[12px]">
              Version {versionLabel}
            </Text>
          </View>
          <Text className="text-[#6B7280] text-[13px] text-center px-6 leading-[18px]">
            Empowering your financial growth through disciplined savings,
            structured investments, and community wealth building.
          </Text>
        </View>

        <View className="h-[1px] bg-gray-100 my-4" />

        {/* Legal & App Information */}
        <Text className="text-[#6B7280] font-extrabold text-[12px] uppercase tracking-wider mb-3 px-1">
          Legal & App Information
        </Text>

        <View className="bg-[#F8F9FA] rounded-[20px] p-2 border border-gray-100 mb-6">
          <AboutMenuItem
            icon={
              <MaterialCommunityIcons
                name="file-document-outline"
                size={22}
                color={TEAL}
              />
            }
            title="Terms & Conditions"
            subtitle="User agreement, rules, & service terms"
            onPress={() => router.push("/profile/terms" as any)}
          />

          <View className="h-[1px] bg-gray-200/50 mx-4" />

          <AboutMenuItem
            icon={
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={22}
                color={TEAL}
              />
            }
            title="Privacy Policy"
            subtitle="Security standards, data protection & privacy"
            onPress={() => router.push("/profile/privacy" as any)}
          />

          <View className="h-[1px] bg-gray-200/50 mx-4" />

          {/* App Version & Status Row */}
          <View className="p-4 rounded-2xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-10 h-10 bg-[#E6F4F4] rounded-xl items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    name="cellphone-cog"
                    size={22}
                    color={TEAL}
                  />
                </View>
                <Text className="text-[#1A1A1A] font-bold text-[15px]">
                  App version
                </Text>
              </View>
              <Text className="text-[#4B5563] font-semibold text-[14px]">
                {versionLabel}
              </Text>
            </View>

            {/* Status line below App version */}
            {showStatusLine && (
              <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  {isUpdateAvailable ? (
                    <>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#155D5F",
                          fontWeight: "600",
                          fontFamily: "KumbhSans_600SemiBold",
                        }}
                      >
                        Update available: version {latestAppVersion}
                      </Text>
                      {formattedDeadline && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#B45309",
                            fontWeight: "600",
                            fontFamily: "KumbhSans_600SemiBold",
                            marginTop: 2,
                          }}
                        >
                          Update by {formattedDeadline}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#166534",
                        fontWeight: "600",
                        fontFamily: "KumbhSans_600SemiBold",
                      }}
                    >
                      You're up to date
                    </Text>
                  )}
                </View>

                {isUpdateAvailable && (
                  <TouchableOpacity
                    onPress={handleUpdatePress}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: TEAL,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontWeight: "700",
                        fontSize: 13,
                        fontFamily: "KumbhSans_700Bold",
                      }}
                    >
                      Update
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AboutMenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center p-4 rounded-2xl active:bg-gray-100"
    >
      <View className="w-10 h-10 bg-[#E6F4F4] rounded-xl items-center justify-center mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[#1A1A1A] font-bold text-[15px] mb-0.5">
          {title}
        </Text>
        <Text className="text-[#6B7280] text-[12px] font-medium leading-[16px]">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

