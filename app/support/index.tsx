import Header from "@/src/components/common/Header";
import { Text } from "@/src/components/common/ui/Text";
import { WiseUpSection } from "@/src/features/home/components/WiseUpSection";
import { PopularQuestionsSection } from "@/src/features/support/components/PopularQuestionsSection";
import { SupportOptionsSection } from "@/src/features/support/components/SupportOptionsSection";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportCenterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Customer Service Center" />
      <ScrollView
        contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <SupportOptionsSection loading={loading} />

        <View className="h-[1px] bg-[#E5E5E5] mb-6" />

        <PopularQuestionsSection loading={loading} />

        <WiseUpSection 
          hideViewAll={true} 
          containerClassName="mb-5" 
          scrollClassName="-mx-3 px-3" 
        />

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
