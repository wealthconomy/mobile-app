import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface TodoCardProps {
  title: string;
  description: string;
  isComplete?: boolean;
}

const TodoCard = ({ title, description, isComplete }: TodoCardProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    className="bg-[#FFF8E6] rounded-3xl p-5 mr-4 border border-[#FFE7A3] relative overflow-hidden w-[240px] h-[100px]"
  >
    <View className="flex-row items-start space-x-3 mb-2">
      <View className="flex-1">
        <Text
          className="text-[#1A1A1A] font-bold text-sm leading-tight mb-1"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="text-[#6B7280] text-[10px] leading-[14px] pr-6"
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
      <View className="bg-white p-2 rounded-xl border border-gray-100">
        <Image
          source={require("../../../../assets/images/wallet.png")}
          className="w-5 h-5 opacity-60"
          resizeMode="contain"
        />
      </View>
    </View>

    {/* Status Indicator Dot */}
    {!isComplete && (
      <View className="absolute top-0 right-10 w-4 h-4 rounded-full bg-rose-500 border-2 border-white" />
    )}
  </TouchableOpacity>
);

export const TodoSection = () => {
  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[#1A1A1A] font-bold text-lg">Todo</Text>
        <TouchableOpacity>
          <Text className="text-[#155D5F] text-sm font-medium">View all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 px-5"
      >
        <TodoCard
          title="Proceed to level 2"
          description="Complete your KYC registration to enable withdrawal"
        />
        <TodoCard
          title="Set your first Goal"
          description="Build the discipline to reach your financial goals"
          isComplete={false}
        />
      </ScrollView>
    </View>
  );
};
