import Skeleton from "@/src/components/common/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SUPPORT_FAQS } from "./index";

export default function FAQDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);

  const faq = SUPPORT_FAQS.find((f) => f.id === id) || SUPPORT_FAQS[0];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <View className="flex-row items-center px-4 h-14">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-base font-bold text-black">
            Popular Questions
          </Text>
        </View>
        <View className="w-11" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="space-y-4 mb-10">
            <Skeleton width="90%" height={28} />
            <View className="space-y-2">
              <Skeleton width="100%" height={16} />
              <Skeleton width="100%" height={16} />
              <Skeleton width="100%" height={16} />
              <Skeleton width="70%" height={16} />
            </View>
          </View>
        ) : (
          <>
            <Text className="text-[22px] font-extrabold text-[#155D5F] leading-7 mb-6">
              {faq.question}
            </Text>
            <Text className="text-[15px] text-[#6B7280] leading-6 mb-10">
              {faq.answer}
            </Text>
          </>
        )}

        <View className="mt-5">
          <Text className="text-base font-extrabold text-[#323232] mb-4">
            Related Questions
          </Text>
          <View className="bg-[#F0F9F9] rounded-[20px] p-6">
            {loading ? (
              <View className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} width="85%" height={16} />
                ))}
              </View>
            ) : (
              SUPPORT_FAQS.map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setLoading(true);
                    router.setParams({ id: item.id });
                  }}
                >
                  <Text className="text-sm text-[#408688] font-semibold mb-5 leading-5">
                    {i + 1}. {item.question}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
