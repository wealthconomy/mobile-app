import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/src/components/common/ui/Text";
import { Skeleton } from "@/src/components/common/skeletons";
import { SUPPORT_FAQS } from "../constants";

interface PopularQuestionsSectionProps {
  loading?: boolean;
}

export const PopularQuestionsSection = ({ loading }: PopularQuestionsSectionProps) => {
  const router = useRouter();

  return (
    <View className="mb-8">
      <Text variant="h3" className="font-kumbh-extrabold mb-4">
        Popular Questions
      </Text>
      <View className="bg-[#F0F9F9] rounded-[20px] p-6">
        {loading ? (
          <View>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} width="90%" height={16} style={{ marginBottom: 16 }} />
            ))}
          </View>
        ) : (
          SUPPORT_FAQS.map((faq, i) => (
            <TouchableOpacity
              key={faq.id}
              onPress={() =>
                router.push({
                  pathname: "/support/faq",
                  params: { id: faq.id },
                } as any)
              }
            >
              <Text
                variant="caption"
                className="text-[#408688] font-kumbh-semibold mb-5 leading-5"
              >
                {i + 1}. {faq.question}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};
