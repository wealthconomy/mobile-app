import React from "react";
import { View, Image, Linking } from "react-native";
import { useRouter } from "expo-router";
import HotlineIcon from "@/src/components/icons/HotlineIcon";
import LiveChatIcon from "@/src/components/icons/LiveChatIcon";
import SupportCard from "./SupportCard";

interface SupportOptionsSectionProps {
  loading?: boolean;
}

export const SupportOptionsSection = ({ loading }: SupportOptionsSectionProps) => {
  const router = useRouter();

  const handleCall = () => {
    Linking.openURL("tel:07032424294");
  };

  return (
    <View className="flex-row justify-between mb-6">
      <SupportCard
        title={"Customer Support\nHotline(24hours)"}
        subtitle="07032424294"
        onPress={handleCall}
        icon={<HotlineIcon />}
        loading={loading}
      />
      <SupportCard
        title="Live Chat"
        subtitle=""
        onPress={() => router.push("/support/chat" as any)}
        icon={<LiveChatIcon />}
        loading={loading}
        avatars={
          <View className="flex-row">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
              }}
              className="w-5 h-5 rounded-full border border-white"
            />
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
              }}
              className="w-5 h-5 rounded-full border border-white -ml-2"
            />
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
              }}
              className="w-5 h-5 rounded-full border border-white -ml-2"
            />
          </View>
        }
      />
    </View>
  );
};
