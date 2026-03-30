import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface TodoCardProps {
  title: string;
  description: string;
  isComplete?: boolean;
}

const TodoCard = ({
  title,
  description,
  isComplete,
  icon,
}: TodoCardProps & { icon: React.ReactNode }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    className="rounded-[15px] p-4 mr-4 relative overflow-hidden"
    style={{
      width: 218,
      height: 91,
      backgroundColor: "#FFCF6533",
    }}
  >
    <View className="flex-row justify-between items-start mb-1">
      <Text
        className="text-[#1A1A1A] font-bold text-[14px] leading-tight flex-1 mr-2"
        numberOfLines={1}
      >
        {title}
      </Text>
      <View className="mt-[-2px]">{icon}</View>
    </View>
    <Text
      className="text-[#64748B] text-[10px] leading-[14px] font-medium pr-2"
      numberOfLines={2}
    >
      {description}
    </Text>

    {/* Optional status dot if not complete - using the design's red dot style but smaller */}
    {!isComplete && (
      <View
        className="absolute w-[10px] h-[10px] rounded-full bg-[#FF4B4B] border border-white"
        style={{ top: 2, right: 7 }} // Positioned as per the red dot in image roughly
      />
    )}
  </TouchableOpacity>
);

export const TodoSection = () => {
  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[#1A1A1A] font-bold text-lg">Todo</Text>
       
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 px-5"
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <TodoCard
          title="Proceed to level 2"
          description="Complete your KYC registration to enable withdrawal"
          isComplete={false}
          icon={<Ionicons name="id-card-outline" size={18} color="#1A1A1A" />}
        />
        <TodoCard
          title="Set your first Goal"
          description="Build the discipline to reach your financial goals"
          isComplete={false}
          icon={<Ionicons name="flag-outline" size={18} color="#1A1A1A" />}
        />
        <TodoCard
          title="Verify your email"
          description="Secure your account by verifying your email address"
          isComplete={true}
          icon={<Ionicons name="mail-outline" size={18} color="#1A1A1A" />}
        />
      </ScrollView>
    </View>
  );
};
